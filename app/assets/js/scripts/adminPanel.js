function refreshAdminPanelAccess() {
    for (const account in ConfigManager.getAuthAccounts()) {
        $.get({
            url: 'http://tieb62.freeboxos.fr/authorized/' + account,
            success: response => {
                if (response === 'true') {
                    showAdminPanelButton()
                }
            }
        })
    }
}

function showAdminPanelButton() {
    //TODO: Afficher Admin Panel Button
}

refreshAdminPanelAccess()
//FIXME Refresh dès que l'utilisateur ajoute ou supprime un compte du launcher