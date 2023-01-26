const { ipcRenderer, contextBridge } = require("electron");

console.log("preload loaded")

const _util = {
    log: (text: string) => { ipcRenderer.send("log", text) },
}

const _window = {
    close: () => { ipcRenderer.send("window/close") },
}

const _mouse = {
    move: (position: {x: number, y: number}) => { ipcRenderer.send("mouse/move", position) },
    down: () => { ipcRenderer.send("mouse/down") },
}

const api = {
    util: _util,
    window: _window,
    mouse: _mouse,
}

contextBridge.exposeInMainWorld("api", api)

