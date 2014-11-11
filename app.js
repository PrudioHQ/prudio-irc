// Express and SocketIO
var express = require('express');
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io')(server);

// Body parser & CORS
var bodyParser = require('body-parser');
var cors       = require('cors');

// IRC logic
var irc = require('./utils/irc');

// App settings
app.set('port', process.env.PORT     || Number(5000));
app.set('env',  process.env.NODE_ENV || 'development');

// Constants
app.set('channel_prefix', process.env.CHANNEL_PREFIX);
app.set('appid',          process.env.APP_ID);
app.set('secret_key',     process.env.SECRET_KEY);
app.set('invite_user',    process.env.INVITE_USER);

app.set('irc_host', process.env.IRC_HOST);
app.set('irc_user', process.env.IRC_USER);
app.set('irc_pass', process.env.IRC_PASS);

// Development only
if ('development' === app.get('env')) {
  var errorhandler = require('errorhandler');
  app.use(errorhandler());
}

app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());

// allow access to /build directories and notification
app.use('/', express.static(__dirname + '/build'));

// HTML client
if ('development' === app.get('env')) {
  app.use('/client-html',  express.static(__dirname + '/client-html'));
}

// linking
require('./utils/socket')(app, io, irc); // socketIO logic
require('./utils/client')(app, io, irc); // sets up endpoints

server.listen(app.get('port'), function() {
  var client = {
    user: app.get('irc_user'),
    pass: app.get('irc_pass'),
    host: app.get('irc_host')
  };

  irc.connect(client);
  console.log('Express server listening on port ' + app.get('port'));
});

// Catch errors
app.use(function (err, req, res) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// On sigterm app
process.on('SIGTERM', function() {
  console.log("Got a sigterm");
  irc.disconnect();
  server.close.bind(server);
  process.exit(0);
});

process.on('SIGINT', function() {
  console.log("Got a sigterm");
});