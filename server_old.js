#!/usr/bin/env nodejs
var http = require('http');
var processor = require('./processing.js');

http.createServer(function (req, res) {
  let body = "";
  req.on('data', chunk =>{
      body += chunk;
  });
  req.on('end', () =>{
      console.log('/////////new request/////////');
      console.log(body);
      var strMsg = body.substring(body.lastIndexOf("message")+10,body.lastIndexOf("}")-2);
      var userID = body.substr(body.indexOf("from_user_id")+14,7);
      console.log(strMsg);
      console.log(userID);
      var process = processor.process(userID, strMsg);
  });

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(3000, () => {
	console.log('Server running at http://localhost:3000/');
	});
