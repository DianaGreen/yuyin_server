var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var fs = require('fs');
var Multiparty = require('multiparty');
var ffmpeg = require('fluent-ffmpeg'); //创建一个ffmpeg命令
var AipSpeechServer = require('baidu-aip-sdk').speech;

//前端返回数据start
var theLight = 'NA';
var theCurtain = 'NA';

var wdData = 'NA';
var sdData = 'NA';
var airData = 'NA';
var rainData = 'NA';
var gasData = 'NA';
var fireData = 'NA';
//前端返回数据end


//端口监听start
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var net = require('net');
var dataclient = '';
// var returnDate = false;
var datatimes;
var sockets = {};
var netServer = net.createServer(function (c) {
  console.log('client connected');
  sockets = c;
  c.on('data', function (data) {
    console.log('clientsensor:' + data); // 回发该数据，客户端将收到来自服务端的数据 
    var datastr = String(data);
    // console.log("data:"+typeof(data));
    // console.log("text:",datastr);
    dataHandle(datastr);

    // dataclient = data.toString();
    // if(dataclient!=''){
    //   returnDate = true;
    // }
    // var date = new Date(); 
  });
  c.on('end', function () {
    console.log('client disconnected');
  });
  c.on('error', function () {
    console.log('socket 失去连接');
  });
  c.write('hello\r\n');
  c.pipe(c);
});
netServer.listen(8124);
//端口监听end

//返回数据加入数据库处理start
function dataHandle(datastr) {

  var date = new Date();
  datatimes = date.toLocaleString();
  //开关灯start
  if (datastr.indexOf("L") != -1) {
    var N = [];

    function Abc(datastr) {
      return datastr.match(/[^,]+/gm);
    }
    N = Abc(datastr);
    if (N[5] === '1') {
      var addSql = 'INSERT INTO the_light_table(status,time) VALUES(?,?)';
      var addSqlParams = ['turn on', `${datatimes}`];
      //增
      connection.query(addSql, addSqlParams, function (err, result) {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          return;
        }
        theLight = 'turn on';
      });
    } else if (N[5] === '0') {
      var addSql = 'INSERT INTO the_light_table(status,time) VALUES(?,?)';
      var addSqlParams = ['turn off', `${datatimes}`];
      //增
      connection.query(addSql, addSqlParams, function (err, result) {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          return;
        }
        theLight = 'turn off';
      });
    }
  }
  //开关灯end

  //开关窗帘start
  if (datastr.indexOf("C") != -1) {
    var N = [];

    function Abc(datastr) {
      return datastr.match(/[^,]+/gm);
    }
    N = Abc(datastr);
    if (N[4] === '1') {
      var addSql = 'INSERT INTO the_curtain_table(status,time) VALUES(?,?)';
      var addSqlParams = ['turn on', `${datatimes}`];
      //增
      connection.query(addSql, addSqlParams, function (err, result) {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          return;
        }
        theCurtain = 'turn on';
      });
    } else if (N[4] === '0') {
      var addSql = 'INSERT INTO the_curtain_table(status,time) VALUES(?,?)';
      var addSqlParams = ['turn off', `${datatimes}`];
      //增
      connection.query(addSql, addSqlParams, function (err, result) {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          return;
        }
        theCurtain = 'turn off';
      });
    }
  }
  //开关窗帘end

  //温湿度获取start
  if (datastr.indexOf("W") != -1) {
    var N = [];
    function Abc(datastr) {
      return datastr.match(/[^,]+/gm);
    }
    N = Abc(datastr);
    var addSql = 'INSERT INTO the_wsdata_table(wdata,sdata,time) VALUES(?,?,?)';
    var addSqlParams = [N[4], N[5], `${datatimes}`];
    //增
    connection.query(addSql, addSqlParams, function (err, result) {
      if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        return;
      }
      wdData = N[4];
      sdData = N[5];
    });
  }
  //温湿度获取end

  //PM2.5获取start
  if (datastr.indexOf("P") != -1) {
    var N = [];
    function Abc(datastr) {
      return datastr.match(/[^,]+/gm);
    }
    N = Abc(datastr);
    var addSql = 'INSERT INTO the_pmdata_table(data,time) VALUES(?,?)';
    var addSqlParams = [N[4], `${datatimes}`];
    //增
    connection.query(addSql, addSqlParams, function (err, result) {
      if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        return;
      }
      airData = N[4];
    });
  }
  //PM2.5获获取end

  //雨量获取start
  if (datastr.indexOf("R") != -1) {
    var N = [];
    function Abc(datastr) {
      return datastr.match(/[^,]+/gm);
    }
    N = Abc(datastr);
    var addSql = 'INSERT INTO the_raindata_table(data,time) VALUES(?,?)';
    var addSqlParams = [N[4], `${datatimes}`];
    //增
    connection.query(addSql, addSqlParams, function (err, result) {
      if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        return;
      }
     rainData = N[4];
    });
  }
  //雨量获获取end


  //可燃气获取start
  if (datastr.indexOf("K") != -1) {
    var N = [];
    function Abc(datastr) {
      return datastr.match(/[^,]+/gm);
    }
    N = Abc(datastr);
    var addSql = 'INSERT INTO the_gasdata_table(data,time) VALUES(?,?)';
    var addSqlParams = [N[4], `${datatimes}`];
    //增
    connection.query(addSql, addSqlParams, function (err, result) {
      if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        return;
      }
     
     gasData = N[4];
    });
  }
  //可燃气获获取end

  //火焰警报获取start
  if (datastr.indexOf("H") != -1) {
    var N = [];
    function Abc(datastr) {
      return datastr.match(/[^,]+/gm);
    }
    N = Abc(datastr);
    var addSql = 'INSERT INTO the_firedata_table(data,time) VALUES(?,?)';
    var addSqlParams = [N[4], `${datatimes}`];
    //增
    connection.query(addSql, addSqlParams, function (err, result) {
      if (err) {
        console.log('[INSERT ERROR] - ', err.message);
        return;
      }
      fireData =  N[4];
    });
  }
  //火焰警报获获取end
}

//返回数据加入数据库处理end





//配置数据库开始 
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'yonga',
  password: '9977',
  database: 'yuyin_db',
  port: '3306',
});

connection.connect(function (err) {
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
    console.log('resssssssssss', res);
    var resdata = res.toString();
    console.log('resdataaaa', resdata);
    if (resdata.indexOf("开灯") != -1) {
      sockets.write('@@,0,2end,L,A,1,##\r\n')
      console.log('成功');
    } else if (resdata.indexOf("关灯") != -1) {
      sockets.write('@@,0,2end,L,A,0,##\r\n')
      console.log('成功');
    } else if (resdata.indexOf("开窗帘") != -1) {
      sockets.write('@@,3,2end,C,1,##\r\n')
      console.log('成功');
    } else if (resdata.indexOf("关窗帘") != -1) {
      sockets.write('@@,3,2end,C,0,##\r\n')
      console.log('成功');
    }
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
            console.log('allResult', allResult);
            console.log('thedataclientdataclient', dataclient);
            // console.log('thereturnDate',returnDate);
            // if(returnDate = true){
            //   returnDate = false;
            res.end(JSON.stringify(allResult));

            // }
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
  sockets.write('@@,0,2end,A,##\r\n')
  setTimeout(function(){
    checkWSdData();
    checkAirData();
    checkRainData();
    checkGasData();
    checkFireData();
    res.json({
      ret: 1,
      data: {
        "wdData": wdData,
        "sdData": sdData,
        "airData": airData,
        "rainData": rainData,
        "gasData": gasData,
        "fireData": fireData
      },
      msg: 'chenggongchenggong'
    });
  
  },2000);

});

function checkLight() {
  var theResult;
  var sql = 'SELECT * FROM the_light_table where id=(select MAX(id) from the_light_table ) ';
  //查
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    theResult = JSON.stringify(result);
    theResult = JSON.parse(theResult);
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log(theResult);
    console.log(theResult[0].status);
    theLight = theResult[0].status;
    console.log(theLight);
    console.log('------------------------------------------------------------\n\n');
  });
}
function checkCurtain() {
  var theResult;
  var sql = 'SELECT * FROM the_curtain_table where id=(select MAX(id) from the_curtain_table )';
  //查
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    theResult = JSON.stringify(result);
    theResult = JSON.parse(theResult);
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log(theResult);
    console.log(theResult[0].status);
    theCurtain = theResult[0].status;
    console.log(theLight);
    console.log('------------------------------------------------------------\n\n');
  });
}

function checkWSdData() {
  var theResult;
  var sql = 'SELECT * FROM the_wsdata_table where id=(select MAX(id) from the_wsdata_table )';
  //查
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    theResult = JSON.stringify(result);
    theResult = JSON.parse(theResult);
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log(theResult);
    wdData = theResult[0].wdata;
    sdData = theResult[0].sdata;
    console.log('------------------------------------------------------------\n\n');
  });
}


function checkAirData() {
  var theResult;
  var sql = 'SELECT * FROM the_pmdata_table where id=(select MAX(id) from the_pmdata_table )';
  //查
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    theResult = JSON.stringify(result);
    theResult = JSON.parse(theResult);
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log(theResult);
    airData = theResult[0].data;
    console.log('------------------------------------------------------------\n\n');
  });
}

function checkRainData() {
  var theResult;
  var sql = 'SELECT * FROM the_raindata_table where id=(select MAX(id) from the_raindata_table )';
  //查
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    theResult = JSON.stringify(result);
    theResult = JSON.parse(theResult);
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log(theResult);
    rainData = theResult[0].data;
    console.log('------------------------------------------------------------\n\n');
  });
}

function checkGasData() {
  var theResult;
  var sql = 'SELECT * FROM the_gasdata_table where id=(select MAX(id) from the_gasdata_table )';
  //查
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    theResult = JSON.stringify(result);
    theResult = JSON.parse(theResult);
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log(theResult);
    gasData = theResult[0].data;
    console.log('------------------------------------------------------------\n\n');
  });
}


function checkFireData() {
  var theResult;
  var sql = 'SELECT * FROM the_firedata_table where id=(select MAX(id) from the_firedata_table )';
  //查
  connection.query(sql, function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    theResult = JSON.stringify(result);
    theResult = JSON.parse(theResult);
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log(theResult);
    fireData = theResult[0].data;
    console.log('------------------------------------------------------------\n\n');
  });
}

router.get('/getLight', function (req, res, next) {
  if (theLight.indexOf("on") != -1) {
    sockets.write('@@,0,2end,L,A,0,##\r\n')
  } else if (theLight.indexOf("off") != -1) {
    sockets.write('@@,0,2end,L,A,1,##\r\n')
  }
 
  setTimeout(function(){
    checkLight();
    res.json({
      ret: 1,
      data: {
        "theLight": theLight
      },
      msg: 'theLight'
    });
  },1000);

});
router.get('/getCurtain', function (req, res, next) {
  if (theCurtain.indexOf("on") != -1) {
    sockets.write('@@,3,2end,C,0,##\r\n')
    console.log('成功');
  } else if (theCurtain.indexOf("off") != -1) {
    sockets.write('@@,3,2end,C,1,##\r\n')
    console.log('成功');
  }
 
  setTimeout(function(){
    checkCurtain();
    res.json({
      ret: 1,
      data: {
        "theCurtain": theCurtain
      },
      msg: 'theCurtain'
    });
  },1000);
});
router.get('/getLightCurtain', function (req, res, next) {
  sockets.write('@@,0,2end,L,A,get,##\r\n')
  sockets.write('@@,3,2end,C,get,##\r\n')
  checkLight();
  checkCurtain();
  setTimeout(function(){
    res.json({
      ret: 1,
      data: {
        "theLight": theLight,
        "theCurtain": theCurtain
      },
      msg: 'getLightCurtain'
    });
  },1000);


});

module.exports = router;