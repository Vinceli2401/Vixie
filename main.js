const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron");
const path = require("path");

let tray = null; // Declare tray globally
let mainWindow;

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

function createTray() {
  const iconPath = path.join(__dirname, "assets/app-icon.png");
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 16, height: 16 });
  icon.setTemplateImage(true);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Settings", click: () => openSettingsWindow() },
    { label: "Show Pet", click: () => mainWindow.show() },
    { label: "Hide Pet", click: () => mainWindow.hide() },
    { type: "separator" },
    { label: "Quit", role: "quit" },
  ]);

  tray.setToolTip("Vixie - Your Desktop Pet");
  tray.setContextMenu(contextMenu);
}

function openSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Settings",
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  settingsWindow.loadFile(path.join(__dirname, "settings.html"));
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
