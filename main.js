const { app, BrowserWindow } = require("electron");
const path = require("path");

const width = 200;
const height = 200;

function createWindow() {
  const win = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false, // Removes the default OS frame
    alwaysOnTop: true,
    resizable: false, // Prevent resizing
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));

  // Ensure the window allows interaction and dragging
  win.setIgnoreMouseEvents(false);
}

app.whenReady().then(createWindow);
