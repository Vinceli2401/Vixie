const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 300,
    transparent: true, // Make the window background transparent
    frame: false, // Remove window frame
    alwaysOnTop: true, // Keep the window on top
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setIgnoreMouseEvents(true); // Makes the window "click-through"
  win.loadFile("index.html"); // Load the frontend file
}

app.whenReady().then(createWindow);
