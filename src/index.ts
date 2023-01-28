import { app, ipcMain, BrowserWindow, screen, App, BrowserView, globalShortcut } from "electron"
import { AppUpdater, autoUpdater } from "electron-updater"
import { defaultOptionsAppWindow, defaultOptionsClickWindow } from "./modules/defaultOptions";

const AutoLaunch = require("auto-launch")

const Store = require('electron-store');
const store = new Store();

// init

console.log(app.getPath("appData"))

// AUTO UPDATER
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

let isDownloadingUpdate = false;

// STORAGE
const processes = new Map()
const clickwindows = new Map()

let mousePosition: { x: number, y: number } = { x: 0, y: 0 }
let mainWindowRect: Electron.Rectangle = { x: 0, y: 0, width: 0, height: 0 }
let mainWindow: AppWindow | null = null

// CLASSES

class WindowProcess {
    window: BrowserWindow | null = null;

    createWindow(htmlPath: string, options: Electron.BrowserWindowConstructorOptions): Electron.BrowserWindow {
        const window = new BrowserWindow(options)
        window.on("closed", this.destroy)
        window.loadFile(htmlPath)

        processes.set(window.webContents.getProcessId(), this)

        if (store.get("config.window.hidden") == true) {
            window.hide()
        }

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
    constructor(key: string, options: Electron.BrowserWindowConstructorOptions) {
        super()

        const finalizedOptions = Object.assign({}, defaultOptionsClickWindow, options)
        finalizedOptions.webPreferences!.preload = `${__dirname}/preload.js`

        const window = this.createWindow(`./src/clickwindow/index.html`, finalizedOptions as Electron.BrowserWindowConstructorOptions)
        window.setAlwaysOnTop(true, "screen-saver", 99)

        window.on("ready-to-show", () => {
            console.log("sending key")
            window.focus()
            window.webContents.send("coms/connect", { key: key })
        })
    }
}



// PRESET


// FUNCTIONS

function initiateListeners() {
    // logs a message to the console
    ipcMain.on("log", (event: Electron.IpcMainEvent, text: string) => {
        console.log(`${event.processId} -> ${text}`)
    })

    //
    ipcMain.handle("window/info", (event) => {
        return mainWindowRect
    })

    // closes the window
    ipcMain.on("window/close", (event: Electron.IpcMainEvent) => {
        const window: AppWindow | ClickWindow = processes.get(event.processId)
        if (window) { window.destroy() }
    })

    // tells main process that the mouse moved
    ipcMain.on("mouse/move", (event: Electron.IpcMainEvent, position: { x: number, y: number }) => {
        mousePosition = position
    })

    // tells main process that the mouse is pressed down
    ipcMain.on("mouse/down", (event: Electron.IpcMainEvent, receivedKey: string) => {
        console.log("click - " + receivedKey)

        for (let [id, window] of processes) {
            if (!window.window) { return }
            window.window.send("button/down", receivedKey)
        }
    })


    ipcMain.handle("button/create", (event, options) => {
        const key = `${Date.now()}`

        console.log("main key " + key)

        const clickwindow = new ClickWindow(key, options)
        clickwindows.set(key, clickwindow)

        return key
    })

    ipcMain.on("button/destroy", (event: Electron.IpcMainEvent, key: string) => {
        const clickwindow = clickwindows.get(key)
        if (!clickwindow) { return }
        clickwindow.destroy()
    })
}

async function init() {
    console.log("ready")

    initiateListeners()

    // auto launcher
    let autoLaunch = new AutoLaunch({
        name: 'DesktopD',
        path: app.getPath('exe'),
    });
    autoLaunch.isEnabled().then((isEnabled: any) => {
        if (!isEnabled) autoLaunch.enable();
    });

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

    mainWindow = new AppWindow("main", {
        x: smallestX,
        y: smallestY,

        minWidth: highestX - smallestX,
        minHeight: highestY - smallestY,

        width: highestX - smallestX,
        height: highestY - smallestY,
    })

    mainWindow.window?.setIgnoreMouseEvents(true, { forward: true })
    mainWindowRect = mainWindow.window?.getBounds()!
    // mainWindow.window?.webContents.openDevTools()

    console.log(mainWindowRect)

    autoUpdater.checkForUpdates()
    mainWindow.window!.webContents.send("coms/connect", { event: "message", message: "checking for updates" })

    if (store.get("config.window.hidden") == true) {
        for (let [id, window] of processes) {
            if (!window.window) { return }
            window.window?.hide()
        }
    }
    
}

app.on("ready", init)

app.whenReady().then(() => {
    // Register a 'CommandOrControl+X' shortcut listener.
    var ret = globalShortcut.register('CommandOrControl+alt+C', () => {
        console.log('Quitting')
        app.quit()
    })

    if (!ret) {
        console.log('registration failed')
    }
    // Register a 'CommandOrControl+X' shortcut listener.
    var ret = globalShortcut.register('CommandOrControl+alt+X', async () => {
        for (let [id, window] of processes) {
            if (!window.window) { return }
            window.window?.hide()
        }

        await store.set("config.window.hidden", true)
    })

    if (!ret) {
        console.log('registration failed')
    }
    // Register a 'CommandOrControl+X' shortcut listener.
    var ret = globalShortcut.register('CommandOrControl+alt+D', async () => {
        for (let [id, window] of processes) {
            if (!window.window) { return }
            window.window?.show()

            await store.set("config.window.hidden", false)
        }
    })

    if (!ret) {
        console.log('registration failed')
    }
})

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
})

autoUpdater.on("update-not-available", () => {
    mainWindow?.window?.webContents.send("coms/connect", { event: "message", message: app.getVersion() + " up to date" })
})


autoUpdater.on("update-available", async () => {
    isDownloadingUpdate = true;
    mainWindow?.window?.webContents.send("coms/connect", { event: "message", message: app.getVersion() + " update available, downloading" })
    let pth = await autoUpdater.downloadUpdate()
    mainWindow?.window?.webContents.send("coms/connect", { event: "message", message: app.getVersion() + ` downloaded, restarting in 3s ` })
});

autoUpdater.on("update-downloaded", () => {
    console.log("downloaded update");
    setTimeout(() => {
        autoUpdater.quitAndInstall();
    }, 3000);
});

app.on('before-quit', (event) => {
    if (isDownloadingUpdate) {
        event.preventDefault();
    }
});

autoUpdater.on("error", (err) => {
    console.log(`ERROR: ${err}`)

    if (!mainWindow) { return }
    mainWindow.window!.webContents.send("coms/connect", { event: "message", message: `${err}` }) 
})

setInterval(() => {
    if (!mainWindow) { return }
    mainWindow.window!.webContents.send("coms/connect", { event: "message", message: app.getVersion() + " checking for updates" })
    autoUpdater.checkForUpdates()
}, 60 * 1000)