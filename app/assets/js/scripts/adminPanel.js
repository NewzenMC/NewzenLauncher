const Octicons = require('@primer/octicons')
const bcrypt = require('bcrypt')

var uuidWithAccess = null
var isLoggedIn = false

function refreshAdminPanelAccess() {
    for (const account in ConfigManager.getAuthAccounts()) {
        $.get({
            url: 'http://tieb62.freeboxos.fr/authorized/' + account,
            success: (response) => {
                if (response === 'true') {
                    $('#adminPanelBtn').fadeIn(200)
                    uuidWithAccess = account
                } else {
                    $('#adminPanelBtn').fadeOut(200)
                }
            }
        })
    }
}
refreshAdminPanelAccess()
//NEWFEATURE Refresh dès que l'utilisateur ajoute ou supprime un compte du launcher

$('#adminPanelBtn').on('click', () => {
    switchView(getCurrentView(), VIEWS.adminPanel)
})

$('#backAdminPanelSVG').html(Octicons['chevron-left'].toSVG())

$('#backAdminPanelBtn').on('click', () => {
    switchView(getCurrentView(), VIEWS.landing)
})

// Escape key return to main menu
document.onkeyup = (e) => {
    if (e.key === 'Escape' && getCurrentView() === VIEWS.adminPanel) {
        switchView(getCurrentView(), VIEWS.landing)
    }
    if (e.key === 'F1' && isLoggedIn === false) {
        $.get({
            url: 'http://tieb62.freeboxos.fr/getPasswordHash/' + uuidWithAccess,
            success: (response, status, jqXHR) => {
                if (jqXHR.status === 403) {
                    $('#adminPanelBtn').fadeOut(200)
                    $('.c-form__toggle').attr('data-title', 'RATÉ !')
                } else {
                    var hashFromServer = response

                    // eslint-disable-next-line node/handle-callback-err
                    bcrypt.compare(
                        $('.c-form__input').val(),
                        hashFromServer,
                        // eslint-disable-next-line node/handle-callback-err
                        (err, valid) => {
                            if (valid) {
                                $('.c-form__toggle').attr('data-title', 'OK')
                                $('#adminPanelLogin').hide(250)
                                $('#adminPanelContent').show(250)
                                isLoggedIn = true
                            } else {
                                $('.c-form__toggle').attr(
                                    'data-title',
                                    'RATÉ !'
                                )
                            }
                        }
                    )
                }
                //$('.c-form__toggle').attr('data-title', 'RATÉ !')
            }
        })
    }
}
