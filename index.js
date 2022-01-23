// Requirements
const {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    desktopCapturer,
    dialog
} = require('electron')
const autoUpdater = require('electron-updater').autoUpdater
const ejse = require('ejs-electron')
const fs = require('fs')
const isDev = require('./app/assets/js/isdev')
const path = require('path')
const semver = require('semver')
const url = require('url')
const http = require('http')
const URL = require('url').URL

// Init @electron/remote Module
const remoteMain = require('@electron/remote/main')
remoteMain.initialize()

// Setup auto updater.
function initAutoUpdater(event, data) {
    if (data) {
        autoUpdater.allowPrerelease = true
    } else {
        // Defaults to true if application version contains prerelease components (e.g. 0.12.1-alpha.1)
        // autoUpdater.allowPrerelease = true
    }

    if (isDev) {
        autoUpdater.autoInstallOnAppQuit = false
        autoUpdater.updateConfigPath = path.join(
            __dirname,
            'dev-app-update.yml'
        )
    }
    if (process.platform === 'darwin') {
        autoUpdater.autoDownload = false
    }
    autoUpdater.on('update-available', (info) => {
        event.sender.send('autoUpdateNotification', 'update-available', info)
    })
    autoUpdater.on('update-downloaded', (info) => {
        event.sender.send('autoUpdateNotification', 'update-downloaded', info)
    })
    autoUpdater.on('update-not-available', (info) => {
        event.sender.send(
            'autoUpdateNotification',
            'update-not-available',
            info
        )
    })
    autoUpdater.on('checking-for-update', () => {
        event.sender.send('autoUpdateNotification', 'checking-for-update')
    })
    autoUpdater.on('error', (err) => {
        event.sender.send('autoUpdateNotification', 'realerror', err)
    })
}

// Open channel to listen for update actions.
ipcMain.on('autoUpdateAction', (event, arg, data) => {
    switch (arg) {
        case 'initAutoUpdater':
            console.log('Initializing auto updater.')
            initAutoUpdater(event, data)
            event.sender.send('autoUpdateNotification', 'ready')
            break
        case 'checkForUpdate':
            autoUpdater.checkForUpdates().catch((err) => {
                event.sender.send('autoUpdateNotification', 'realerror', err)
            })
            break
        case 'allowPrereleaseChange':
            if (!data) {
                const preRelComp = semver.prerelease(app.getVersion())
                if (preRelComp != null && preRelComp.length > 0) {
                    autoUpdater.allowPrerelease = true
                } else {
                    autoUpdater.allowPrerelease = data
                }
            } else {
                autoUpdater.allowPrerelease = data
            }
            break
        case 'installUpdateNow':
            autoUpdater.quitAndInstall()
            break
        default:
            console.log('Unknown argument', arg)
            break
    }
})
// Redirect distribution index event from preloader to renderer.
ipcMain.on('distributionIndexDone', (event, res) => {
    event.sender.send('distributionIndexDone', res)
})

// Acces to desktopCapturer from renderer process (cf. socketManager.js)
ipcMain.handle('DESKTOP_CAPTURER_GET_SOURCES', (event, opts) =>
    desktopCapturer.getSources(opts)
)

// Disable hardware acceleration.
// https://electronjs.org/docs/tutorial/offscreen-rendering
app.disableHardwareAcceleration()

// https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true

// Put the Specified Name in Desktop Notifications instead of "electron.app.Electron"
if (process.platform === 'win32') app.setAppUserModelId('NewzenLauncher')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    win = new BrowserWindow({
        width: 980,
        height: 552,
        icon: getPlatformIcon('SealCircle'),
        frame: false,
        webPreferences: {
            preload: path.join(
                __dirname,
                'app',
                'assets',
                'js',
                'preloader.js'
            ),
            nodeIntegration: true,
            contextIsolation: false,
            worldSafeExecuteJavaScript: true
        },
        backgroundColor: '#2C2F33'
    })

    remoteMain.enable(win.webContents)

    ejse.data(
        'bkid',
        Math.floor(
            Math.random() *
                fs.readdirSync(
                    path.join(
                        __dirname,
                        'app',
                        'assets',
                        'images',
                        'backgrounds'
                    )
                ).length
        )
    )

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'app', 'app.ejs'),
            protocol: 'file:',
            slashes: true
        })
    )

    win.maximize()

    /*win.once('ready-to-show', () => {
        win.show()
    })*/

    win.removeMenu()

    win.resizable = true

    win.on('closed', () => {
        win = null
    })
}

function createMenu() {
    if (process.platform === 'darwin') {
        // Extend default included application menu to continue support for quit keyboard shortcut
        let applicationSubMenu = {
            label: 'Application',
            submenu: [
                {
                    label: 'About Application',
                    selector: 'orderFrontStandardAboutPanel:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit()
                    }
                }
            ]
        }

        // New edit menu adds support for text-editing keyboard shortcuts
        let editSubMenu = {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    selector: 'undo:'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    selector: 'redo:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    selector: 'paste:'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    selector: 'selectAll:'
                }
            ]
        }

        // Bundle submenus into a single template and build a menu object with it
        let menuTemplate = [applicationSubMenu, editSubMenu]
        let menuObject = Menu.buildFromTemplate(menuTemplate)

        // Assign it to the application
        Menu.setApplicationMenu(menuObject)
    }
}

function getPlatformIcon(filename) {
    let ext
    switch (process.platform) {
        case 'win32':
            ext = 'ico'
            break
        case 'darwin':
        case 'linux':
        default:
            ext = 'png'
            break
    }

    return path.join(__dirname, 'app', 'assets', 'images', `${filename}.${ext}`)
}

app.on('ready', createWindow)
app.on('ready', createMenu)

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('whereSaveScreenshot', (event, filename) => {
    dialog
        .showSaveDialog(win, {
            title: 'Enregistrer une capture d’écran',
            filters: [
                {
                    name: 'Image JPEG',
                    extensions: ['jpg']
                }
            ]
        })
        .then((response) => {
            if (response.canceled) return
            event.sender.send('saveScreenshotPath', {
                selectedPath: response.filePath,
                filename: filename
            })
        })
})

/* Microsoft Authentication */
let microsoftAuthStarted = false
let msAuthWindow = null
/**
 * @param {String} url Microsoft Auth URL
 */
function createMsAuthWindow(url) {
    if (msAuthWindow !== null) {
        throw new Error('Microsoft Auth Window Already Created')
    }
    msAuthWindow = new BrowserWindow({
        icon: getPlatformIcon('SealCircle'),
        webPreferences: {
            contextIsolation: true,
            worldSafeExecuteJavaScript: true
        },
        backgroundColor: '#2C2F33',
        parent: win,
        modal: true
    })

    msAuthWindow.webContents.session.clearAuthCache()
    msAuthWindow.webContents.session.clearStorageData()

    msAuthWindow.loadURL(url)

    msAuthWindow.maximize()

    msAuthWindow.removeMenu()

    msAuthWindow.on('closed', () => {
        msAuthWindow = null
        microsoftAuthStarted = false
        stopMicrosoftAuthServer()
    })
}

/**
 * @type {http.Server}
 */
let msAuthServer = null
/**
 *
 * @param {Electron.IpcMainEvent} event
 */
function startMicrosoftAuthServer(event) {
    const PORT = 25555
    msAuthServer = http.createServer((req, res) => {
        let requestURL = new URL(req.url, `http://127.0.0.1:${PORT}`)
        let error = requestURL.searchParams.get('error')
        let errorDescription = requestURL.searchParams.get('error_description')
        if (error !== null) {
            switch (error) {
                case 'access_denied':
                    event.sender.send('microsoftAuthCancelled')
                    break

                default:
                    event.sender.send(
                        'microsoftAuthError',
                        error,
                        errorDescription
                    )
                    break
            }
        } else {
            event.sender.send(
                'microsoftAuthSuccess',
                requestURL.searchParams.get('code')
            )
        }
        msAuthWindow.close()
        stopMicrosoftAuthServer()
    })
    msAuthServer.listen(PORT)
}

function stopMicrosoftAuthServer() {
    msAuthServer.close()
}

ipcMain.on('startMicrosoftAuth', (event, url) => {
    if (microsoftAuthStarted === true) return
    microsoftAuthStarted = true
    startMicrosoftAuthServer(event)
    createMsAuthWindow(url)
})
