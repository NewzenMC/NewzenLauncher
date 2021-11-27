let authCancelled = true

$('#loginWithMicrosoftBtn').on('click', () => {
    authCancelled = false
    loginDisabled(true)
    loginLoading(true)
    loginPassword.disabled = true
    loginUsername.disabled = true
    $('#loginWithMicrosoftBtn').attr('disabled', 'disabled')

    const client_id = '92425d35-b7ea-4608-b193-abf85dcfb95d'
    const redirect_uri = 'http://127.0.0.1:25555'
    const scopes = encodeURIComponent('XboxLive.signin offline_access')
    ipcRenderer.send(
        'startMicrosoftAuth',
        `https://login.live.com/oauth20_authorize.srf?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scopes}`
    )
    ipcRenderer.once('microsoftAuthSuccess', async (_event, code) => {
        try {
            const uuid = await AuthManager.addMicrosoftAccount(code)

            updateSelectedAccount(uuid)

            loginButton.innerHTML = loginButton.innerHTML.replace(
                Lang.queryJS('login.loggingIn'),
                Lang.queryJS('login.success')
            )
            $('.circle-loader').toggleClass('load-complete')
            $('.checkmark').toggle()
            setTimeout(() => {
                switchView(VIEWS.login, loginViewOnSuccess, 500, 500, () => {
                    // Temporary workaround
                    if (loginViewOnSuccess === VIEWS.settings) {
                        prepareSettings()
                    }
                    loginViewOnSuccess = VIEWS.landing // Reset this for good measure.
                    loginCancelEnabled(false) // Reset this for good measure.
                    loginViewCancelHandler = null // Reset this for good measure.
                    loginUsername.value = ''
                    loginPassword.value = ''
                    $('.circle-loader').toggleClass('load-complete')
                    $('.checkmark').toggle()
                    loginLoading(false)
                    loginButton.innerHTML = loginButton.innerHTML.replace(
                        Lang.queryJS('login.success'),
                        Lang.queryJS('login.login')
                    )
                    formDisabled(false)
                })
            }, 1000)
        } catch (error) {
            showMicrosoftAuthError(error)
        }
    })
    ipcRenderer.once('microsoftAuthCancelled', (event) => {
        cancelMicrosoftLogin()
    })
    // socket.once('microsoftLogin', (data) => {
    //     // eslint-disable-next-line no-useless-return
    //     if (authCancelled) return
    //     if (data.error) return showMicrosoftAuthError()
    //     //TODO handle adding account to authmanager with token, uuid and username (also store refresh token)
    // })
})

/**
 * @param {Error} [error]
 */
function showMicrosoftAuthError(error) {
    loginDisabled(false)
    loginLoading(false)
    loginPassword.disabled = false
    loginUsername.disabled = false
    $('#loginWithMicrosoftBtn').removeAttr('disabled')
    setOverlayHandler(null)
    if (error !== undefined) {
        setOverlayContent(
            'Erreur',
            `Une Erreur est survenue :<br>${error.message}<br>Si le problème persiste, contactez TIEB62#3087 sur le Discord`,
            'Fermer'
        )
    } else {
        setOverlayContent(
            'Erreur',
            'Une Erreur est survenue, veuillez réessayer !<br>Si le problème persiste, contactez TIEB62#3087 sur le Discord',
            'Fermer'
        )
    }

    toggleOverlay(true)
}

function cancelMicrosoftLogin() {
    toggleOverlay(false)
    loginDisabled(false)
    loginLoading(false)
    loginPassword.disabled = false
    loginUsername.disabled = false
    $('#loginWithMicrosoftBtn').removeAttr('disabled')
    authCancelled = true
}
