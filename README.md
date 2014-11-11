# Prudio IRC OSS Version

This is the Open Source IRC implementation of [Prudio Live Chat](http://prud.io).

# Demo

![Demo](http://g.recordit.co/UGeRPvWx3C.gif)

#Install

### Dependencies

* [Foreman](https://github.com/ddollar/foreman)
* [Grunt](http://gruntjs.com/)
* Node.js
* NPM
* an IRC Server ([Slack](https://slack.com/) or [HipChat](https://www.hipchat.com/) for example)
* A dedicated user to work as a Bot.

```
$ git clone https://github.com/PrudioHQ/prudio-irc.git
$ npm install
$ grunt build
```
Change your `.env` file with your own IRC configuration.
To start your local server use:

```
$ foreman start
```

Open your browser at [localhost:5000/client-html](http://localhost:5000/client-html).

# Using it with Slack

Firstly **create a new user** in your Slack team. Call it "*Bot*" or "*Support*" (it doesn't really matter).

With your Slack administrator account go to [settings](https://my.slack.com/admin/settings#change_gateways) and enable IRC gateway (SSL only).

Now with your "*Bot*" account go to the [gateways](https://my.slack.com/account/gateways) copy the data and fill it in your `.env` file.

Your `INVITE_USER` should be the nickname of the user you want to be automatically added to the channel (probably your own Slack nickname?).

# Using it with Hipchat

Comming soon.

# Deploying

Comming soon.

# Widget 

You can check the shipped example at [client-html/index.html](https://github.com/PrudioHQ/prudio-irc/blob/master/client-html/index.html).

Or this quick example `index.html`:

```
<html>
	<head>
		<title>Prudio Test</title>
		<!-- your CSS and JS -->
	</head>
	
	<body>
		<h1>Some content</h1>
	</body>
	
	<!-- PRUDIO START HERE -->
	<script src="/client.local.js?token=xxx" async></script>
	<script>
  		// OPTIONAL
      	window._PrudioSettings = {
        	title: 'Prudio Support',
        	/*
        	name: 'John',
        	email: 'john@prud.io',
        	buttonSelector: '#merda',
        	buttonColor: 'green',
        	*/
      	};
	</script>
	<!-- PRUDIO /END -->
</html>
```

You can check all the `window._PrudioSettings` settings at [docs.prud.io](http://docs.prud.io) (soon) website.

# Issues

Please use the GitHub issues.

# Know issues

### Stoping foreman

When doing `CTRL + C` in Foreman the Node.js process does not exit.

This happens because of Socket.io opens a persistent connection to the server and Foreman cannot exit. Try doing `killall node`.

# Credits

[Hélder Duarte](https://twitter.com/cossou)

Raul Arfwedson (logo)

# License

The MIT License (MIT)

Copyright (c) 2014 Michael Garate and Emily Pakulski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
