const moment = require("moment");

module.exports = {

	startApp: function (app) {
		app.listen(APP_PORT)
		console.log(new Date(), `[✔] civ-handler >> root > app started`)

		setInterval(function () {
			console.log(new Date(), `[✔] civ-handler >> root > still listening for POSTs..`)
		}, APP_ALIVE_INTERVAL)
	},

	handleAlive: function (req, res) {
		console.log(new Date(), `[✔] civ-handler >> app.get > Alive request received`)
		res.status(200).send({
			timestamp: new Date(),
			message: `[⚠] civ-handler >> handleAlive > Alive request handled`			
		})
	},

	showLog: function (req, res) {
		const fs = require('fs')
		const forwarded = req.headers['x-forwarded-for']
		const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress
	
		console.log(new Date(), `[✔] civ-handler >> app.get > Log request received from ${ip}`)
	
		res.render(__dirname + "/log.html", { 
			moment: moment,
			SENT_MESSAGES : SENT_MESSAGES,
			ERRORS : ERRORS
		});

		fs.writeFile('lastshow.log', ip, (err) => {
			if (err) throw err;
		});
	},

	handlePost: function (req, res) {
		const fs = require('fs')
		const forwarded = req.headers['x-forwarded-for']
		const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress
		console.log(new Date(), `[✔] civ-handler >> app.post > POST received`, req.body)

		CIV.setVars(req.body, ip);
		CIV.setHook()
		CIV.duplicateCheck()

		if ("errorMsg" in VARS === false) CIV.sendDiscordMessage(req, res)
		else CIV.handleError(req, res, ip)		
		
		fs.writeFile('log.json', JSON.stringify(SENT_MESSAGES), (err) => {
			if (err) throw err;
		});
		
		fs.writeFile('errors.json', JSON.stringify(ERRORS), (err) => {
			if (err) throw err;
		});

		var lastpostData = JSON.stringify({
			ip: ip,
			post: req.body
		});

		fs.writeFile('lastpost.log', lastpostData, (err) => {
			if (err) throw err;
		});
	},


	setVars: function (json, ip) {
		var date = new Date();
		VARS = {
			time: moment().format("DD.MM.YYYY - H:mm:ss"),
			epoch: moment().valueOf(),
			game: json.value1,
			player: USER_MAP[json.value2] || json.value2,
			playerRaw: json.value2,
			turn: json.value3,
			ip: ip
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
		})
	},


	handleError: function (req, res, ip) {
		console.warn(new Date(), `[⚠] civ-handler >> handleError > ${VARS.errorMsg}`)
		if (typeof VARS.hook === "object") delete VARS.hook
		ERRORS[new Date().valueOf()] = VARS;
		res.status(400).send({
			timestamp: new Date(),
			message: `[⚠] civ-handler >> handleError > ${VARS.errorMsg}`,
			VARS: VARS,
			POSTRequestHeaders: req.headers,
			remoteAddress: ip
		})
	},



	duplicateCheck: function() {
		VARS.hash = `${VARS.game}-${VARS.playerRaw}-${VARS.turn}`.replace(/ /g, "-").toLowerCase()

		if (!SENT_MESSAGES[VARS.hash]) {
			SENT_MESSAGES[VARS.hash] = VARS;
		}
		else {
			VARS.errorMsg = `'${VARS.hash}' was already sent, skipping duplicate.`
		}
	},


};
