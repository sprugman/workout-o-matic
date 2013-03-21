var http = require('http');
var send = require('./node_modules/send');
var app = http.createServer(function(req, res){
  send(req, req.url).pipe(res);
}).listen(3000);