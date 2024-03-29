/**
 * Core UI functions are initialized in this file. This prevents
 * unexpected errors from breaking the core features. Specifically,
 * actions in this file should not require the usage of any internal
 * modules, excluding dependencies.
 */
// Requirements
const $ = require('jquery')
const { ipcRenderer, shell, webFrame } = require('electron')
const remote = require('@electron/remote')
const isDev = require('./assets/js/isdev')
const LoggerUtil = require('./assets/js/loggerutil')

const loggerUICore = LoggerUtil(
    '%c[UICore]',
    'color: #000668; font-weight: bold'
)
const loggerAutoUpdater = LoggerUtil(
    '%c[AutoUpdater]',
    'color: #000668; font-weight: bold'
)
const loggerAutoUpdaterSuccess = LoggerUtil(
    '%c[AutoUpdater]',
    'color: #209b07; font-weight: bold'
)

// Log deprecation and process warnings.
process.traceProcessWarnings = true
process.traceDeprecation = true

// Disable eval function.
// eslint-disable-next-line no-eval
window.eval = global.eval = () => {
    throw new Error('eval() disabled for security reasons')
}

// Display warning when devtools window is opened.
remote.getCurrentWebContents().on('devtools-opened', () => {
    for (let i = 0; i < 7; i++) {
        console.log(
            `%cAttends ${'!'.repeat(i)}`,
            'color: white; -webkit-text-stroke: 4px #a02d2a; font-size: 60px; font-weight: bold'
        )
    }

    console.log(
        "%cSi on t'as a dit de Copier/Coller quelque chose ici, tu t'est sans doute fait arnaquer",
        'font-size: 30px'
    )
    console.log(
        '%cSi tu ne sais pas exactement ce que tu fais, ferme cette fenêtre !',
        'font-size: 30px'
    )
    console.log(
        "%cEn éxécutant et/ou récupérant des données sur cette page puis en les donnant à autrui, tu t'expose à de gros risques de piratage !",
        'font-size: 30px; color: red;'
    )
    console.log(
        '%cSi tu sais exactement ce que tu fais, dépose ta candidature pour être développeur sur Newzen ! (Ouvre un Ticket sur le Discord)',
        'font-size: 20px'
    )
})

// Disable zoom, needed for darwin.
webFrame.setZoomLevel(0)
webFrame.setVisualZoomLevelLimits(1, 1)

// Initialize auto updates in production environments.
let updateCheckListener
if (!isDev) {
    ipcRenderer.on('autoUpdateNotification', (event, arg, info) => {
        switch (arg) {
            case 'checking-for-update':
                loggerAutoUpdater.log('Checking for update..')
                settingsUpdateButtonStatus(
                    'Vérification des Mises à Jour..',
                    true
                )
                break
            case 'update-available':
                loggerAutoUpdaterSuccess.log(
                    'New update available',
                    info.version
                )

                if (process.platform === 'darwin') {
                    info.darwindownload = `https://github.com/dscalzi/HeliosLauncher/releases/download/v${info.version}/helioslauncher-setup-${info.version}.dmg`
                    showUpdateUI(info)
                }

                populateSettingsUpdateInformation(info)
                break
            case 'update-downloaded':
                loggerAutoUpdaterSuccess.log(
                    'Update ' + info.version + ' ready to be installed.'
                )
                settingsUpdateButtonStatus(
                    'Installer Maintenant',
                    false,
                    () => {
                        if (!isDev) {
                            ipcRenderer.send(
                                'autoUpdateAction',
                                'installUpdateNow'
                            )
                        }
                    }
                )
                showUpdateUI(info)
                break
            case 'update-not-available':
                loggerAutoUpdater.log('No new update found.')
                settingsUpdateButtonStatus('Vérifier les Mises à Jour')
                break
            case 'ready':
                updateCheckListener = setInterval(() => {
                    ipcRenderer.send('autoUpdateAction', 'checkForUpdate')
                }, 1800000)
                ipcRenderer.send('autoUpdateAction', 'checkForUpdate')
                break
            case 'realerror':
                if (info != null && info.code != null) {
                    if (info.code === 'ERR_UPDATER_INVALID_RELEASE_FEED') {
                        loggerAutoUpdater.log('No suitable releases found.')
                    } else if (info.code === 'ERR_XML_MISSED_ELEMENT') {
                        loggerAutoUpdater.log('No releases found.')
                    } else {
                        loggerAutoUpdater.error(
                            'Error during update check..',
                            info
                        )
                        loggerAutoUpdater.debug('Error Code:', info.code)
                    }
                }
                break
            default:
                loggerAutoUpdater.log('Unknown argument', arg)
                break
        }
    })
}

/**
 * Send a notification to the main process changing the value of
 * allowPrerelease. If we are running a prerelease version, then
 * this will always be set to true, regardless of the current value
 * of val.
 *
 * @param {boolean} val The new allow prerelease value.
 */
function changeAllowPrerelease(val) {
    ipcRenderer.send('autoUpdateAction', 'allowPrereleaseChange', val)
}

function showUpdateUI(info) {
    //TODO Make this message a bit more informative `${info.version}`
    document.getElementById('image_seal_container').setAttribute('update', true)
    document.getElementById('image_seal_container').onclick = () => {
        // setOverlayContent('Update Available', 'A new update for the launcher is available. Would you like to install now?', 'Install', 'Later')
        // setOverlayHandler(() => {
        //     if(!isDev){
        //         ipcRenderer.send('autoUpdateAction', 'installUpdateNow')
        //     } else {
        //         console.error('Cannot install updates in development environment.')
        //         toggleOverlay(false)
        //     }
        // })
        // setDismissHandler(() => {
        //     toggleOverlay(false)
        // })
        // toggleOverlay(true, true)
        switchView(getCurrentView(), VIEWS.settings, 500, 500, () => {
            settingsNavItemListener(
                document.getElementById('settingsNavUpdate'),
                false
            )
        })
    }
}

/* jQuery Example
$(function(){
    loggerUICore.log('UICore Initialized');
})*/

document.addEventListener(
    'readystatechange',
    function () {
        if (document.readyState === 'interactive') {
            loggerUICore.log('UICore Initializing..')

            // Bind close button.
            Array.from(document.getElementsByClassName('fCb')).map((val) => {
                val.addEventListener('click', (e) => {
                    const window = remote.getCurrentWindow()
                    window.close()
                })
            })

            // Bind restore down button.
            Array.from(document.getElementsByClassName('fRb')).map((val) => {
                val.addEventListener('click', (e) => {
                    const window = remote.getCurrentWindow()
                    if (window.isMaximized()) {
                        window.unmaximize()
                    } else {
                        window.maximize()
                    }
                    document.activeElement.blur()
                })
            })

            // Bind minimize button.
            Array.from(document.getElementsByClassName('fMb')).map((val) => {
                val.addEventListener('click', (e) => {
                    const window = remote.getCurrentWindow()
                    window.minimize()
                    document.activeElement.blur()
                })
            })

            // Remove focus from social media buttons once they're clicked.
            Array.from(document.getElementsByClassName('mediaURL')).map(
                (val) => {
                    val.addEventListener('click', (e) => {
                        document.activeElement.blur()
                    })
                }
            )
        } else if (document.readyState === 'complete') {
            // 266.01
            // 170.8
            // 53.21
            // Bind progress bar length to length of bot wrapper
            // const targetWidth = document.getElementById("launch_content").getBoundingClientRect().width
            // const targetWidth2 = document.getElementById("server_selection").getBoundingClientRect().width
            // const targetWidth3 = document.getElementById("launch_button").getBoundingClientRect().width

            document.getElementById('launch_details').style.maxWidth = 266.01
            document.getElementById('launch_progress').style.width = 170.8
            document.getElementById(
                'launch_details_right'
            ).style.maxWidth = 170.8
            document.getElementById('launch_progress_label').style.width = 53.21
        }
    },
    false
)

/**
 * Open web links in the user's default browser.
 */
$(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault()
    shell.openExternal(this.href)
})

/**
 * Opens DevTools window if you hold (ctrl + shift + i).
 * This will crash the program if you are using multiple
 * DevTools, for example the chrome debugger in VS Code.
 */
document.addEventListener('keydown', function (e) {
    if ((e.key === 'I' || e.key === 'i') && e.ctrlKey && e.shiftKey) {
        let window = remote.getCurrentWindow()
        window.toggleDevTools()
    }
})
