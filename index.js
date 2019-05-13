var express = require('express');
var path = require('path');
var app = express();


app.use(express.static(path.join(__dirname, 'public')));

aiSpeechRecognition = require('./routes/aiSpeechRecognition');
app.use('/baiduAI2',aiSpeechRecognition);

  var server = app.listen(9088, function () {
  var host ='127.0.0.1';
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});