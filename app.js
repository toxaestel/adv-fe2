var express = require('express');
var path = require('path');

var app = express();
var CLIENT_PATH = '/client_src';

app.use('/', express.static(path.join(__dirname, CLIENT_PATH)));

app.listen(3000, function () {
   console.log('server started.');
});