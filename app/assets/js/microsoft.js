const axios = require('axios').default
const qs = require('querystring')

const client_id = '92425d35-b7ea-4608-b193-abf85dcfb95d'
const redirect_uri = 'http://127.0.0.1:25555'

/**
 * Get Minecraft Profile Info from Microsoft Authentication Code
 * @param {string} code Microsoft Authentication Code
 */
exports.authFromCode = async (code) => {
    try {
        /* Microsoft Auth Code => Microsoft Token */
        const microsoftResult = await axios({
            method: 'post',
            url: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({
                client_id: client_id,
                scope: 'offline_access XboxLive.signin',
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code',
                code: code
            })
        })

        const microsoftAccessToken = microsoftResult.data.access_token
        const microsoftRefreshToken = microsoftResult.data.refresh_token

        /* XBL Auth */
        const xblResult = await axios({
            method: 'post',
            url: 'https://user.auth.xboxlive.com/user/authenticate',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: JSON.stringify({
                Properties: {
                    AuthMethod: 'RPS',
                    SiteName: 'user.auth.xboxlive.com',
                    RpsTicket: `d=${microsoftAccessToken}`
                },
                RelyingParty: 'http://auth.xboxlive.com',
                TokenType: 'JWT'
            }),
            responseType: 'json'
        })

        const xblToken = xblResult.data.Token
        const userhash = xblResult.data.DisplayClaims.xui[0].uhs

        /* XSTS Auth */
        const xstsResult = await axios({
            method: 'post',
            url: 'https://xsts.auth.xboxlive.com/xsts/authorize',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: JSON.stringify({
                Properties: {
                    SandboxId: 'RETAIL',
                    UserTokens: [xblToken]
                },
                RelyingParty: 'rp://api.minecraftservices.com/',
                TokenType: 'JWT'
            }),
            responseType: 'json'
        })

        const xstsToken = xstsResult.data.Token

        /* Minecraft Auth */
        const minecraftResult = await axios({
            method: 'post',
            url: 'https://api.minecraftservices.com/authentication/login_with_xbox',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                identityToken: `XBL3.0 x=${userhash};${xstsToken}`
            }),
            responseType: 'json'
        })

        const minecraftToken = minecraftResult.data.access_token

        /* Check Game Ownership */
        const checkGameOwnershipResult = await axios({
            method: 'get',
            url: 'https://api.minecraftservices.com/entitlements/mcstore',
            headers: {
                Authorization: `Bearer ${minecraftToken}`
            },
            responseType: 'json'
        })

        let ownMinecraft = false
        if (checkGameOwnershipResult.data.items.length >= 2) ownMinecraft = true

        if (ownMinecraft) {
            /* Get Profile Info */
            let profileInfoResult = await axios({
                method: 'get',
                url: 'https://api.minecraftservices.com/minecraft/profile',
                headers: {
                    Authorization: `Bearer ${minecraftToken}`
                },
                responseType: 'json'
            })

            const playerUUID = profileInfoResult.data.id
            const playerName = profileInfoResult.data.name
            return {
                token: minecraftToken,
                uuid: playerUUID,
                name: playerName,
                refreshToken: microsoftRefreshToken
            }
        } else {
            return {
                error: 'Vous ne possédez pas Minecraft !',
                errorCode: 'notOwnMinecraft'
            }
        }
    } catch (error) {
        return {
            error: error,
            errorCode: 'unknown'
        }
    }
}

/**
 * Check if the Token is Valid
 * @param {string} accessToken
 * @returns {boolean}
 */
exports.validate = async (accessToken) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url: 'https://api.minecraftservices.com/minecraft/profile',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .catch(function (error) {
                resolve(false)
            })
            .then((response) => {
                resolve(true)
            })
    })
}

exports.refresh = async (refreshToken) => {
    const refreshResult = await axios({
        method: 'post',
        url: 'https://login.live.com/oauth20_token.srf',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
            client_id: client_id,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            redirect_uri: redirect_uri
        })
    })
    const microsoftAccessToken = refreshResult.data.access_token
    const microsoftRefreshToken = refreshResult.data.refresh_token

    /* XBL Auth */
    const xblResult = await axios({
        method: 'post',
        url: 'https://user.auth.xboxlive.com/user/authenticate',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        data: JSON.stringify({
            Properties: {
                AuthMethod: 'RPS',
                SiteName: 'user.auth.xboxlive.com',
                RpsTicket: `d=${microsoftAccessToken}`
            },
            RelyingParty: 'http://auth.xboxlive.com',
            TokenType: 'JWT'
        }),
        responseType: 'json'
    })

    const xblToken = xblResult.data.Token
    const userhash = xblResult.data.DisplayClaims.xui[0].uhs

    /* XSTS Auth */
    const xstsResult = await axios({
        method: 'post',
        url: 'https://xsts.auth.xboxlive.com/xsts/authorize',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        data: JSON.stringify({
            Properties: {
                SandboxId: 'RETAIL',
                UserTokens: [xblToken]
            },
            RelyingParty: 'rp://api.minecraftservices.com/',
            TokenType: 'JWT'
        }),
        responseType: 'json'
    })

    const xstsToken = xstsResult.data.Token

    /* Minecraft Auth */
    const minecraftResult = await axios({
        method: 'post',
        url: 'https://api.minecraftservices.com/authentication/login_with_xbox',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            identityToken: `XBL3.0 x=${userhash};${xstsToken}`
        }),
        responseType: 'json'
    })

    const minecraftToken = minecraftResult.data.access_token

    /* Check Game Ownership */
    const checkGameOwnershipResult = await axios({
        method: 'get',
        url: 'https://api.minecraftservices.com/entitlements/mcstore',
        headers: {
            Authorization: `Bearer ${minecraftToken}`
        },
        responseType: 'json'
    })

    let ownMinecraft = false
    if (checkGameOwnershipResult.data.items.length >= 2) ownMinecraft = true

    if (ownMinecraft) {
        /* Get Profile Info */
        let profileInfoResult = await axios({
            method: 'get',
            url: 'https://api.minecraftservices.com/minecraft/profile',
            headers: {
                Authorization: `Bearer ${minecraftToken}`
            },
            responseType: 'json'
        })

        const playerUUID = profileInfoResult.data.id
        const playerName = profileInfoResult.data.name
        return {
            token: minecraftToken,
            uuid: playerUUID,
            name: playerName,
            refreshToken: microsoftRefreshToken
        }
    } else {
        throw new Error(
            'Erreur durant le refreshing du Token Microsoft : Vous ne possédez pas Minecraft'
        )
    }
}
