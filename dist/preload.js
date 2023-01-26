"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { ipcRenderer, contextBridge } = require("electron");
console.log("preload loaded");
const _util = {
    log: (text) => { ipcRenderer.send("log", text); },
};
const _window = {
    info: () => __awaiter(void 0, void 0, void 0, function* () { return yield ipcRenderer.invoke("window/info"); }),
    close: () => { ipcRenderer.send("window/close"); },
};
const _mouse = {
    move: (position) => { ipcRenderer.send("mouse/move", position); },
    down: (key) => { ipcRenderer.send("mouse/down", key); },
};
const _button = {
    create: (options) => __awaiter(void 0, void 0, void 0, function* () { return yield ipcRenderer.invoke("button/create", options); }),
    destroy: (key) => { ipcRenderer.send("button/destroy", key); },
};
const _event = {
    mouse: {
    // down: (callback) => {  }
    },
    button: {
        down: (callback) => { ipcRenderer.on("button/down", (e, key) => { callback(key); }); }
    },
    coms: {
        connect: (callback) => { ipcRenderer.on("coms/connect", callback); }
    },
};
const api = {
    util: _util,
    button: _button,
    window: _window,
    mouse: _mouse,
    event: _event,
};
contextBridge.exposeInMainWorld("api", api);
