import { app, ipcMain, BrowserWindow, screen, App, BrowserView, globalShortcut } from "electron"

// STORAGE
const processes = new Map()
let mousePosition: {x: number, y: number} = {x: 0, y: 0}
let mainWindowRect: Electron.Rectangle = {x: 0, y: 0, width: 0, height: 0}

// CLASSES

const defaultOptionsAppWindow: Electron.BrowserWindowConstructorOptions = {
    width: 400,
    height: 400,
    autoHideMenuBar: true,
    alwaysOnTop: true,

    transparent: true,
    frame: false,

    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    acceptFirstMouse: true,
    fullscreenable: false,
    focusable: false,

    webPreferences: {
        nodeIntegration: true,
    }
}

const defaultOptionsClickWindow: Electron.BrowserWindowConstructorOptions = {
    width: 100,
    height: 100,
    autoHideMenuBar: true,
    alwaysOnTop: true,

    transparent: true,
    frame: false,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    acceptFirstMouse: true,
    fullscreenable: false,

    webPreferences: {
        nodeIntegration: true,
    }
}

class WindowProcess {
    window: BrowserWindow | null = null;

    createWindow(htmlPath: string, options: Electron.BrowserWindowConstructorOptions): Electron.BrowserWindow {
        const window = new BrowserWindow(options)
        window.on("closed", this.destroy)
        window.loadFile(htmlPath)

        processes.set(window.webContents.getProcessId(), this)

        this.window = window
        return window
    }

    destroy() {
        if (!this.window) { return }

        processes.delete(this.window.webContents.getProcessId())
        this.window.destroy()
        this.window = null
    }
}

class AppWindow extends WindowProcess {
    constructor(name: string, options: Electron.BrowserWindowConstructorOptions) {
        super();

        const finalizedOptions = Object.assign({}, defaultOptionsAppWindow, options)
        finalizedOptions.webPreferences!.preload = `${__dirname}/preload.js`

        const window = this.createWindow(`./src/windows/${name}/index.html`, finalizedOptions as Electron.BrowserWindowConstructorOptions)
        window.setAlwaysOnTop(true, "screen-saver", 100)
    }
}

class ClickWindow extends WindowProcess {
    constructor(options: Electron.BrowserWindowConstructorOptions) {
        super()

        const finalizedOptions = Object.assign({}, defaultOptionsClickWindow, options)
        finalizedOptions.webPreferences!.preload = `${__dirname}/preload.js`

        const window = this.createWindow(`./src/clickwindow/index.html`, finalizedOptions as Electron.BrowserWindowConstructorOptions)
        window.setAlwaysOnTop(true, "screen-saver", 99)
    }
}

// PRESET
let clickWindow: ClickWindow | null = null

// FUNCTIONS

function initiateListeners() {
    // logs a message to the console
    ipcMain.on("log", (event: Electron.IpcMainEvent, text: string) => {
        console.log(`${event.processId} -> ${text}`)
    })

    // closes the window
    ipcMain.on("window/close", (event: Electron.IpcMainEvent) => {
        const window: AppWindow | ClickWindow = processes.get(event.processId)
        if (window) { window.destroy() }
    })

    // tells main process that the mouse moved
    ipcMain.on("mouse/move", (event: Electron.IpcMainEvent, position: {x: number, y: number}) => {
        mousePosition = position
    })

    // tells main process that the mouse is pressed down
    ipcMain.on("mouse/down", (event: Electron.IpcMainEvent) => {
        console.log("click")

        if (!clickWindow) { return }

        console.log(`Random X: ${Math.random() * mainWindowRect.width - mainWindowRect.x}`)

        clickWindow.destroy()
        clickWindow = new ClickWindow({
            x: Math.floor(Math.random() * mainWindowRect.width + mainWindowRect.x),
            y: Math.floor(Math.random() * mainWindowRect.height + mainWindowRect.y),
        })
        console.log(clickWindow.window?.getPosition())
    })
}

function init(): void {
    console.log("ready")

    initiateListeners()

    // create a main window on every monitor
    let smallestX = 0
    let smallestY = 0

    let highestX = 0
    let highestY = 0

    const displays = screen.getAllDisplays()
    for (let i = 0; i < displays.length; i++) {
        const display = displays[i]

        const bounds = display.bounds

        const boundsX = bounds.x
        const boundsY = bounds.y

        const width = bounds.width
        const height = bounds.height

        if (boundsX < smallestX) { smallestX = boundsX }
        if (boundsX + width > highestX) { highestX = boundsX + width }

        if (boundsY < smallestX) { smallestX = boundsY }
        if (boundsY + height > highestY) { highestY = boundsY + height }
    }

    const mainWindow = new AppWindow("main", {
        x: smallestX,
        y: smallestY,

        minWidth: highestX - smallestX,
        minHeight: highestY - smallestY,

        width: highestX - smallestX,
        height: highestY - smallestY,
    })

    mainWindow.window?.setIgnoreMouseEvents(true, { forward: true })
    mainWindowRect = mainWindow.window?.getBounds()!

    console.log(mainWindowRect)

    clickWindow = new ClickWindow({
        x: Math.floor(Math.random() * mainWindowRect.width + mainWindowRect.x),
        y: Math.floor(Math.random() * mainWindowRect.height + mainWindowRect.y),
    })
    console.log(clickWindow.window?.getPosition())
}

app.on("ready", init)

app.whenReady().then(() => {
    // Register a 'CommandOrControl+X' shortcut listener.
    const ret = globalShortcut.register('CommandOrControl+X', () => {
        console.log('Quitting')
        app.quit()
    })

    if (!ret) {
        console.log('registration failed')
    }
})

app.on('will-quit', () => {
    // Unregister a shortcut.
    globalShortcut.unregister('CommandOrControl+X')

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
})