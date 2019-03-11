const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

// Discord helper
DISCORD = require("webhook-discord")

// Civ-handler logic
CIV = require('./civ-handler');

// Object for storing processed current POST request data
VARS = {}

// Port to bind the server to
APP_PORT = 80

// Object to store sent messages for duplicate checking
SENT_MESSAGES = {}

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

app.post('/civ/new_turn', CIV.handlePost)
CIV.startApp(app)
