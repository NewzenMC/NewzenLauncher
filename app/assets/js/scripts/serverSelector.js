const { ipcRenderer } = require('electron')

const focusInterval = setInterval(() => {
    if (document.hasFocus()) {
        document.getElementById('exit').style.top = '90vh'
        clearInterval(focusInterval)
    }
}, 500)

const currentServerID = document
    .getElementsByName('currentServer')
    .item(0).value

const currentServer = document.getElementById(currentServerID)

if (currentServer !== null) {
    currentServer.classList.add('currentServer')
    currentServer.classList.add('force-hover')
}

document.getElementById('exit').onclick = () => {
    window.close()
}

document.querySelectorAll('.server').forEach((server) => {
    server.onclick = () => {
        if (server.classList.contains('currentServer')) {
            notyf.error('Vous êtes déjà sur ce Serveur')
        } else {
            ipcRenderer.send('server-select', server.id)
            window.close()
        }
    }
})
