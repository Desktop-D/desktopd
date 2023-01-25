import { app, ipcMain, BrowserWindow } from "electron"

const defaultOptions: Electron.BrowserWindowConstructorOptions = {
    width: 400,
    height: 400,
    autoHideMenuBar: true,
}

class AppWindow {
    window: BrowserWindow | null;

    constructor(name: string, options: Electron.BrowserWindowConstructorOptions) {
        const finalizedOptions = Object.assign({}, defaultOptions, options)
        const window = new BrowserWindow(finalizedOptions as Electron.BrowserWindowConstructorOptions)

        window.on("closed", () => {
            this.window = null
        })

        window.loadFile(`./src/windows/${name}/index.html`)

        this.window = window
    }
}

function init(): void {

    const mainWindow = new AppWindow("main", {
        width: 800,
        height: 800,
    })
    
}

app.on("ready", init)