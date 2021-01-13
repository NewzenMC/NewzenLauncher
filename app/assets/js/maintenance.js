let maintenanceStatus = false
let maintenanceInterval = null

/**
 * Get the current Maintenance Status
 * @return {boolean} The curent Maintenance Status
 */
exports.isMaintenance = function () {
    return maintenanceStatus
}

/**
 * Enable Launcher's Maintenance Mode
 */
exports.enableMaintenance = () => {
    if (this.isMaintenance()) return
    setOverlayContent('Maintenance', 'Newzen est actuellement en Maintenance,<br>Rejoignez le Discord pour plus d\'informations', 'Rejoindre le Discord')
    setOverlayHandler(() => {
        require('electron').shell.openExternal('https://tieb62.freeboxos.fr/discord')
    })
    $('#main').fadeOut()
    maintenanceInterval = setInterval(() => {
        toggleOverlay(true)
    }, 100)
    toggleOverlay(true)
    maintenanceStatus = true
}

/**
 * Disable Launcher's Maintenance Mode
 */
exports.disableMaintenance = () => {
    if (!this.isMaintenance()) return
    socket.emit('maintenance')
    clearInterval(maintenanceInterval)
    setOverlayHandler(null)
    toggleOverlay(false)
    $('#main').fadeIn()
    maintenanceStatus = false
}