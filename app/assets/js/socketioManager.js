const socket = require('socket.io-client')('http://tieb62.freeboxos.fr:8080')
const Maintenance = require('./assets/js/maintenance')

let permissionLevel = 0

socket.on('connect', () => {
    socket.send(Object.keys(ConfigManager.getAuthAccounts())[0])
})

socket.on('message', (data) => {
    if (data.maintenance) Maintenance.enableMaintenance()
    else Maintenance.disableMaintenance()
    permisisonLevel = data.adminPanelPermissions
    if (permisisonLevel !== 0) {
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
