/* eslint-disable no-template-curly-in-string */
const builder = require('electron-builder')
const Platform = builder.Platform

function getCurrentPlatform() {
    switch (process.platform) {
        case 'win32':
            return Platform.WINDOWS
        case 'darwin':
            return Platform.MAC
        case 'linux':
            return Platform.LINUX
        default:
            console.error('Cannot resolve current platform!')
            return undefined
    }
}

builder
    .build({
        targets: (process.argv[2] != null && Platform[process.argv[2]] != null
            ? Platform[process.argv[2]]
            : getCurrentPlatform()
        ).createTarget(),
        config: {
            appId: 'newzenlauncher',
            productName: 'NewzenLauncher',
            artifactName: '${productName}-setup-${version}.${ext}',
            copyright: 'Copyright © 2021 Newzen',
            directories: {
                buildResources: 'build',
                output: 'dist'
            },
            win: {
                target: [
                    {
                        target: 'nsis',
                        arch: 'x64'
                    }
                ]
            },
            nsis: {
                oneClick: false,
                perMachine: false,
                allowElevation: true,
                allowToChangeInstallationDirectory: true
            },
            mac: {
                target: 'dmg',
                category: 'public.app-category.games'
            },
            linux: {
                target: 'AppImage',
                maintainer: 'Titouan Petit (TIEB62)',
                vendor: 'Newzen',
                synopsis: 'Launcher de Newzen',
                description: 'Launcher Officiel de Newzen',
                category: 'Game'
            },
            compression: 'maximum',
            files: [
                '!{dist,.gitignore,.github,README.md,.vscode,docs,dev-app-update.yml,.nvmrc,.eslintrc.json,.eslintignore,build.js,.prettierignore,.prettierrc.json}'
            ],
            extraResources: ['libraries'],
            asar: true
        }
    })
    .then(() => {
        console.log('Build complete!')
    })
    .catch((err) => {
        console.error('Error during build!', err)
    })
