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
const {
  startMouseCheck,
  startGravity,
  stopGravity,
  toggleGravity,
} = require("./gravity.js");
const { createDuplicateWindow } = require("./duplicate.js");

let tray = null;
let mainWindow;
let settingsWindow = null;
let duplicateWindows = [];

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
  startMouseCheck(mainWindow, screen);
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.on("blur", () => {
    if (!duplicateWindows.some((win) => win.isFocused())) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    }
  });

  mainWindow.on("focus", () => {
    mainWindow.setIgnoreMouseEvents(false);
  });

  mainWindow.on("closed", () => stopGravity());
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
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, "settings.html"));
  settingsWindow.on("closed", () => (settingsWindow = null));
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "app-icon.png");
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 16, height: 16 });

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Settings", click: () => openSettingsWindow() },
    { label: "Flip Pet", click: () => flipAllPets() },
    { label: "Duplicate Pet", click: () => duplicatePet() },
    { label: "Toggle Gravity", click: () => toggleGravity() },
    { label: "Show All Pets", click: () => showAllPets() },
    { label: "Hide All Pets", click: () => hideAllPets() },
    { type: "separator" },
    { label: "Quit", role: "quit" },
  ]);

  tray.setToolTip("Vixie - Your Desktop Pet");
  tray.setContextMenu(contextMenu);
}

function flipAllPets() {
  [mainWindow, ...duplicateWindows].forEach((win) => {
    if (win) win.webContents.send("flip-pet");
  });
}

function duplicatePet() {
  const newWindow = createDuplicateWindow();
  duplicateWindows.push(newWindow);

  newWindow.on("focus", () => {
    newWindow.setIgnoreMouseEvents(false);
  });

  newWindow.on("blur", () => {
    newWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  newWindow.on("closed", () => {
    duplicateWindows = duplicateWindows.filter((win) => win !== newWindow);
  });
}

function showAllPets() {
  [mainWindow, ...duplicateWindows].forEach((win) => win && win.show());
}

function hideAllPets() {
  [mainWindow, ...duplicateWindows].forEach((win) => win && win.hide());
}

ipcMain.on("mouse-enter", () => {
  if (!isMouseInside) {
    isMouseInside = true;
    stopGravity();
  }
});

ipcMain.on("mouse-leave", () => {
  if (isMouseInside) {
    isMouseInside = false;
    if (gravityEnabled) startGravity(mainWindow, screen);
  }
});

ipcMain.on("update-gif", (event, gifUrl) => {
  [mainWindow, ...duplicateWindows].forEach((win) => {
    if (win) {
      win.webContents.send("update-gif", gifUrl);
    }
  });
  console.log(`GIF updated to: ${gifUrl}`);
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("before-quit", () => stopGravity());
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
