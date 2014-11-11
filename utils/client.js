var async   = require('async');
var crypto  = require('crypto');
var fs      = require('fs');

module.exports = function(app, io, irc) {

	function isAuthorized(req, res, next) {

		var appid = req.param('appid');

		if(appid == null || app.get('appid') != appid)
			return res.status(401).json({ success: false, message: "Unauthorized" });

		return next();
	}

	function isAuthorizedPrivate(req, res, next) {

		var token = req.param('token');

		if(token == null || app.get('secret_key') != token)
			return res.status(401).json({ success: false, message: "Unauthorized" });

		return next();
	}

	app.get('/', function(req, res) {
		return res.status(200).json({ success: true, message: "Welcome, nothing here" });
	});

	app.post('/app/connect', isAuthorizedPrivate, function(req, res) {
		irc.connect();
		return res.status(200).json({ success: true, message: "Initializing" });
	});

	app.post('/app/disconnect', isAuthorizedPrivate, function(req, res) {
		irc.disconnect();
		return res.status(200).json({ success: true, message: "Disconnecting" });
	});
	
	app.post('/chat/create', isAuthorized, function(req, res, next) {

		var appid            = req.param('appid');
		var channelName      = req.param('channelName');
		var channelSignature = req.param('signature');
		var userInfo         = req.param('userInfo');
		var settings         = req.param('settings');

		// Retrieve counter value from file.
		function getAndIncrementCounter() {
			var count = parseInt(fs.readFileSync(__dirname + '/counter.dat'));
			fs.writeFileSync(__dirname + '/counter.dat', ++count);
			return count;
		}

		async.waterfall(
			[
				function(callback) {

					console.log("channelName: " + channelName);
					console.log("channelSignature: " + channelSignature);

					// Verify if the user already has previous support (from cookies)
					if(channelName != null && channelSignature != null)
					{
						// Returning user with cookie
						var verify = crypto.createHmac('sha1', app.get('secret_key')).update(channelName).digest('hex');

						// Verify signature else it will create a new one!
						if(verify == channelSignature)
							return callback(null, channelName, true);
					}

					// No channel or signature, or invalid signature/channel, get the next channel
					var channelCount = getAndIncrementCounter();
					var newChannelName = app.get('channel_prefix') + channelCount;

					return callback(null, newChannelName, false);
				},

				// Create channel
				function(channelName, returning, callback) {

					console.log(channelName);
					irc.joinChannel(channelName);

					return callback(null, channelName, returning);
				},

				// Invite user to channel
				function(channelName, returning, callback) {

					irc.inviteUser(app.get('invite_user'), channelName);
					return callback(null, channelName, returning);
				},

				// Set purpose of channel
				function(channelName, returning, callback) {

					if(returning)
						return callback(null, channelName);

					var info     = JSON.parse(userInfo);
					var personal = JSON.parse(settings);

					var topic = "Help!" +
						" Name: " + personal.name + " (" + personal.email + ")" +
						" URL: " + info.url + " (" + req.ip + ")" +
						" Browser: " + info.browser + " - " + info.browserVersion +
						" OS: " + info.os + " - " + info.osVersion +
						" Mobile: " + info.mobile +" Screen resolution: " + info.screen;

					irc.setTopic(channelName, topic);

					return callback(null, channelName);
				}

			],
			function(err, channelName) {
				if(err) {
					console.log(err);
					return res.status(404).json({ error: "Error: " + err});
				}

				var signature = crypto.createHmac('sha1', app.get('secret_key')).update(channelName).digest('hex');

				return res.status(200).json({ success: true, channelName: channelName, signature: signature });
			}
		);
	});
};