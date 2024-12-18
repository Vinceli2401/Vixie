const { app, BrowserWindow } = require("electron");
const path = require("path");
const sizeOf = require("image-size");
const imagePath = path.join(__dirname, "assets/celebi.gif");
const { width, height } = sizeOf(imagePath);

function createWindow() {
  const aspectRatio = width / height;

  const win = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  win.on("will-resize", (event, newBounds) => {
    const { width, height } = newBounds;
    const newHeight = Math.round(width / aspectRatio);
    const newWidth = Math.round(height * aspectRatio);

    if (width / height > aspectRatio) {
      event.preventDefault();
      win.setBounds({ width: newWidth, height });
    } else {
      event.preventDefault();
      win.setBounds({ width, height: newHeight });
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);
