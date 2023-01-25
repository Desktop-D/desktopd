"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const defaultOptions = {
    width: 400,
    height: 400,
    autoHideMenuBar: true,
};
class AppWindow {
    constructor(name, options) {
        const finalizedOptions = Object.assign({}, defaultOptions, options);
        const window = new electron_1.BrowserWindow(finalizedOptions);
        window.on("closed", () => {
            this.window = null;
        });
        window.loadFile(`./src/windows/${name}/index.html`);
        this.window = window;
    }
}
function init() {
    const mainWindow = new AppWindow("main", {
        width: 800,
        height: 800,
    });
}
electron_1.app.on("ready", init);
