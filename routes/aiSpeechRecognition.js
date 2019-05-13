var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var fs = require('fs');
var Multiparty = require('multiparty');
var ffmpeg = require('fluent-ffmpeg'); //创建一个ffmpeg命令
var AipSpeechServer = require('baidu-aip-sdk').speech;

//端口监听start
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var net = require('net');
var dataclient = '';
var returnDate = false;
var datatimes;
var sockets = {};
var netServer = net.createServer(function (c) {
  console.log('client connected');
  sockets = c;
  c.on('data', function (data) {
    console.log('clientsensor:' + data); // 回发该数据，客户端将收到来自服务端的数据 
    dataclient = data.toString();
    if(dataclient!=''){
      returnDate = true;
    }
    var date = new Date();
    // datatimes = date.toLocaleString();  
  });
  c.on('end', function () {
    console.log('client disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});
netServer.listen(8124);
//端口监听end


//配置数据库开始 
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'yonga',
  password: '9977',
  database: 'yuyin_db',
  port: '3306', 
});

connection.connect(function(err) {
  if (err) throw err
});
//配置数据库结束



//设置appid/appkey/appsecret
var APP_ID = "15881291";
var API_KEY = "v9Tw1FrctnaFpT9Bc0Pc1YGe";
var SECRET_KEY = "5yAh6IkGeqlKgGrLgGB94ZEb6OizYopq";



//语音回调
function yuyin(res) {

  var date = new Date();
  datatimes = date.toLocaleString(); 
  var addSql = 'INSERT INTO yuyin_command_table(user,command,time) VALUES(?,?,?)';
  var addSqlParams = ['gangan', `${res}`, `${datatimes}`];
  //增
  connection.query(addSql, addSqlParams, function (err, result) {
    if (err) {
      console.log('[INSERT ERROR] - ', err.message);
      return;
    }
    console.log('resssssssssss',res);
     var resdata = res.toString();
     console.log('resdataaaa',resdata);
    if(resdata.indexOf("开灯") != -1){
      sockets.write('@@,0,2end,L,A,1,##\r\n')
      console.log('成功');
    }
    else if(resdata.indexOf("关灯") != -1){
      sockets.write('@@,0,2end,L,A,0,##\r\n')
      console.log('成功');
    }
    else if(resdata.indexOf("开窗帘") != -1){
      sockets.write('@@,0,2end,C,1,##\r\n')
      console.log('成功');
    }
    else if(resdata.indexOf("关窗帘") != -1){
      sockets.write('@@,0,2end,C,0,##\r\n')
      console.log('成功');
    }
    else if(resdata.indexOf("两个") != -1){
      sockets.write('@@,0,2end,L,A,get,##\r\n')
      sockets.write('@@,0,2end,C,get,##\r\n')
      console.log('成功');
    }
    else if(resdata.indexOf("全部") != -1){
      sockets.write('@@,0,2end,A,##\r\n')
      console.log('成功');
    }
    // sockets.write(`${res}`)
    console.log('--------------------------INSERT----------------------------');
    console.log('INSERT ID:', result);
    console.log('-----------------------------------------------------------------\n\n');
  });
};
//语音回调结束



// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipSpeechServer(APP_ID, API_KEY, SECRET_KEY);
router.post('/recognition', function (req, res, next) {
  //生成multiparty对象，并配置上传目标路径
  var form = new Multiparty.Form({
    uploadDir: './public/audio'
  });
  //上传完成后处理
  form.parse(req, function (err, fields, files) {
    var filesTemp = JSON.stringify(files, null, 2);
    if (err) {
      //console.log('parse error: '+err);
      res.json({
        ret: -1,
        data: {},
        msg: '未知错误'
      });
    } else {
      var inputFile = files.fffile[0];
      var uploadedPath = inputFile.path;
      var newFilePath = uploadedPath.slice(0, -3) + "wav";
      var mp3FilePath = uploadedPath.slice(0, -3) + "mp3";
      var command = new ffmpeg({
        source: uploadedPath,
        nolog: true
      });

      //Set the path to where FFmpeg is installed
      command.setFfmpegPath("C:\\ZYG\\ffmpeg\\bin\\ffmpeg.exe") //I forgot to include "ffmpeg.exe"
        .saveToFile(newFilePath)
        .on('error', function (err) {
          console.log('this is err', err)
        })
        .on('end', function () {
          //调用百度语音合成接口
          var voice = fs.readFileSync(newFilePath);
          var voiceBuffer = new Buffer(voice);
          client.recognize(voiceBuffer, 'wav', 16000).then((result) => {
            //数据库调用start
            yuyin(result.result)
            //数据库调用end
            console.log('kkk', result.result);
            console.log('kkkall', result);
            // console.log('<recognize>: ' + JSON.stringify(result));
            //返回数据到客户端
            // res.send(dataclient);
            var allResult = result;
            allResult.dataclient = dataclient;
            console.log('allResult',allResult);
            console.log('thedataclientdataclient',dataclient);
            console.log('thereturnDate',returnDate);
            if(returnDate = true){
              returnDate = false;
              res.end(JSON.stringify(allResult));

            }
            // else{
            //   dataclient = '';
            //   res.end(JSON.stringify(allResult));
            // }
          }, function (err) {
            console.log('this is yuyin err', err);
          });
          //语音识别 end

          //删除上传的临时音频文件
          fs.unlink(uploadedPath, function (err) {
            if (err) {
              console.log(uploadedPath + '文件删除失败');
              console.log(err);
            } else {
              console.log(uploadedPath + '文件删除成功');
            }
          });
          //删除mp3转成wav格式的音频
          fs.unlink(newFilePath, function (err) {
            if (err) {
              console.log(newFilePath + '文件删除失败');
              console.log(err);
            } else {
              console.log(newFilePath + '文件删除成功');
            }
          });
        });
    }
  });
});
router.get('/getdevice', function (req, res, next) {

    res.json({
      ret: 1,
      data: {},
      msg: 'chenggongchenggong'
    });

})
module.exports = router;