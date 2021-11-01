/* global setOverlayContent permissionLevel setOverlayHandler switchView getCurrentView VIEWS toggleOverlay socket */
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

    if (permissionLevel >= 3) {
        $('#maintenanceAccess').show()
    } else {
        $('#maintenanceAccess').hide()

        setOverlayContent(
            'Maintenance',
            "Newzen est actuellement en Maintenance,<br>Rejoignez le Discord pour plus d'informations",
            'Rejoindre le Discord'
        )
        setOverlayHandler(() => {
            require('electron').shell.openExternal('https://discord.newzen.fr')
        })
        $('#main').fadeOut()
        maintenanceInterval = setInterval(() => {
            if (permissionLevel >= 3) return
            toggleOverlay(true)
            $('#main').fadeOut()
        }, 100)
        toggleOverlay(true)
    }
    maintenanceStatus = true
}

/**
 * Disable Launcher's Maintenance Mode
 */
exports.disableMaintenance = () => {
    if (!this.isMaintenance()) return
    if (permissionLevel >= 3) {
        $('#maintenanceAccess').hide()
    } else {
        socket.emit('maintenance')
        clearInterval(maintenanceInterval)
        setOverlayHandler(null)
        toggleOverlay(false)
        $('#main').fadeIn()
        maintenanceStatus = false
    }
}
