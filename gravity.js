let gravityEnabled = false;
let gravityInterval = null;
let mouseCheckInterval = null;
let isMouseInside = false;

function startMouseCheck(mainWindow, screen) {
  stopMouseCheck();

  mouseCheckInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      stopMouseCheck();
      return;
    }

    const cursorPos = screen.getCursorScreenPoint();
    const windowBounds = mainWindow.getBounds();

    const isInside =
      cursorPos.x >= windowBounds.x &&
      cursorPos.x <= windowBounds.x + windowBounds.width &&
      cursorPos.y >= windowBounds.y &&
      cursorPos.y <= windowBounds.y + windowBounds.height;

    if (isInside && !isMouseInside) {
      // console.log("Mouse entered the window.");
      isMouseInside = true;
      stopGravity();
    } else if (!isInside && isMouseInside) {
      // console.log("Mouse left the window.");
      isMouseInside = false;

      if (gravityEnabled) {
        startGravity(mainWindow, screen);
      }
    }
  }, 100); // Check every 100ms
}

function startGravity(mainWindow, screen) {
  if (gravityInterval || !gravityEnabled || isMouseInside || !mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  stopGravity();
  
  gravityInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      stopGravity();
      return;
    }

    try {
      const bounds = mainWindow.getBounds();
      const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;

      if (bounds.y + bounds.height < screenHeight) {
        bounds.y += 8;
        mainWindow.setBounds({
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        });
      } else {
        stopGravity();
      }
    } catch (error) {
      stopGravity();
    }
  }, 16);
}

function stopGravity() {
  if (gravityInterval) {
    clearInterval(gravityInterval);
    gravityInterval = null;
    // console.log("Gravity stopped.");
  }
}

function stopMouseCheck() {
  if (mouseCheckInterval) {
    clearInterval(mouseCheckInterval);
    mouseCheckInterval = null;
    // console.log("Mouse check stopped.");
  }
}

function toggleGravity(mainWindow, screen) {
  if (gravityEnabled) {
    stopGravity();
    gravityEnabled = false;
    //  console.log("Gravity disabled");
  } else {
    gravityEnabled = true;
    // console.log("Gravity enabled");
    if (!isMouseInside) startGravity(mainWindow, screen);
  }
}

function cleanUp() {
  stopMouseCheck();
  stopGravity();
  gravityEnabled = false;
  isMouseInside = false;
}

module.exports = {
  startMouseCheck,
  startGravity,
  stopGravity,
  toggleGravity,
  cleanUp,
};
