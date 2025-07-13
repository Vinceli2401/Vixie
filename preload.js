const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  updateGif: (gifUrl) => ipcRenderer.send('update-gif', gifUrl),
  mouseEnter: () => ipcRenderer.send('mouse-enter'),
  mouseLeave: () => ipcRenderer.send('mouse-leave'),
  onFlipPet: (callback) => ipcRenderer.on('flip-pet', callback),
  onUpdateGif: (callback) => ipcRenderer.on('update-gif', callback),
  onSetCurrentGif: (callback) => ipcRenderer.on('set-current-gif', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});