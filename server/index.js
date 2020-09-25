const express = require('express');
const SocketServer = require('socket.io');
const http = require('http');

// création des serveurs express et socket.io
const app = express(),
	server = http.createServer(app),
	io = new SocketServer(server),
	port = 4242;

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
});

server.listen( port, () => {
	console.log( `l'appli GELOC est lancée sur le port ${port} !` );
} );