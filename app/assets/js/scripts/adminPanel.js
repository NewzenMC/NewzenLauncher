function refreshAdminPanelAccess() {
    for (const account in ConfigManager.getAuthAccounts()) {
        $.get({
            url: 'http://tieb62.freeboxos.fr/authorized/' + account,
            success: response => {
                if (response === 'true') {
                    $('#adminPanelBtn').fadeIn(200)
                } else {
                    $('#adminPanelBtn').fadeOut(200)
                }
            }
        })
    }
}

$('#adminPanelBtn').on('click', () => {
    switchView(getCurrentView(), VIEWS.adminPanel)
})

// Escape key return to main menu
document.onkeyup = (e) => {
    if (e.key === 'Escape' && getCurrentView() === VIEWS.adminPanel) { // escape key maps to keycode `27` 
        switchView(getCurrentView(), VIEWS.landing)
    }
}

refreshAdminPanelAccess()
//NEWFEATURE Refresh dès que l'utilisateur ajoute ou supprime un compte du launcher