const Octicons = require('@primer/octicons')
const bcrypt = require('bcrypt')

let uuidWithAccess = null
let isLoggedIn = false

$('#sendDiscordConfirmBtn:enabled').on('click', () => {
    let btn = $('#sendDiscordConfirmBtn')
    btn.attr('disabled', 'disabled')
    btn.text('Vérification...')
    socket.emit('authRequest', null)
    socket.on('authResponse', (response) => {
        if (response) {
            btn.text('Accès Autorisé !')
            setTimeout(() => {
                btn.removeAttr('disabled')
                btn.text('Vérifier mon Identité')
                $('#adminPanelLogin').fadeOut(500)
                $('#adminPanelContent').fadeIn(500)
            }, 2000)
        } else {
            btn.text('Accès Refusé !')
            setTimeout(() => {
                btn.removeAttr('disabled')
                btn.text('Vérifier mon Identité')
            }, 2000)
        }
    })
})

$('#adminPanelBtn').on('click', () => {
    switchView(getCurrentView(), VIEWS.adminPanel)
})

$('#backAdminPanelSVG').html(Octicons['chevron-left'].toSVG())

$('#backAdminPanelBtn').on('click', () => {
    switchView(getCurrentView(), VIEWS.landing)
})
