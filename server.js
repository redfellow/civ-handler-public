const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile)

// Discord helper
DISCORD = require("webhook-discord")

// Civ-handler logic
CIV = require('./civ-handler');

// Object for storing processed current POST request data
VARS = {}

// Port to bind the server to
APP_PORT = 80
APP_ALIVE_INTERVAL = 7200000

// Object to store sent messages for duplicate checking
SENT_MESSAGES = {}
ERRORS = {}

// Read old log.json entries from disk to memory
fs.readFile('log.json', 'utf-8', (err, data) => {
    if (err) throw err;
	try {
		SENT_MESSAGES = JSON.parse(data.toString())
	}
	catch(e) {
		console.error("Could not parse log.json, starting fresh.")
		SENT_MESSAGES = {}
	}
});

// Read old errors.json entries from disk to memory
fs.readFile('errors.json', 'utf-8', (err, data) => {
    if (err) throw err;
	try {
		ERRORS = JSON.parse(data.toString())
	}
	catch(e) {
		console.error("Could not parse log.json, starting fresh.")
		ERRORS = {}
	}
});

// toggle whether messages will actually be sent to discord, for debugging purposes
SENDING_ENABLED = true

// Displaying your bot messages with certain nick/color
BOT_NAME = "Dingding"
BOT_MSG_COLOR = "#ff6600"

// Steamnick -> discord user ID so that @mentions can work (enable dev mode in discord, right click user to copy his/her ID)
USER_MAP = {
	// "steamnick" : "<@discordid>",
	// "steamnick" : "<@discordid>",
	// "steamnick" : "<@discordid>",
}

// Wbhook URLs from Discord, uses certain hook based on partial game name
HOOKS = [
	// {
	// 	name: "Partial gamename",
	// 	hook: new DISCORD.Webhook("<<discordwebhookurl>>")
	// },
]

// Handle posts requests to /, /civ, /new_turn, /civ/new_turn
app.post('/', CIV.handlePost)
app.post('/civ', CIV.handlePost)
app.post('/new_turn', CIV.handlePost)
app.post('/civ/new_turn', CIV.handlePost)

// Handle get requests to /, /alive
app.get('/', CIV.showLog)
app.get('/alive', CIV.handleAlive)

// Launch
CIV.startApp(app)
