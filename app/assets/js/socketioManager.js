/* global ConfigManager setOverlayHandler setOverlayContent toggleOverlay */
const socket = require('socket.io-client')('http://ws.newzen.fr:8080')

//#region Datacenter Connection

setTimeout(() => {
    refreshNoDatacenterConnectionOverlay()
}, 5000)

const Maintenance = require('./assets/js/maintenance')

let permissionLevel = 0

let luckpermsGroup = {
    name: 'Chargement...',
    color: '#000000'
}
refreshLuckpermsGroups()

/**
 * @typedef {Object} Server
 * @property {string} id
 * @property {string} address
 */

/**
 * @type {Server[]}
 */
let servers = [
    {
        id: 'delta',
        address: 'play.newzen.fr:25565'
    },
    {
        id: 'minage',
        address: 'play.newzen.fr:25566'
    }
]

let loginInProgress = false
let loginEnded = false

let datacenterConnection = false
let datacenterConnectionInterval = null

socket.on('connect', () => {
    const selectedAccount = ConfigManager.getSelectedAccount()
    if (selectedAccount !== undefined) {
        const currentUUID = selectedAccount.uuid

        socket.send(currentUUID)

        datacenterConnection = true
        refreshNoDatacenterConnectionOverlay()
    } else {
        loginInProgress = true
        loginEnded = false
        socket.disconnect()
        datacenterConnection = false
        refreshNoDatacenterConnectionOverlay()
    }

    $('#adminPanelLogin').fadeIn(500)
    $('.content').fadeIn(500) // Parent element of #adminPanelLogin
    $('#adminPanelContent').fadeOut(500)
})

socket.on('disconnect', () => {
    datacenterConnection = false
    refreshNoDatacenterConnectionOverlay()
})

socket.on('message', (data) => {
    if (data.servers !== undefined) servers = data.servers

    permissionLevel = data.adminPanelPermissions

    luckpermsGroup = data.luckpermsGroup
    refreshLuckpermsGroups()

    $('#maintenanceMode').prop('checked', data.maintenance)
    if (data.maintenance) Maintenance.enableMaintenance()
    else Maintenance.disableMaintenance()
    if (permissionLevel !== 0) {
        $('#adminPanelBtn').fadeIn(200)
    } else {
        $('#adminPanelBtn').fadeOut(200)
    }
    switch (permissionLevel) {
        case 0:
            $('#adminPanelBtn').fadeOut(200)
            $('#adminPanelPlayersTab').hide()
            $('#adminPanelMinageTab').hide()
            $('#adminPanelDeltaTab').hide()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 1: //TODO Accès a la Liste des Joueurs et leurs Serveurs
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelMinageTab').hide()
            $('#adminPanelDeltaTab').hide()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 2: //TODO SPECIAL : Tout le 1 PLUS accès au TPS et force-clearlag
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelMinageTab').hide()
            $('#adminPanelDeltaTab').hide()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 3:
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelMinageTab').show()
            $('#adminPanelDeltaTab').show()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 4:
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelMinageTab').show()
            $('#adminPanelDeltaTab').show()
            $('#adminPanelMaintenanceTab').show()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 5:
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelMinageTab').show()
            $('#adminPanelDeltaTab').show()
            $('#adminPanelMaintenanceTab').show()
            $('#adminPanelNewzenBotTab').show()
            $('#adminPanelDevTab').show()
            break
    }
})

socket.on('maintenance', (status) => {
    status = JSON.parse(status)
    $('#maintenanceMode').prop('checked', status)
    if (status) {
        Maintenance.enableMaintenance()
    } else {
        Maintenance.disableMaintenance()
        setTimeout(() => {
            Maintenance.disableMaintenance()
        }, 1000)
    }
})

socket.on('error', (errorMsg) => {
    notyf.error(errorMsg)
})

socket.on('success', (successMsg) => {
    notyf.success(successMsg)
})

const desktopCapturer = {
    /**
     * @param {Electron.SourcesOptions} opts
     * @returns {Promise<Electron.DesktopCapturerSource[]>}
     */
    getSources: (opts) =>
        ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES', opts)
}

socket.on('take-screenshot', (sendNotification) => {
    desktopCapturer
        .getSources({
            types: ['window'],
            thumbnailSize: {
                width: window.screen.width,
                height: window.screen.height
            }
        })
        .then((sources) => {
            sources.forEach((source) => {
                if (source.name.includes('Newzen - ')) {
                    socket.emit('screenshot-taken', {
                        playerName:
                            ConfigManager.getSelectedAccount().displayName,
                        playerUUID: ConfigManager.getSelectedAccount().uuid,
                        time: Date.now(),
                        data: source.thumbnail.toJPEG(100)
                    })
                    if (sendNotification) {
                        // eslint-disable-next-line no-new
                        new Notification('Newzen AntiCheat', {
                            body: 'Vous avez été suspecté de Cheat, une capture de votre jeu a été envoyée au Staff de Newzen'
                        })
                    }
                }
            })
        })
})

function refreshNoDatacenterConnectionOverlay() {
    if (datacenterConnection === false && loginInProgress === false) {
        setOverlayContent(
            'Connection aux Centres de Données Impossible',
            'Il est actuellement impossible de se connecter aux Centres de Données de Newzen<br>Vérifiez votre connection Internet !<br>Si le problème persiste, veuillez le signaler à TIEB62#3087 sur le Discord de Newzen !',
            'Rejoindre le Discord'
        )
        //TODO Mettre un lien vers la page de status de Newzen
        setOverlayHandler(() => {
            require('electron').shell.openExternal('https://discord.newzen.fr')
        })
        $('#main').fadeOut()
        // Not recreate an interval if another is already running
        if (datacenterConnectionInterval === null) {
            datacenterConnectionInterval = setInterval(() => {
                toggleOverlay(true)
            }, 100)
        }
        toggleOverlay(true)
    } else {
        clearInterval(datacenterConnectionInterval)
        datacenterConnectionInterval = null
        setOverlayHandler(null)
        toggleOverlay(false)
        $('#main').fadeIn()
    }
    if (loginInProgress === false && loginEnded === true) {
        socket.connect()
        socket.send(ConfigManager.getSelectedAccount().uuid)
        loginEnded = false
        //FIX Work but blinks after login
        setTimeout(() => {
            socket.connect()
        }, 500)
        //FIX
    }
}

function refreshLuckpermsGroups() {
    // Get the Player Name and remove it from the landing page
    let username = $('#user_text').html()
    $('#user_text').html('')

    // Build the First Span with the Luckperms Group Name & Color
    let groupSpan = $(`<span>${luckpermsGroup.name.toUpperCase()}</span>`)
    groupSpan.css('color', luckpermsGroup.color)

    // To make the Group appear above the Player Name we create a <br>
    let br = $('<br>')

    // Create another Spanw with the Player Name
    let usernameSpan = $(`<span>${username}</span>`)

    // Append the Group Name and the Player Name to the landing page
    $('#user_text').append(groupSpan)
    $('#user_text').append(br)
    $('#user_text').append(usernameSpan)
}

//#endregion Datacenter Connection

//#region Game Communication

const GAME_SOCKET_PORT = 25550

const socketManagerLogger = LoggerUtil('%c[SocketIO-Manager]', 'color: yellow;')

const SocketIOServer = require('socket.io').Server

const gameCommunicationServer = new SocketIOServer({
    serveClient: false
})

let gameCommunicationStarted = false

function startGameCommunication() {
    if (global.gameRunning !== true && isDev === false) {
        return socketManagerLogger.error('Game is not Running !')
    } else if (gameCommunicationStarted === true) {
        return socketManagerLogger.error(
            'Game Communication is already started !'
        )
    }
    gameCommunicationServer.listen(GAME_SOCKET_PORT)
    gameCommunicationStarted = true
    socketManagerLogger.info('Game Communication Started')
}

function stopGameCommunication() {
    if (global.gameRunning === true && isDev === false) {
        return socketManagerLogger.error('Game is still Running !')
    } else if (gameCommunicationStarted === false) {
        return socketManagerLogger.error('Game Communication is not running !')
    }
    gameCommunicationServer.close()
    gameCommunicationStarted = false
    socketManagerLogger.info('Game Communication Stopped')
}

/**
 * @type {import('socket.io').Socket}
 */
let game = null
gameCommunicationServer.on('connect', (socket) => {
    game = socket
    socketManagerLogger.info('Game Connected !')

    registerGameCommunicationListeners()
})

let currentServer = ''
ipcRenderer.on('server-selected', (_event, selectedServer) => {
    switchServer(selectedServer)
})

function switchServer(targetServerID) {
    if (game === null) {
        return socketManagerLogger.error('Game is not connected !')
    }
    if (currentServer === targetServerID) {
        return socketManagerLogger.error(`Already on ${targetServerID}`)
    }

    const targetServer = servers.find((server) => server.id === targetServerID)

    if (targetServer !== undefined) {
        game.emit('connectToServer', targetServer.address)
        currentServer = targetServerID
    } else {
        socketManagerLogger.error(`Server ${targetServerID} not found !`)
    }
}

function registerGameCommunicationListeners() {
    game.on('disconnect', (_reason) => {
        game = null
        socketManagerLogger.info('Game Disconnected !')
    })

    game.on('startServerSelector', () => {
        ipcRenderer.send('openServerSelector', currentServer)
    })

    game.on('message', (message) => {
        socketManagerLogger.info('Game Message : ' + message)
    })
}

//#endregion Game Communication
