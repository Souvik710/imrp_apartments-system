fx_version 'cerulean'
game 'gta5'

name 'imrp_opiumnights'
author 'Ragna'
description 'Premium Hotel Ownership System - Opium Nights Hotel | IMMORTAL ROLEPLAY'
version '1.0.0'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    '@qbx_core/modules/lib.lua',
    'shared/*.lua',
    'config.lua',
}

client_scripts {
    'client/*.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/**/*',
}

dependencies {
    'ox_lib',
    'ox_inventory',
    'ox_target',
    'oxmysql',
    'qbx_core',
}

provides {
    'imrp_opiumnights',
}
