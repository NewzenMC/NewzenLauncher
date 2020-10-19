// Work in progress
const logger = require('./loggerutil')('%c[DiscordWrapper]', 'color: #7289da; font-weight: bold')

const RPC = require('discord-rpc')

let client
let activity

exports.initRPC = function (genSettings, initialDetails = 'En Attente du Client..') {
    client = new RPC.Client({ transport: 'ipc' })

    activity = {
        details: initialDetails,
        state: 'Serveur : ' + 'NewdyCraft', //TODO Modifier dynamiquement le nom
        largeImageKey: 'newdycraft',
        largeImageText: 'NewdyCraft', //TODO Modifier dynamiquement le Texte
        smallImageKey: 'unknown', //TODO Changer le nom (maintenance/offline/online/unknown) en fonction du ping du serveur
        smallImageText: genSettings.smallImageText,
        startTimestamp: new Date().getTime(),
        instance: false
    }

    client.on('connected', () => {
        logger.log('Discord RPC Connecté')
        client.setActivity(activity)
    })

    client.login({ clientId: genSettings.clientId }).catch(error => {
        if (error.message.includes('ENOENT')) {
            logger.log('Impossible d\'initialiser Discord Rich Presence, aucun client détecté !')
        } else {
            logger.log('Impossible d\'initialiser Discord Rich Presence : ' + error.message, error)
        }
    })
}

exports.updateDetails = function (details) {
    activity.details = details
    client.setActivity(activity)
}

exports.shutdownRPC = function () {
    if (!client) return
    client.clearActivity()
    client.destroy()
    client = null
    activity = null
}