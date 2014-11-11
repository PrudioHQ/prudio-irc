var irc       = require('irc');
var moment    = require('moment');

// Private
var Bot;

var self = module.exports = {

	isConnected: function isConnected() {
		if(typeof Bot === 'undefined')
			return false;
		return Bot.isConnected;
	},

	listUsers: function listUsers() {
		if(typeof Bot === 'undefined')
			return [];

		Bot.send('NAMES');
	},

	joinChannel: function joinChannel(channel) {
		if(typeof Bot === 'undefined')
			return false;

		return Bot.join(channel);
	},

	inviteUser: function inviteUser(user, channel) {
		if(typeof Bot === 'undefined')
			return false;

		return Bot.send('INVITE', user, channel);
	},

	setTopic: function setTopic(channel, topic) {
		if(typeof Bot === 'undefined')
			return false;

		return Bot.send('TOPIC', channel, topic);
	},

	connect: function connect(client) {
		console.log("Connecting to IRC");

		if(typeof Bot === 'undefined' || Bot === null) {

			console.log("Connecting to IRC");

			Bot = new irc.Client(client.host, client.user, {
				secure: client.secure || true,
				debug: client.debug || false,
				sasl: client.sasl || true,
				username: client.user,
				password: client.pass,
				showErrors: client.debug || false,
				retryDelay: client.retryDelay || 1000,
				retryCount: client.retryCount || 3,
				channels: []
			});

			Bot.isConnected = false;
			Bot.errors      = [];
			Bot.bootedAt    = moment().utc().unix();

		} else {
			console.log("Already connected!");

			return Bot;
		}

		Bot.addListener('connect', function () {
			Bot.isConnected = true;
			console.log("Bot is online");
		});

		Bot.addListener('error', function (e) {
			Bot.isConnected = false;
			Bot.erros.push(e);

			console.log("Error event");
			console.log(e);
		});

		// Direct message
		Bot.addListener('pm', function (from, message) {
			console.log("Direct message: " + message);

			// If command
			if(message.indexOf("!") == 0 && message.length > 1) {
				var command = message.substring(1, message.length);

				console.log("It's a command: " + command);

				if(command === "time") {
					Bot.say(from, "_It's now: *" + moment().utc().format() + "*._");
				} else if(command === "uptime") {
					var time = moment(Bot.bootedAt, "X").utc();
					Bot.say(from, "_Uptime: *" + time.fromNow() + "* @ *" + time.format() + "*._");
				} else {
					// Command not valid!
					Bot.say(from, "_Sorry! Couldn't reconize the command: *" + command + "*._");
				}

			} else {
				// Reply
				Bot.say(from, "You said: _" + message + "_");
			}

		});

		return Bot;
	},

	say: function say(channel, message) {
		if(typeof Bot === 'undefined') {
			return false;
		}

		return Bot.say(channel, message);
	},

	disconnect: function disconnect() {

		if(typeof Bot === 'undefined') {
			return true;
		}

		Bot.disconnect();
		Bot = undefined;

		return true;
	}
};
