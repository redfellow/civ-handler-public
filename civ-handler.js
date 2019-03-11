module.exports = {

	startApp: function (app) {
		app.listen(APP_PORT)
		console.log(new Date(), `[✔] civ-handler >> root > app started`)

		setInterval(function () {
			console.log(new Date(), `[✔] civ-handler >> root > still listening for POSTs..`)
		}, 1500000)
	},


	handlePost: function (req, res) {
		console.log(new Date(), `[✔] civ-handler >> app.post > POST received`, req.body)
		CIV.setVars(req.body);
		CIV.setHook()
		CIV.duplicateCheck()

		if ("errorMsg" in VARS === false) CIV.sendDiscordMessage(req, res)
		else CIV.handleError(req, res)
	},


	setVars: function (json) {
		VARS = {
			game: json.value1,
			player: USER_MAP[json.value2] || json.value2,
			turn: json.value3,
		}

		VARS.msgTitle = `Hey ${VARS.player}, it's your turn to play!`
		VARS.msgBody = `Game: ${VARS.game}, turn #${VARS.turn}`
	},


	setHook: function () {
		for (let index = 0; index < HOOKS.length; index++) {
			const hook = HOOKS[index]
			if (VARS.game.indexOf(hook.name) > -1) {
				VARS.hook = hook.hook
				return
			}
		}

		VARS.errorMsg = `'${VARS.game}' could not be matched to any of the defined HOOKS`
	},


	sendDiscordMessage: function (req, res) {
		const message = new DISCORD.MessageBuilder()
		message.setName(BOT_NAME)
		message.setColor(BOT_MSG_COLOR)
		message.setText(VARS.msgTitle)
		message.addField(VARS.msgBody)
		message.setTime()


		if (SENDING_ENABLED === true) {
			console.log(new Date(), `[✔] civ-handler >> sendDiscordMessage > ${VARS.msgTitle} - ${VARS.msgBody}`)
			VARS.hook.send(message)
		}

		if (typeof VARS.hook === "object") delete VARS.hook
		res.status(200).send({
			timestamp: new Date(),
			message: `[✔] civ-handler >> handlePost > request passed to discord successfully`,
			VARS: VARS,
			POSTRequestHeaders: req.headers,
			remoteAddress: req.connection.remoteAddress
		})
	},


	handleError: function (req, res) {
		console.warn(new Date(), `[⚠] civ-handler >> handleError > ${VARS.errorMsg}`)
		if (typeof VARS.hook === "object") delete VARS.hook
		res.status(500).send({
			timestamp: new Date(),
			message: `[⚠] civ-handler >> handleError > ${VARS.errorMsg}`,
			VARS: VARS,
			POSTRequestHeaders: req.headers,
			remoteAddress: req.connection.remoteAddress
		})
	},



	duplicateCheck: function() {
		VARS.hash = `${VARS.game}-${VARS.player}-${VARS.turn}`.replace(/ /g, "-").toLowerCase()

		if (SENT_MESSAGES[VARS.hash] !== true) {
			SENT_MESSAGES[VARS.hash] = true;
		}
		else {
			VARS.errorMsg = `'${VARS.hash}' was already sent, skipping duplicate.`
		}
	},


};
