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
let gravityEnabled = false;
let gravityInterval = null;
let mouseCheckInterval = null;
let isMouseInside = false;

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
  startMouseCheck();
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.on("blur", () => {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  mainWindow.on("focus", () => {
    mainWindow.setIgnoreMouseEvents(false);
  });

  mainWindow.on("closed", () => stopGravity());
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
  settingsWindow.on("closed", () => (settingsWindow = null));
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
    mouseTrackingEnabled = true;
    if (!isMouseInside) startGravity();
  } else {
    mouseTrackingEnabled = false;
    stopGravity();
  }
}

function startMouseCheck() {
  mouseCheckInterval = setInterval(() => {
    const cursorPos = screen.getCursorScreenPoint();
    const windowBounds = mainWindow.getBounds();

    const isInside =
      cursorPos.x >= windowBounds.x &&
      cursorPos.x <= windowBounds.x + windowBounds.width &&
      cursorPos.y >= windowBounds.y &&
      cursorPos.y <= windowBounds.y + windowBounds.height;

    if (isInside && !isMouseInside) {
      console.log("Mouse entered the window (main process).");
      isMouseInside = true;
      mainWindow.setIgnoreMouseEvents(false); // Enable mouse interaction
      stopGravity();
    } else if (!isInside && isMouseInside) {
      console.log("Mouse left the window (main process).");
      isMouseInside = false;
      mainWindow.setIgnoreMouseEvents(true, { forward: true }); // Disable mouse interaction
      startGravity();
    }
  }, 100); // Check every 100ms
}

function startGravity() {
  if (gravityInterval) return;

  gravityInterval = setInterval(() => {
    const bounds = mainWindow.getBounds();
    const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;

    if (bounds.y + bounds.height < screenHeight) {
      bounds.y += 8; // Smooth descent
      mainWindow.setBounds(bounds);
    }
  }, 16); // 60 FPS
}

function stopGravity() {
  if (gravityInterval) {
    clearInterval(gravityInterval);
    gravityInterval = null;
    console.log("Gravity stopped.");
  }
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
    if (gravityEnabled && mouseTrackingEnabled) startGravity();
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("before-quit", () => stopGravity());
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
