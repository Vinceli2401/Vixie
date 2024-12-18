const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
} = require("electron");
const path = require("path");

let tray = null;
let mainWindow;
let settingsWindow;

// Main window: index.html
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

// Setting window: setting.html
function openSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 550,
    height: 550, // Increased height
    title: "Settings",
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, "settings.html"));
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "app-icon.png");
  const icon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 16, height: 16 });
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Settings", click: () => openSettingsWindow() },
    { label: "Flip", click: () => flipPet() },
    { label: "Show Pet", click: () => mainWindow.show() },
    { label: "Hide Pet", click: () => mainWindow.hide() },
    { type: "separator" },
    { label: "Quit", role: "quit" },
  ]);

  tray.setToolTip("Vixie - Your Desktop Pet");
  tray.setContextMenu(contextMenu);
}

// Horizontal flip
function flipPet() {
  if (mainWindow) {
    mainWindow.webContents.send("flip-pet");
  }
}

// Listen for updates from settings
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
