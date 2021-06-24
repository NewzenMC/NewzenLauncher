const socket = require('socket.io-client')('http://ws.newzen.fr:8080')
setTimeout(() => {
    refreshNoDatacenterConnectionOverlay()
}, 5000)
const Maintenance = require('./assets/js/maintenance')

let permissionLevel = 0

let datacenterConnection = false
let datacenterConnectionInterval = null

socket.on('connect', () => {
    socket.send(Object.keys(ConfigManager.getAuthAccounts())[0])
    $('#adminPanelLogin').fadeIn(500)
    $('#adminPanelContent').fadeOut(500)
    datacenterConnection = true
    refreshNoDatacenterConnectionOverlay()
})

socket.on('disconnect', () => {
    datacenterConnection = false
    refreshNoDatacenterConnectionOverlay()
})

socket.on('message', (data) => {
    if (data.maintenance) Maintenance.enableMaintenance()
    else Maintenance.disableMaintenance()
    permissionLevel = data.adminPanelPermissions
    if (permissionLevel !== 0) {
        $('#adminPanelBtn').fadeIn(200)
    } else {
        $('#adminPanelBtn').fadeOut(200)
    }
    switch (permissionLevel) {
        case 0:
            $('#adminPanelBtn').fadeOut(200)
            $('#adminPanelPlayersTab').hide()
            $('#adminPanelBungeeTab').hide()
            $('#adminPanelLobbyTab').hide()
            $('#adminPanelMainTab').hide()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 1: //TODO SPECIAL : Juste accès a la liste des joueurs (Kick+Ban+Mute, etc)
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelBungeeTab').hide()
            $('#adminPanelLobbyTab').hide()
            $('#adminPanelMainTab').hide()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 2: //TODO SPECIAL : Tout le 1 PLUS accès au TPS et force-clearlag
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelBungeeTab').hide()
            $('#adminPanelLobbyTab').hide()
            $('#adminPanelMainTab').hide()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 3:
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelBungeeTab').show()
            $('#adminPanelLobbyTab').show()
            $('#adminPanelMainTab').show()
            $('#adminPanelMaintenanceTab').hide()
            $('#adminPanelNewzenBotTab').hide()
            $('#adminPanelDevTab').hide()
            break
        case 4:
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelBungeeTab').show()
            $('#adminPanelLobbyTab').show()
            $('#adminPanelMainTab').show()
            $('#adminPanelMaintenanceTab').show()
            $('#adminPanelNewzenBotTab').show()
            $('#adminPanelDevTab').hide()
            break
        case 5:
            $('#adminPanelBtn').fadeIn(200)
            $('#adminPanelPlayersTab').show()
            $('#adminPanelBungeeTab').show()
            $('#adminPanelLobbyTab').show()
            $('#adminPanelMainTab').show()
            $('#adminPanelMaintenanceTab').show()
            $('#adminPanelNewzenBotTab').show()
            $('#adminPanelDevTab').show()
            break
    }
})

socket.on('maintenance', (status) => {
    if (status) {
        Maintenance.enableMaintenance()
    } else {
        Maintenance.disableMaintenance()
    }
})

function refreshNoDatacenterConnectionOverlay() {
    if (Object.keys(ConfigManager.getAuthAccounts())[0] === undefined) return
    if (!datacenterConnection) {
        setOverlayContent(
            'Connection aux Centres de Données Impossible',
            'Il est actuellement impossible de se connecter aux Centres de Données de Newzen<br>Vérifiez votre connection Internet !<br>Si le problème persiste, veuillez le signaler à TIEB62#3087 sur le Discord de Newzen !',
            'Rejoindre le Discord'
        ) //TODO Mettre un lien vers la page de status de Newzen
        setOverlayHandler(() => {
            require('electron').shell.openExternal('https://discord.newzen.fr')
        })
        $('#main').fadeOut()
        // Not recreate an interval if another is alerady running
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
}
