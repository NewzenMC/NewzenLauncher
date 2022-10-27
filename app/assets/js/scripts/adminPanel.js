const adminPanelLogger = LoggerUtil(
    '%c[AdminPanel]',
    'color: #FFFFFF; font-weight: bold'
)

const Convert = require('ansi-to-html')
const axios = require('axios').default
const convert = new Convert({
    fg: '#FFF',
    bg: '#000',
    newline: true
})

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
            $('.content').fadeOut(500) // Parent element of #adminPanelLogin
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

//#region Listeners

socket.on('minage.logs', (logs) => {
    $('#minageTerm').children().remove()
    logs.forEach((line) => {
        const escapedLine = escapeHtml(line)
        const ansiConvertedLine = convert.toHtml(escapedLine)
        const mcColorParsedLine = parseStyle(ansiConvertedLine)
        const termDiv = $('<div></div>').append(mcColorParsedLine)
        termDiv.appendTo($('#minageTerm'))
    })

    // Scroll All Terminals To Bottom
    document.querySelectorAll('.terminal').forEach((element) => {
        $(element).scrollTop($(element)[0].scrollHeight)
    })

    socket.emit('minage.status') // Unless the Status is "Unknown"
})
socket.on('delta.logs', (logs) => {
    $('#deltaTerm').children().remove()
    logs.forEach((line) => {
        const escapedLine = escapeHtml(line)
        const ansiConvertedLine = convert.toHtml(escapedLine)
        const mcColorParsedLine = parseStyle(ansiConvertedLine)
        const termDiv = $('<div></div>').append(mcColorParsedLine)
        termDiv.appendTo($('#deltaTerm'))
    })

    // Scroll All Terminals To Bottom
    document.querySelectorAll('.terminal').forEach((element) => {
        $(element).scrollTop($(element)[0].scrollHeight)
    })

    socket.emit('delta.status') // Unless the Status is "Unknown"
})

socket.on('minage.log', (line) => {
    const escapedLine = escapeHtml(line)
    const ansiConvertedLine = convert.toHtml(escapedLine)
    const mcColorParsedLine = parseStyle(ansiConvertedLine)
    const termDiv = $('<div></div>').append(mcColorParsedLine)
    termDiv.appendTo($('#minageTerm'))
})
socket.on('delta.log', (line) => {
    const escapedLine = escapeHtml(line)
    const ansiConvertedLine = convert.toHtml(escapedLine)
    const mcColorParsedLine = parseStyle(ansiConvertedLine)
    const termDiv = $('<div></div>').append(mcColorParsedLine)
    termDiv.appendTo($('#deltaTerm'))
})

socket.on('minage.status', (status) => {
    $('#minageStatus').removeClass('unknown')
    $('#minageStatus').removeClass('offline')
    $('#minageStatus').removeClass('online')
    $('#minageStatus').removeClass('starting')
    $('#minageStatus').removeClass('stopping')

    switch (status) {
        case 'STOPPED':
            $('#minageStatus').addClass('offline')
            $('#minageStatus h2').html('Arrêté')

            $('#minageStartBtn').removeAttr('disabled')
            $('#minageSetReadyBtn').attr('disabled', 'disabled')
            $('#minageStopBtn').attr('disabled', 'disabled')
            $('#minageKillBtn').attr('disabled', 'disabled')
            break

        case 'STARTING':
            $('#minageStatus').addClass('starting')
            $('#minageStatus h2').html('Démarrage..')

            $('#minageStartBtn').attr('disabled', 'disabled')
            $('#minageSetReadyBtn').removeAttr('disabled')
            $('#minageStopBtn').attr('disabled', 'disabled')
            $('#minageKillBtn').removeAttr('disabled')
            break

        case 'RUNNING':
            $('#minageStatus').addClass('online')
            $('#minageStatus h2').html('En Ligne')

            $('#minageStartBtn').attr('disabled', 'disabled')
            $('#minageSetReadyBtn').attr('disabled', 'disabled')
            $('#minageStopBtn').removeAttr('disabled')
            $('#minageKillBtn').removeAttr('disabled')
            break

        case 'STOPPING':
            $('#minageStatus').addClass('stopping')
            $('#minageStatus h2').html('Arrêt en Cours..')

            $('#minageStartBtn').attr('disabled', 'disabled')
            $('#minageSetReadyBtn').attr('disabled', 'disabled')
            $('#minageStopBtn').attr('disabled', 'disabled')
            $('#minageKillBtn').removeAttr('disabled')
            break

        case 'KILLED':
            $('#minageStatus').addClass('offline')
            $('#minageStatus h2').html('Processus Tué')

            $('#minageStartBtn').removeAttr('disabled')
            $('#minageSetReadyBtn').attr('disabled', 'disabled')
            $('#minageStopBtn').attr('disabled', 'disabled')
            $('#minageKillBtn').attr('disabled', 'disabled')
            break

        case 'CRASHED':
            $('#minageStatus').addClass('offline')
            $('#minageStatus h2').html('Crashé')

            $('#minageStartBtn').removeAttr('disabled')
            $('#minageSetReadyBtn').attr('disabled', 'disabled')
            $('#minageStopBtn').attr('disabled', 'disabled')
            $('#minageKillBtn').attr('disabled', 'disabled')
            break
    }
})
socket.on('delta.status', (status) => {
    $('#deltaStatus').removeClass('unknown')
    $('#deltaStatus').removeClass('offline')
    $('#deltaStatus').removeClass('online')
    $('#deltaStatus').removeClass('starting')
    $('#deltaStatus').removeClass('stopping')

    switch (status) {
        case 'STOPPED':
            $('#deltaStatus').addClass('offline')
            $('#deltaStatus h2').html('Arrêté')

            $('#deltaStartBtn').removeAttr('disabled')
            $('#deltaSetReadyBtn').attr('disabled', 'disabled')
            $('#deltaStopBtn').attr('disabled', 'disabled')
            $('#deltaKillBtn').attr('disabled', 'disabled')
            break

        case 'STARTING':
            $('#deltaStatus').addClass('starting')
            $('#deltaStatus h2').html('Démarrage..')

            $('#deltaStartBtn').attr('disabled', 'disabled')
            $('#deltaSetReadyBtn').removeAttr('disabled')
            $('#deltaStopBtn').attr('disabled', 'disabled')
            $('#deltaKillBtn').removeAttr('disabled')
            break

        case 'RUNNING':
            $('#deltaStatus').addClass('online')
            $('#deltaStatus h2').html('En Ligne')

            $('#deltaStartBtn').attr('disabled', 'disabled')
            $('#deltaSetReadyBtn').attr('disabled', 'disabled')
            $('#deltaStopBtn').removeAttr('disabled')
            $('#deltaKillBtn').removeAttr('disabled')
            break

        case 'STOPPING':
            $('#deltaStatus').addClass('stopping')
            $('#deltaStatus h2').html('Arrêt en Cours..')

            $('#deltaStartBtn').attr('disabled', 'disabled')
            $('#deltaSetReadyBtn').attr('disabled', 'disabled')
            $('#deltaStopBtn').attr('disabled', 'disabled')
            $('#deltaKillBtn').removeAttr('disabled')
            break

        case 'KILLED':
            $('#deltaStatus').addClass('offline')
            $('#deltaStatus h2').html('Processus Tué')

            $('#deltaStartBtn').removeAttr('disabled')
            $('#deltaSetReadyBtn').attr('disabled', 'disabled')
            $('#deltaStopBtn').attr('disabled', 'disabled')
            $('#deltaKillBtn').attr('disabled', 'disabled')
            break

        case 'CRASHED':
            $('#deltaStatus').addClass('offline')
            $('#deltaStatus h2').html('Crashé')

            $('#deltaStartBtn').removeAttr('disabled')
            $('#deltaSetReadyBtn').attr('disabled', 'disabled')
            $('#deltaStopBtn').attr('disabled', 'disabled')
            $('#deltaKillBtn').attr('disabled', 'disabled')
            break
    }
})

$('#minageStartBtn').on('click', () => {
    socket.emit('minage.start')

    $('#minageStartBtn').attr('disabled', 'disabled')
    $('#minageSetReadyBtn').removeAttr('disabled')
    $('#minageStopBtn').attr('disabled', 'disabled')
    $('#minageKillBtn').removeAttr('disabled')
})
$('#minageSetReadyBtn').on('click', () => {
    socket.emit('minage.setReady')

    $('#minageStartBtn').attr('disabled', 'disabled')
    $('#minageSetReadyBtn').attr('disabled', 'disabled')
    $('#minageStopBtn').removeAttr('disabled')
    $('#minageKillBtn').removeAttr('disabled')
})
$('#minageStopBtn').on('click', () => {
    socket.emit('minage.stop')

    $('#minageStartBtn').attr('disabled', 'disabled')
    $('#minageSetReadyBtn').attr('disabled', 'disabled')
    $('#minageStopBtn').attr('disabled', 'disabled')
    $('#minageKillBtn').removeAttr('disabled')
})
minageKillCount = 0
$('#minageKillBtn').on('click', () => {
    if (minageKillCount === 0) {
        minageKillCount = 1
        $('#minageKillBtn').html('Re-Cliquez pour Confirmer')
        setTimeout(() => {
            $('#minageKillBtn').html('Tuer')
            minageKillCount = 0
        }, 2500)
    } else if (minageKillCount === 1) {
        socket.emit('minage.kill')
        $('#minageKillBtn').html('Tuer')
        minageKillCount = 0

        $('#minageStartBtn').removeAttr('disabled')
        $('#minageSetReadyBtn').attr('disabled', 'disabled')
        $('#minageStopBtn').attr('disabled', 'disabled')
        $('#minageKillBtn').attr('disabled', 'disabled')
    }
})

$('#deltaStartBtn').on('click', () => {
    socket.emit('delta.start')

    $('#deltaStartBtn').attr('disabled', 'disabled')
    $('#deltaSetReadyBtn').removeAttr('disabled')
    $('#deltaStopBtn').attr('disabled', 'disabled')
    $('#deltaKillBtn').removeAttr('disabled')
})
$('#deltaSetReadyBtn').on('click', () => {
    socket.emit('delta.setReady')

    $('#deltaStartBtn').attr('disabled', 'disabled')
    $('#deltaSetReadyBtn').attr('disabled', 'disabled')
    $('#deltaStopBtn').removeAttr('disabled')
    $('#deltaKillBtn').removeAttr('disabled')
})
$('#deltaStopBtn').on('click', () => {
    socket.emit('delta.stop')

    $('#deltaStartBtn').attr('disabled', 'disabled')
    $('#deltaSetReadyBtn').attr('disabled', 'disabled')
    $('#deltaStopBtn').attr('disabled', 'disabled')
    $('#deltaKillBtn').removeAttr('disabled')
})
deltaKillCount = 0
$('#deltaKillBtn').on('click', () => {
    if (deltaKillCount === 0) {
        deltaKillCount = 1
        $('#deltaKillBtn').html('Re-Cliquez pour Confirmer')
        setTimeout(() => {
            $('#deltaKillBtn').html('Tuer')
            deltaKillCount = 0
        }, 2500)
    } else if (deltaKillCount === 1) {
        socket.emit('delta.kill')
        $('#deltaKillBtn').html('Tuer')
        deltaKillCount = 0

        $('#deltaStartBtn').removeAttr('disabled')
        $('#deltaSetReadyBtn').attr('disabled', 'disabled')
        $('#deltaStopBtn').attr('disabled', 'disabled')
        $('#deltaKillBtn').attr('disabled', 'disabled')
    }
})

let sendNotifWhenScreenshot = true
$('#sendNotifWhenScreenshotBtn').on('click', () => {
    sendNotifWhenScreenshot = !sendNotifWhenScreenshot
    if (sendNotifWhenScreenshot) {
        $('#sendNotifWhenScreenshotSpan').html('Oui')
    } else {
        $('#sendNotifWhenScreenshotSpan').html('Non')
    }
})

socket.on('playerList', (uuidList) => {
    $('#adminPanelPlayerList').empty()
    $('#adminPanelPlayerList').append(
        $('<li id="playerListLoading">Chargement...</li>')
    )
    adminPanelLogger.info('Started Resolving Player List UUIDs')
    uuidList.forEach((uuid, index) => {
        axios({
            method: 'get',
            url: `https://api.minetools.eu/uuid/${uuid}`,
            responseType: 'json'
        }).then((response) => {
            adminPanelLogger.info(
                `Resolved UUID ${uuid} to ${response.data.name}`
            )
            $('#adminPanelPlayerList').append(
                $(
                    `<li uuid="${uuid}">${response.data.name}<button class="btn">Capture d'écran</button></li>`
                )
            )

            // If last item, remove loading message & set button clicks listeners
            if (index === uuidList.length - 1) {
                adminPanelLogger.info('Finished Resolving Player List UUIDs')
                $('#playerListLoading').remove()

                $('#adminPanelPlayerList .btn').on('click', (e) => {
                    const uuid = $(e.target).parent().attr('uuid')
                    socket.emit(
                        'take-screenshot',
                        uuid,
                        sendNotifWhenScreenshot
                    )
                    notyf.success(
                        "Si le joueur à son jeu lancé, une capture d'écran sera effectuée puis envoyée sur le serveur, vérifiez l'onglet Screenshots"
                    )
                    $(e.target).attr('disabled', 'disabled')
                    setTimeout(() => {
                        $(e.target).removeAttr('disabled')
                    }, 2500)
                })
            }
        })
    })
})

socket.on('screenshots', (screenshots) => {
    $('#adminPanelScreenshotsList').empty()
    $('#adminPanelScreenshotsList').append(
        $('<li id="screenshotsListLoading">Chargement...</li>')
    )

    // Reverse in oder to have the latest screenshot at the top
    screenshots = screenshots.reverse()

    screenshots.forEach((screenshot) => {
        // prettier-ignore
        $('#adminPanelScreenshotsList').append(
            $(
                `<li filename="${screenshot.filename}">${
                    screenshot.playerName
                } (${screenshot.playerUUID}) ${new Date(
                    screenshot.time
                ).toLocaleString()}<button class="btn-download">Télécharger</button><button class="btn-delete">Supprimer</button></li>`
            )
        )
    })

    $('#screenshotsListLoading').remove()

    $('#adminPanelScreenshotsList .btn-download').on('click', (e) => {
        const filename = $(e.target).parent().attr('filename')
        ipcRenderer.send('whereSaveScreenshot', filename)
    })
    $('#adminPanelScreenshotsList .btn-delete').on('click', (e) => {
        const filename = $(e.target).parent().attr('filename')
        socket.emit('delete-screenshot', filename)
        notyf.success('Demande de suppression...')
    })
})

let savePath = null
ipcRenderer.on('saveScreenshotPath', (event, response) => {
    socket.emit('get-screenshot', response.filename)
    savePath = response.selectedPath
    notyf.success('Démarrage du Téléchargement...')
})

socket.on('get-screenshot', (screenshot) => {
    if (savePath !== null) {
        require('fs').writeFile(savePath, screenshot, (err) => {
            if (err) {
                notyf.error('Erreur lors du Téléchargement')
                adminPanelLogger.error(err)
            } else {
                notyf.success('Téléchargement Terminé !')
            }
        })
        savePath = null
    }
})

//#endregion Listeners

//#region AutoScroll

// Create an observer instance
let mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        let newNodes = mutation.addedNodes // DOM NodeList
        if (newNodes !== null) {
            document.querySelectorAll('.terminal').forEach((element) => {
                $(element).scrollTop($(element)[0].scrollHeight)
            })
        }
    })
})

// Enable/Disable AutoScroll
$('#autoScroll').on('change', () => {
    if ($('#autoScroll').prop('checked')) {
        document.querySelectorAll('.terminal').forEach((element) => {
            mutationObserver.observe(element, {
                attributes: false,
                characterData: false,
                childList: true,
                subtree: true
            })
        })
    } else {
        mutationObserver.disconnect()
    }
})

// AutoScroll All the Terminals by Default
document.querySelectorAll('.terminal').forEach((element) => {
    mutationObserver.observe(element, {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true
    })
})

//#endregion AutoScroll

$('#maintenanceMode').on('change', () => {
    socket.emit(
        'setMaintenance',
        $('#maintenanceMode').prop('checked').toString()
    )
})

//#endregion Admin Panel Listeners

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

        $panes.slideUp(TabBlock.s.animLen)
        $($panes[i]).slideDown(TabBlock.s.animLen)
    }
}

$(function () {
    TabBlock.init()
})
//#endregion Tabs

//#region Minecraft Color Code to HTML

let obfuscators = []
let styleMap = {
    '§0': 'color:#000000',
    '§1': 'color:#0000AA',
    '§2': 'color:#00AA00',
    '§3': 'color:#00AAAA',
    '§4': 'color:#AA0000',
    '§5': 'color:#AA00AA',
    '§6': 'color:#FFAA00',
    '§7': 'color:#AAAAAA',
    '§8': 'color:#555555',
    '§9': 'color:#5555FF',
    '§a': 'color:#55FF55',
    '§b': 'color:#55FFFF',
    '§c': 'color:#FF5555',
    '§d': 'color:#FF55FF',
    '§e': 'color:#FFFF55',
    '§f': 'color:#FFFFFF',
    '§l': 'font-weight:bold',
    '§m': 'text-decoration:line-through',
    '§n': 'text-decoration:underline',
    '§o': 'font-style:italic'
}

function obfuscate(string, elem) {
    let magicSpan, currNode
    if (string.indexOf('<br>') > -1) {
        elem.innerHTML = string
        for (let j = 0, len = elem.childNodes.length; j < len; j++) {
            currNode = elem.childNodes[j]
            if (currNode.nodeType === 3) {
                magicSpan = document.createElement('span')
                magicSpan.innerHTML = currNode.nodeValue
                elem.replaceChild(magicSpan, currNode)
                init(magicSpan)
            }
        }
    } else {
        init(elem, string)
    }

    function init(el, str) {
        let i = 0
        let obsStr = str || el.innerHTML
        let len = obsStr.length
        obfuscators.push(
            window.setInterval(function () {
                if (i >= len) i = 0
                obsStr = replaceRand(obsStr, i)
                el.innerHTML = obsStr
                i++
            }, 0)
        )
    }

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    function replaceRand(string, i) {
        let randChar = String.fromCharCode(randInt(64, 95))
        return (
            string.substr(0, i) + randChar + string.substr(i + 1, string.length)
        )
    }
}

function applyCode(string, codes) {
    let elem = document.createElement('span')
    let obfuscated = false
    // eslint-disable-next-line no-control-regex
    string = string.replace(/\x00*/g, '')
    for (let i = 0, len = codes.length; i < len; i++) {
        elem.style.cssText += styleMap[codes[i]] + ';'
        if (codes[i] === '§k') {
            obfuscate(string, elem)
            obfuscated = true
        }
    }
    if (!obfuscated) elem.innerHTML = string
    return elem
}

function parseStyle(string) {
    let codes = string.match(/§.{1}/g) || []
    let indexes = []
    let apply = []
    let tmpStr
    let deltaIndex
    let noCode
    let final = document.createDocumentFragment()
    let i
    string = string.replace(/\n|\\n/g, '<br>')
    for (i = 0, len = codes.length; i < len; i++) {
        indexes.push(string.indexOf(codes[i]))
        string = string.replace(codes[i], '\x00\x00')
    }
    if (indexes[0] !== 0) {
        final.appendChild(applyCode(string.substring(0, indexes[0]), []))
    }
    for (i = 0; i < len; i++) {
        indexDelta = indexes[i + 1] - indexes[i]
        if (indexDelta === 2) {
            while (indexDelta === 2) {
                apply.push(codes[i])
                i++
                indexDelta = indexes[i + 1] - indexes[i]
            }
            apply.push(codes[i])
        } else {
            apply.push(codes[i])
        }
        if (apply.lastIndexOf('§r') > -1) {
            apply = apply.slice(apply.lastIndexOf('§r') + 1)
        }
        tmpStr = string.substring(indexes[i], indexes[i + 1])
        final.appendChild(applyCode(tmpStr, apply))
    }
    return final
}

function clearObfuscators() {
    let i = obfuscators.length
    // prettier-ignore
    for (; i--;) {
        clearInterval(obfuscators[i])
    }
    obfuscators = []
}

//#endregion Minecraft Color Code to HTML

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }

    return text.replace(/[&<>"']/g, function (m) {
        return map[m]
    })
}
