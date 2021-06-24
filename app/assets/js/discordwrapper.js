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

exports.initRPC = function () {
    client = new RPC.Client({ transport: 'ipc' })

    activity = {
        details: 'Sur le Launcher',
        largeImageKey: 'newzen',
        largeImageText: 'Newzen',
        instance: true,
        buttons: [
            { label: 'Site', url: 'https://newzen.fr' },
            { label: 'Discord', url: 'https://discord.newzen.fr' }
        ],
        //TODO Mettre le pseudo du compte sélectionné
        state: 'METTRE LE PSEUDO DU GARS'
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

exports.updateDetails = async function (details) {
    activity.details = details
    await client.setActivity(activity)
    logger.debug('Détails changés en ' + details)
}

exports.shutdownRPC = async function () {
    if (!client) return
    await client.clearActivity()
    await client.destroy()
    client = null
    activity = null
    logger.info('Discord RPC Stoppé !')
}

this.initRPC()
