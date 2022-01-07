/* global ConfigManager setOverlayHandler setOverlayContent toggleOverlay */
const socket = require('socket.io-client')('http://ws.newzen.fr:8080')

setTimeout(() => {
    refreshNoDatacenterConnectionOverlay()
}, 5000)

const Maintenance = require('./assets/js/maintenance')

let permissionLevel = 0

let luckpermsGroups = []

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
    permissionLevel = data.adminPanelPermissions

    luckpermsGroups = data.luckpermsGroups
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
        case 1: //TODO SPECIAL : Juste accès a la liste des joueurs (Kick+Ban+Mute, etc)
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
    let highestGroup = 'HEY YA UN BUG LA !'
    let groupColor = 'black'
    if (luckpermsGroups.includes('default')) {
        highestGroup = 'JOUEUR'
        groupColor = 'lightgray'
    }
    //TODO Ajouter les autres Grades
    //TODO WARNING : Dans l'ordre hiérarchique,
    //TODO WARNING : Le Grade le plus haut en dernier et le plus bas en premier
    if (luckpermsGroups.includes('administration')) {
        highestGroup = 'ADMINISTRATION'
        groupColor = 'darkred'
    }

    let username = $('#user_text').html()
    $('#user_text').html('')

    let groupSpan = $(`<span>${highestGroup}</span>`)
    groupSpan.css('color', groupColor)
    let br = $('<br>')
    let usernameSpan = $(`<span>${username}</span>`)

    $('#user_text').append(groupSpan)
    $('#user_text').append(br)
    $('#user_text').append(usernameSpan)
}
