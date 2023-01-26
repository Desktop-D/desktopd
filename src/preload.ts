const { ipcRenderer, contextBridge } = require("electron");

console.log("preload loaded")

const _util = {
    log: (text: string) => { ipcRenderer.send("log", text) },
}

const _window = {
    info: async () => { return await ipcRenderer.invoke("window/info") },
    close: () => { ipcRenderer.send("window/close") },
}

const _mouse = {
    move: (position: {x: number, y: number}) => { ipcRenderer.send("mouse/move", position) },
    down: (key: string) => { ipcRenderer.send("mouse/down", key) },
}

const _button = {
    create: async (options: {x: number, y: number, width: number, height: number}) => { return await ipcRenderer.invoke("button/create", options) },
    destroy: (key: string) => { ipcRenderer.send("button/destroy", key) },
}

const _event = {
    mouse: {
        // down: (callback) => {  }
    },
    button: {
        down: (callback: any) => { ipcRenderer.on("button/down", (e, key) => {callback(key)}) }
    },
    coms: {
        connect: (callback: any) => { ipcRenderer.on("coms/connect", callback) }
    },
}

const api = {
    util: _util,
    button: _button,
    window: _window,
    mouse: _mouse,
    event: _event,
}

contextBridge.exposeInMainWorld("api", api)

