// Work in progress
const logger = require('./loggerutil')('%c[DiscordWrapper]', 'color: #7289da; font-weight: bold')

const RPC = require('discord-rpc')
let client
let activity

exports.initRPC = function () {
    client = new RPC.Client({ transport: 'ipc' })

    activity = {
        details: 'Sur le Launcher',
        largeImageKey: 'newzen',
        largeImageText: 'Newzen',
        smallImageKey: 'maintenance',
        smallImageText: 'Maintenance',
        instance: false
    }

    client.on('connected', () => {
        logger.log('Discord RPC Connecté')
        client.setActivity(activity)
    })

    client.login({ clientId: '726151873983283300' }).catch(error => {
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

this.initRPC()