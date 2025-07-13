const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  screen,
  ipcMain,
} = require("electron");
const path = require("path");
const {
  startMouseCheck,
  stopGravity,
  toggleGravity,
  cleanUp,
} = require("./gravity.js");

let tray = null;
let mainWindow;
let settingsWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 200,
    height: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  startMouseCheck(mainWindow, screen);

  mainWindow.on("blur", () => {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  mainWindow.on("focus", () => {
    mainWindow.setIgnoreMouseEvents(false);
  });

  mainWindow.on("close", () => {
    cleanUp();
    mainWindow = null;
  });
}

function openSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 550,
    height: 550,
    title: "Settings",
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  settingsWindow.loadFile(path.join(__dirname, "settings.html"));

  // Send updated GIF URL back to main window
  settingsWindow.webContents.once("did-finish-load", () => {
    if (mainWindow && !mainWindow.isDestroyed() && settingsWindow && !settingsWindow.isDestroyed()) {
      mainWindow.webContents.executeJavaScript('document.getElementById("pet").src')
        .then(src => {
          if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.webContents.send("set-current-gif", src);
          }
        })
        .catch(() => {
          if (settingsWindow && !settingsWindow.isDestroyed()) {
            settingsWindow.webContents.send("set-current-gif", "https://play.pokemonshowdown.com/sprites/ani-shiny/victini.gif");
          }
        });
    }
  });

  settingsWindow.on("closed", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.removeAllListeners();
    }
    settingsWindow = null;
  });
}

function flipPet() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("flip-pet");
  }
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "app-icon.png");
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 16, height: 16 });

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Settings", click: () => openSettingsWindow() },
    { label: "Flip Pet", click: () => flipPet() },
    { label: "Toggle Gravity", click: () => toggleGravity(mainWindow, screen) },
    { label: "Show Pet", click: () => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show(); } },
    { label: "Hide Pet", click: () => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide(); } },
    { type: "separator" },
    { label: "Quit", role: "quit" },
  ]);

  tray.setToolTip("Vixie - Your Desktop Pet");
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("before-quit", () => {
  cleanUp(); // Ensure all intervals are cleaned
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

/**
 * IPC Logic to change GIF
 */
ipcMain.on("update-gif", (event, newGifUrl) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-gif", newGifUrl);
  }
});


ipcMain.on("mouse-enter", () => {
  stopGravity();
});

ipcMain.on("mouse-leave", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const { startGravity } = require("./gravity.js");
    startGravity(mainWindow, screen);
  }
});
