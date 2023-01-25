import { app, ipcMain, BrowserWindow, screen, App, BrowserView } from "electron"

const defaultOptionsAppWindow: Electron.BrowserWindowConstructorOptions = {
    width: 400,
    height: 400,
    autoHideMenuBar: true,
    alwaysOnTop: true,
}

const defaultOptionsClickWindow: Electron.BrowserWindowConstructorOptions = {
    width: 100,
    height: 100,
    autoHideMenuBar: true,
    alwaysOnTop: true,

    transparent: true,
    frame: false,
    //skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
}

class AppWindow {
    window: BrowserWindow | null;

    constructor(name: string, options: Electron.BrowserWindowConstructorOptions) {
        const finalizedOptions = Object.assign({}, defaultOptionsAppWindow, options)
        const window = new BrowserWindow(finalizedOptions as Electron.BrowserWindowConstructorOptions)

        window.on("closed", () => {
            this.window = null
        })

        window.loadFile(`./src/windows/${name}/index.html`)

        this.window = window
    }
}

class ClickWindow {
    window: BrowserWindow | null;

    constructor(options: Electron.BrowserWindowConstructorOptions) {
        const finalizedOptions = Object.assign({}, defaultOptionsClickWindow, options)
        const window = new BrowserWindow(finalizedOptions as Electron.BrowserWindowConstructorOptions)

        window.on("closed", () => {
            this.window = null
        })

        window.loadFile(`./src/clickwindow/index.html`)

        this.window = window
    }
}

ipcMain.on("ping", () => {
    console.log("pong")
})

function init(): void {
    console.log("ready")

    // creates a "main" window
    function createMainWindow(rectangle: Electron.Rectangle): AppWindow {
        const mainWindow = new AppWindow("main", {
            x: rectangle.x,
            y: rectangle.y,
            width: rectangle.width,
            height: rectangle.height,
    
            transparent: true,
            frame: false,
            //skipTaskbar: true,
            movable: false,
            resizable: false,
            maximizable: false,
            minimizable: false,
            alwaysOnTop: true,
        })
        mainWindow.window?.setIgnoreMouseEvents(true, { forward: true })
        mainWindow.window?.webContents.openDevTools()

        return mainWindow
    }

    // create a main window on every monitor
    const displays = screen.getAllDisplays()
    for (let i = 0; i < displays.length; i++) {
        const display = displays[i]
        const window = createMainWindow(display.bounds)
    }

    const clickWindow = new ClickWindow({})
}

app.on("ready", init)