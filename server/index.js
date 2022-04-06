const express = require('express');
const SocketServer = require('socket.io');
const http = require('http');

// création des serveurs express et socket.io
const app = express(),
	server = http.createServer(app),
	io = new SocketServer(server),
	port = 4242;


const sendmail = require('sendmail')({
	logger: {
		debug: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error
	},
	silent: false,
	devHost: 'localhost', // Default: localhost
	smtpPort: 25, // Default: 25
	smtpHost: 'smtp.cirad.fr' // Default: -1 - extra smtp host after resolveMX
})


io.on('connection', socket => {
	console.log( `Nouveau visiteur : ${socket.id}` );

	socket.on('hello', (data) => {
		console.log(data);
	});
	
	//run pipeline
	socket.on('run', (gffPath, chrnum, from, to, callback) => {
		console.log("RUN");
		from = from.replace(/ /g, "");
		to = to.replace(/ /g, "");

		//const gffPath = './data_'+release+'/gff';

		const { exec } = require("child_process");
		console.log(`tabix ${gffPath} Chr${chrnum}:${from}-${to}`);
		exec(`tabix ${gffPath} Chr${chrnum}:${from}-${to}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
			console.error(`stderr: ${stderr}`);

			//si pas de resultat on essaye sans "chr"
			if(!stdout){
				exec(`tabix ${gffPath} ${chrnum}:${from}-${to}`, (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`stdout: ${stdout}`);
					console.error(`stderr: ${stderr}`);
					callback(null, stdout);
				}); 
			}else{
				callback(null, stdout);
			}
		}); 
		
	});


	socket.on('feedback', (email, xp, data, callback) => {
		
		sendmail({
			from: 'marilyne.summo@cirad.fr',
			to: 'marilyne.summo@cirad.fr ',
			subject: 'GeLoc feedback',
			html: 'message from: '+email+'<br/>'+xp+'<br/>Message:<br/>'+data,
		}, function(err, reply) {
			console.log(err && err.stack);
			console.dir(reply);
			callback(null, data);
		});
		
	});
	


});

server.listen( port, () => {
	console.log( `l'appli GELOC est lancée sur le port ${port} !` );
} );