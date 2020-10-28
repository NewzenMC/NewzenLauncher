const Octicons = require('@primer/octicons')

function refreshAdminPanelAccess() {
    for (const account in ConfigManager.getAuthAccounts()) {
        $.get({
            url: 'http://tieb62.freeboxos.fr/authorized/' + account,
            success: (response) => {
                if (response === 'true') {
                    $('#adminPanelBtn').fadeIn(200)
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

$('#adminPanelLoginBtn').on('click', () => {
    $('.c-form__toggle').attr('data-title', 'OK/ERROR')
})

// Escape key return to main menu
document.onkeyup = (e) => {
    if (e.key === 'Escape' && getCurrentView() === VIEWS.adminPanel) {
        switchView(getCurrentView(), VIEWS.landing)
    }
}
