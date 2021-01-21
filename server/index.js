const express = require('express');
const SocketServer = require('socket.io');
const http = require('http');
const nodemailer = require('nodemailer');

// création des serveurs express et socket.io
const app = express(),
	server = http.createServer(app),
	io = new SocketServer(server),
	port = 4242;

	
var transport = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
	  user: "40cc28f99c600a",
	  pass: "5a6b0b19f5622b"
	}
});

io.on('connection', socket => {
	console.log( `Nouveau visiteur : ${socket.id}` );

	socket.on('hello', (data) => {
		console.log(data);
	  });
	
	//run pipeline
	socket.on('run', (acc, chrnum, from, to, callback) => {
		console.log("RUN");
		from = from.replace(/ /g, "");
		to = to.replace(/ /g, "");

		const gffPath = './data/gff';

		 const { exec } = require("child_process");
		 console.log(`tabix ${gffPath}/LRR_${acc}.gff.gz Chr${chrnum}:${from}-${to}`);
		exec(`tabix ${gffPath}/LRR_${acc}.gff.gz Chr${chrnum}:${from}-${to}`, (error, stdout, stderr) => {
			if (error) {
			  console.error(`exec error: ${error}`);
			  return;
			}
			console.log(`stdout: ${stdout}`);
			console.error(`stderr: ${stderr}`);
			callback(null, stdout);
		  }); 
		
	});


	socket.on('feedback', (data, callback) => {
		const message = {
		from: 'b33b5a51e1-569833@inbox.mailtrap.io', // Sender address
		to: 'b33b5a51e1-569833@inbox.mailtrap.io',         // List of recipients
		subject: 'Geloc feedback', // Subject line
		text: data // Plain text body
		};
		transport.sendMail(message, function(err, info) {
			if (err) {
			console.log(err)
			} else {
			console.log(info);
			}
		});
		callback(null, 'email send');
	});
	


});

server.listen( port, () => {
	console.log( `l'appli GELOC est lancée sur le port ${port} !` );
} );