const { BrowserWindow } = require("electron");
const path = require("path");
const sizeOf = require("image-size");

const imagePath = path.join(__dirname, "assets/celebi.gif");
const { width, height } = sizeOf(imagePath);

function createDuplicateWindow() {
  const aspectRatio = width / height;

  const duplicateWindow = new BrowserWindow({
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

  duplicateWindow.loadFile(path.join(__dirname, "index.html"));

  // Apply the same behavior
  duplicateWindow.setIgnoreMouseEvents(false);

  duplicateWindow.on("will-resize", (event, newBounds) => {
    const { width, height } = newBounds;
    const newHeight = Math.round(width / aspectRatio);
    const newWidth = Math.round(height * aspectRatio);

    if (width / height > aspectRatio) {
      event.preventDefault();
      duplicateWindow.setBounds({ width: newWidth, height });
    } else {
      event.preventDefault();
      duplicateWindow.setBounds({ width, height: newHeight });
    }
  });

  return duplicateWindow;
}

module.exports = { createDuplicateWindow };
