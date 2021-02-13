let uuidWithAccess = null
let isLoggedIn = false

$('#sendDiscordConfirmBtn:enabled').on('click', () => {
    let btn = $('#sendDiscordConfirmBtn')
    btn.attr('disabled', 'disabled')
    btn.text('Vérification...')
    socket.emit('authRequest', null)
    socket.once('authResponse', (response) => {
        if (response) {
            notyf.success('Accès Autorisé')
            btn.removeAttr('disabled')
            btn.text('Vérifier mon Identité')
            $('#adminPanelLogin').fadeOut(500)
            $('#adminPanelContent').fadeIn(500)
        } else {
            notyf.error('Accès Refusé')
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

$('#backAdminPanelBtn').on('click', () => {
    switchView(getCurrentView(), VIEWS.landing)
})

//#region Tabs
let TabBlock = {
    s: {
        animLen: 200
    },

    init: function () {
        TabBlock.bindUIActions()
        TabBlock.hideInactive()
    },

    bindUIActions: function () {
        $('.tabBlock-tabs').on('click', '.tabBlock-tab', function () {
            TabBlock.switchTab($(this))
        })
    },

    hideInactive: function () {
        let $tabBlocks = $('.tabBlock')

        $tabBlocks.each(function (i) {
            let $tabBlock = $($tabBlocks[i])
            let $panes = $tabBlock.find('.tabBlock-pane')
            let $activeTab = $tabBlock.find('.tabBlock-tab.is-active')

            $panes.hide()
            $($panes[$activeTab.index()]).show()
        })
    },

    switchTab: function ($tab) {
        let $context = $tab.closest('.tabBlock')

        if (!$tab.hasClass('is-active')) {
            $tab.siblings().removeClass('is-active')
            $tab.addClass('is-active')

            TabBlock.showPane($tab.index(), $context)
        }
    },

    showPane: function (i, $context) {
        let $panes = $context.find('.tabBlock-pane')

        // Normally I'd frown at using jQuery over CSS animations, but we can't transition between unspecified variable heights, right? If you know a better way, I'd love a read it in the comments or on Twitter @johndjameson
        $panes.slideUp(TabBlock.s.animLen)
        $($panes[i]).slideDown(TabBlock.s.animLen)
    }
}

$(function () {
    TabBlock.init()
})
//#endregion Tabs
