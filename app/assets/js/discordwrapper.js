const logger = require('./loggerutil')(
    '%c[DiscordWrapper]',
    'color: #7289da; font-weight: bold'
)

const RPC = require('discord-rpc')

/**
 * @type {RPC.Client}
 */
let client
/**
 * @type {RPC.Presence}
 */
let activity

exports.initRPC = () => {
    client = new RPC.Client({ transport: 'ipc' })

    activity = {
        state: 'Sur le Launcher',
        largeImageKey: 'newzen',
        largeImageText: 'Newzen',
        instance: true,
        buttons: [
            { label: 'Site', url: 'https://newzen.fr' },
            { label: 'Discord', url: 'https://discord.newzen.fr' }
        ],
        details: 'Récupération du Pseudo...'
        //NEWFEATURE Utiliser les spectateSecret, joinSecret, partySize, partyMax, etc pour rejoindre la partie du gars
    }

    client.on('connected', async () => {
        await client.setActivity(activity)
        logger.info('Discord RPC Connecté')
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

exports.updateState = async (details) => {
    activity.state = details
    await client.setActivity(activity)
    logger.info('Status changé en ' + details)
}

exports.updateUsername = async (username) => {
    activity.details = username
    // Initial call of this function is before RPC is initialized but we need to save username in activity object (will be used during RPC Initialization)
    try {
        await client.setActivity(activity)
    } catch (error) {}
    logger.info('Pseudo changé en ' + username)
}

exports.startTimer = async () => {
    activity.startTimestamp = Date.now()
    await client.setActivity(activity)
    logger.info('Timer Démarré')
}

exports.stopTimer = async () => {
    activity.startTimestamp = undefined
    await client.setActivity(activity)
    logger.info('Timer Stoppé')
}

exports.shutdownRPC = async () => {
    if (!client) return
    await client.clearActivity()
    await client.destroy()
    client = null
    activity = null
    logger.info('Discord RPC Stoppé !')
}

this.initRPC()
