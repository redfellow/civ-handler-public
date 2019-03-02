const webhook = require("webhook-discord")
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())

// port to bind the server to
const APP_PORT = 8080

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
	console.log('[✔] civ-handler >> app.post > POST received', req.isJson, req.body)
	const vars = getVars(req.body);


	if (vars.ok) {
		console.log('[✔] civ-handler >> app.post > Sending discord webHook message', vars.msgTitle, vars.msgBody)
		const msg = new webhook.MessageBuilder()
		msg.setName(BOT_NAME)
		msg.setColor(BOT_MSG_COLOR)
		msg.setText(vars.msgTitle)
		msg.addField(vars.msgBody)
		msg.setTime()
		vars.hook.send(msg)
		res.status(200).send({
			"[✔] civ-handler >> request passed to discord successfully": vars
		})
	}
	else {
		console.warn(`[⚠] civ-handler >> app.post > could not trigger the webhook`)
		res.status(500).send({
			"[⚠] civ-handler >> request failed": vars
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
		console.log(error.stack)
		vars.ok = false;
	} 
	else {
		vars.msgTitle = `Hey ${vars.player}, it's your turn to play!`
		vars.msgBody =  `Game: ${vars.game}, turn #${vars.turn}`
		vars.ok = true;
	}

	return vars
}

app.listen(APP_PORT)
console.log('[✔] civ-handler >> root > app started', new Date())
setInterval(function() {
	console.log("[✔] civ-handler >> root > still listening for POSTs..", new Date())
}, 1500000)


