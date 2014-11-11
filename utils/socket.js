var crypto = require('crypto');

module.exports = function(app, io, irc)
{
	var chat = io.of('/chat').on('connection', function(clientSocket)
	{
		clientSocket.on('joinRoom', function(channel, client_signature)
		{
			var signature   = crypto.createHmac('sha1', app.get('secret_key')).update(channel).digest('hex');

			if(signature != client_signature) {
				console.log('Wrong channel signature.');

				clientSocket.emit('serverMessage', {
					message: 'Wrong channel signature.'
				});

				// force client to disconnect
				clientSocket.disconnect();
				return;
			}

			var bot = irc.connect();

			// client joins room specified in URL
			clientSocket.join(channel);

			// welcome client on succesful connection
			clientSocket.emit('serverMessage', {
				message: 'Welcome to the chat.'
			});

			/** sendMessage **/
			clientSocket.on('sendMessage', function (text) {

				if(irc.isConnected() === false) {
					// Let the user know about the error?
					clientSocket.emit('serverMessage', {
						message: 'Could not deliver the message: ' + text.message
					});

					return;
				}

				// all data sent by client is sent to room
				clientSocket.broadcast.to(channel).emit('message', {
					message: text.message,
					sender: 'Other'
				});
				// and then shown to client
				clientSocket.emit('message', {
					message: text.message,
					sender: 'Self'
				});

				// send response to irc
				bot.say(channel, text.message);
			});

			// On IRC message, redirect to socket
			bot.on('message', function (message) {
				if(message.channel == channel)
					clientSocket.emit('message', {
						message: message.text,
						sender: 'Other'
					});
			});

			// On IRC message, redirect to socket
			bot.addListener('message#' + channel, function (from, message) {
				// If the message is not from the bot
				if(from !== app.get('irc_user')) {
					clientSocket.emit('message', {
						message: message,
						sender: 'Other'
					});
				}
			});

			// Error handler
			bot.on('error', function(err) {
				console.log("Error message: %j", err);
				// Let the user know about the error?
				clientSocket.emit('serverMessage', {
					message: 'Error connecting to support.'
				});
			});

			// IRC disconnect handler (should not happen often).
			bot.on('disconnect', function(e) {
				// Let the user know about the error?
				clientSocket.emit('serverMessage', {
					message: 'Support is offline.'
				});

			});

			// Socket disconnect listener, notify IRC that user left the chat
			clientSocket.on('disconnect', function() {
				bot.say(channel, "_User disconnected!_");
			});

		});
	});
};
