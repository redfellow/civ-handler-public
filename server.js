const webhook = require("webhook-discord")
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

// port to bind the server to
const APP_PORT = 80

// Displaying your bot messages with certain nick/color
const BOT_NAME = "Dingding"
const BOT_MSG_COLOR = "#ff6600"

// steamnick -> discord user ID so that @mentions can work (enable dev mode in discord, right click user to copy his/her ID)
const USER_MAP = {
	"steam_user" : "<@discordID>",	
}


// webhook URLs from Discord, uses certain hook based on partial game name
const HOOKS = [{ 
		name: "Partial game name to look for",
		hook: new webhook.Webhook("https://discordapp.com/api/webhooks...")
	},{ 
		name: "Another partial game name to look for",
		hook: new webhook.Webhook("https://discordapp.com/api/webhooks...")
	}
]


app.post('/civ/new_turn', function(req, res) {
	console.log('[✔] civ-handler >> app.post > POST received', new Date(), req.body)
	const vars = getVars(req.body);


	if (vars.ok) {
		console.log('[✔] civ-handler >> app.post > Attempting to send discord webHook message', new Date(), vars.msgTitle, vars.msgBody)
		const msg = new webhook.MessageBuilder()
		msg.setName(BOT_NAME)
		msg.setColor(BOT_MSG_COLOR)
		msg.setText(vars.msgTitle)
		msg.addField(vars.msgBody)
		msg.setTime()

		if (SENT_MESSAGES[vars.hash] !== true) {
			SENT_MESSAGES[vars.hash] = true;
			vars.hook.send(msg)
			res.status(200).send({
				timestamp: new Date(),
				result: "[✔] civ-handler >> request passed to discord successfully",
				vars: vars
			})
		}
		else {
			const warning = "[✔] civ-handler >> skipped duplicate request to discord";
			console.warn(warning)
			res.status(200).send({
				timestamp: new Date(),
				result: warning,
				vars: vars
			})
		}
	}
	else {
		console.warn(`[⚠] civ-handler >> app.post > could not trigger the webhook`)
		res.status(500).send({
			timestamp: new Date(),
			result: "[⚠] civ-handler >> request failed",
			vars: vars
		})
	}

});


function getVars(json) {
	let vars = {
		game: json.value1,
		player: USER_MAP[json.value2]||json.value2,
		turn: json.value3
	}

	for (let index = 0; index < HOOKS.length; index++) {
		const hook = HOOKS[index]
		if (vars.game.indexOf(hook.name) > -1) {
			vars.hook = hook.hook
			break
		}
	}

	if ("hook" in vars === false) {
		var error = new Error(`[⚠] civ-handler >> getVars > "${vars.game}" couldn't be matched to HOOKS.`)
		console.log("timestamp:" + new Date(), error.stack)
		vars.ok = false;
	} 
	else {
		vars.msgTitle = `Hey ${vars.player}, it's your turn to play!`
		vars.msgBody =  `Game: ${vars.game}, turn #${vars.turn}`
		vars.hash = 
		vars.ok = true;
	}

	return vars
}

app.listen(APP_PORT)
console.log('[✔] civ-handler >> root > app started', new Date())
setInterval(function() {
	console.log("[✔] civ-handler >> root > still listening for POSTs..", new Date())
}, 1500000)


