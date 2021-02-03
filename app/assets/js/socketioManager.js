const socket = require('socket.io-client')('http://tieb62.freeboxos.fr:8080')
setTimeout(() => {
    refreshNoDatacenterConnectionOverlay()
}, 5000)
const Maintenance = require('./assets/js/maintenance')

let permissionLevel = 0
let datacenterConnection = false
let datacenterConnectionInterval = null

socket.on('connect', () => {
    socket.send(Object.keys(ConfigManager.getAuthAccounts())[0])
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
})

socket.on('maintenance', (status) => {
    if (status) {
        Maintenance.enableMaintenance()
    } else {
        Maintenance.disableMaintenance()
    }
})

function refreshNoDatacenterConnectionOverlay() {
    if (!datacenterConnection) {
        setOverlayContent(
            'Connection aux Serveurs de Données Impossible',
            'Il est actuellement impossible de se connecter aux Serveurs de Données de Newzen<br>Vérifiez votre connection Internet !<br>Si le problème persiste, veuillez le signaler à TIEB62#3087 sur le Discord de Newzen !',
            'Rejoindre le Discord'
        ) //TODO Mettre un lien vers la page de status de Newzen
        setOverlayHandler(() => {
            require('electron').shell.openExternal(
                'https://tieb62.freeboxos.fr/discord'
            )
        })
        $('#main').fadeOut()
        datacenterConnectionInterval = setInterval(() => {
            toggleOverlay(true)
        }, 100)
        toggleOverlay(true)
    } else {
        clearInterval(datacenterConnectionInterval)
        setOverlayHandler(null)
        toggleOverlay(false)
        $('#main').fadeIn()
    }
}
