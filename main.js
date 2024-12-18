const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  screen,
} = require("electron");
const path = require("path");

let tray = null;
let mainWindow;
let settingsWindow;
let gravityEnabled = false;
let gravityInterval = null;

// Main Window: Vixie
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
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

// Settings Window
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
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, "settings.html"));

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

// Tray and Menu
function createTray() {
  const iconPath = path.join(__dirname, "assets", "app-icon.png");
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 16, height: 16 });

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Settings", click: () => openSettingsWindow() },
    { label: "Flip Pet", click: () => flipPet() },
    { label: "Toggle Gravity", click: () => toggleGravity() },
    { label: "Show Pet", click: () => mainWindow.show() },
    { label: "Hide Pet", click: () => mainWindow.hide() },
    { type: "separator" },
    { label: "Quit", role: "quit" },
  ]);

  tray.setToolTip("Vixie - Your Desktop Pet");
  tray.setContextMenu(contextMenu);
}

// Flip Pet Logic
function flipPet() {
  if (mainWindow) {
    mainWindow.webContents.send("flip-pet");
  }
}

// Gravity Logic
function toggleGravity() {
  gravityEnabled = !gravityEnabled;

  if (gravityEnabled) {
    startGravity();
  } else {
    stopGravity();
  }
}

function startGravity() {
  const bounds = mainWindow.getBounds();
  const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;

  gravityInterval = setInterval(() => {
    if (bounds.y + bounds.height < screenHeight) {
      bounds.y += 10;
      mainWindow.setBounds(bounds);
    } else {
      stopGravity();
    }
  }, 50);
}

function stopGravity() {
  if (gravityInterval) {
    clearInterval(gravityInterval);
    gravityInterval = null;
  }
}

// IPC for GIF Updates
ipcMain.on("update-gif", (event, gifUrl) => {
  if (mainWindow) {
    mainWindow.webContents.send("set-gif", gifUrl);
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
