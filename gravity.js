let gravityEnabled = false;
let gravityInterval = null;
let mouseCheckInterval = null;
let isMouseInside = false;

function startMouseCheck(mainWindow, screen) {
  mouseCheckInterval = setInterval(() => {
    const cursorPos = screen.getCursorScreenPoint();
    const windowBounds = mainWindow.getBounds();

    const isInside =
      cursorPos.x >= windowBounds.x &&
      cursorPos.x <= windowBounds.x + windowBounds.width &&
      cursorPos.y >= windowBounds.y &&
      cursorPos.y <= windowBounds.y + windowBounds.height;

    if (isInside && !isMouseInside) {
      console.log("Mouse entered the window.");
      isMouseInside = true;
      stopGravity();
    } else if (!isInside && isMouseInside) {
      console.log("Mouse left the window.");
      isMouseInside = false;

      if (gravityEnabled) {
        startGravity(mainWindow, screen);
      }
    }
  }, 100); // Check every 100ms
}

function startGravity(mainWindow, screen) {
  if (gravityInterval || !gravityEnabled || isMouseInside) return;

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

function toggleGravity() {
  gravityEnabled = !gravityEnabled;
  console.log(`Gravity ${gravityEnabled ? "enabled" : "disabled"}`);
}

module.exports = {
  startMouseCheck,
  startGravity,
  stopGravity,
  toggleGravity,
};
