const logger = require('./loggerutil')(
    '%c[DiscordWrapper]',
    'color: #7289da; font-weight: bold'
)

const RPC = require('discord-rpc')
let client
let activity

exports.initRPC = function () {
    client = new RPC.Client({ transport: 'ipc' })

    activity = {
        details: 'Sur le Launcher',
        largeImageKey: 'newzen',
        largeImageText: 'Newzen',
        smallImageKey: 'unknown',
        smallImageText: 'Status du Serveur Inconnu',
        instance: true
    }

    client.on('connected', () => {
        logger.info('Discord RPC Connecté')
        client.setActivity(activity)
    })

    client.login({ clientId: '726151873983283300' }).catch((error) => {
        if (error.message.includes('ENOENT')) {
            logger.warn(
                "Impossible d'initialiser Discord RPC, aucun client Discord détecté !"
            )
        } else {
            logger.error(
                "Impossible d'initialiser Discord RPC : " + error.message,
                error
            )
        }
    })
}

exports.updateDetails = function (details) {
    activity.details = details
    client.setActivity(activity)
    logger.debug('Détails changés en ' + details)
}

exports.shutdownRPC = function () {
    if (!client) return
    client.clearActivity()
    client.destroy()
    client = null
    activity = null
    logger.info('Discord RPC Stoppée !')
}

exports.changeServerStatus = function (status) {
    switch (status) {
        case 'online':
            activity.smallImageKey = 'online'
            activity.smallImageText = 'Serveur en Ligne'
            client.setActivity(activity)
            logger.debug('Status du Serveur Changé en Online')
            break
        case 'offline':
            activity.smallImageKey = 'offline'
            activity.smallImageText = 'Serveur Hors-Ligne'
            client.setActivity(activity)
            logger.debug('Status du Serveur Changé en Offline')
            break
        case 'maintenance':
            activity.smallImageKey = 'maintenance'
            activity.smallImageText = 'Serveur en Maintenance'
            client.setActivity(activity)
            logger.debug('Status du Serveur Changé en Maintenance')
            break
        case 'unknown':
            activity.smallImageKey = 'unknown'
            activity.smallImageText = 'Status du Serveur Inconnu'
            client.setActivity(activity)
            logger.debug('Status du Serveur Changé en Inconnu')
            break
        default:
            throw new Error('Unknown status: ' + status)
    }
}

this.initRPC()
