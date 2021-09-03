const Convert = require('ansi-to-html')
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

//#region Admin Panel Listeners
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

        // Normally I'd frown at using jQuery over CSS animations, but we can't transition between unspecified variable heights, right? If you know a better way, I'd love a read it in the comments or on Twitter @johndjameson
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
    //prettier-ignore
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
