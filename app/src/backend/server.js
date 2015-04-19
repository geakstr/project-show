var fs = require('fs');
var path = require('path');
var koa = require('koa');
var router = require('koa-router');
var render = require('koa-ejs');
var serve = require('koa-static');
var koaBody = require('koa-body')({
  'multipart': true
});
var Utils = require('../frontend/js/Utils');

var projectRootDir = "../../../";

var app = koa();

app.use(serve(path.join(__dirname, projectRootDir + 'app/www/static')));

render(app, {
  root: path.join(__dirname, projectRootDir + 'app/www/views'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: true,
  locals: {},
  filters: {}
});

app.use(router(app));

var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

var rooms = {};
// var users = {};

app.get('/', function * (next) {
  yield this.render('index');
});

app.get('/room/:id', function * (next) {
  var room = rooms[this.params.id];
  yield this.render('room/desktop', {
    'videoUrl': room === undefined ? 'big_buck_bunny.mp4' : rooms[this.params.id]['videoUrl']
  });
});

app.get('/room/:id/video', function * (next) {
  yield this.render('room/mobile');
});

app.get('/room/:id/chat', function * (next) {
  yield this.render('room/mobile');
});

app.get('/streamingroom/:id', function * (next) {
  yield this.render('streamingroom');
});

app.post('/file-upload', koaBody, function * (next) {
  var oldPath = this.request.body.files.file.path;
  var newFileName = Utils.generateRandomString(10);
  var newPath = path.join(__dirname, projectRootDir + 'app/www/static/files/video/' + newFileName + '.mp4');

  this.body = newFileName + ".mp4";

  var self = this;
  fs.readFile(oldPath, function(err, data) {
    fs.writeFile(newPath, data, function(err) {
      fs.unlink(oldPath, function() {
        if (err) {
          console.log(err);
          throw err;
        }
      });
    });
  });

  yield next;
});

io.on('connection', function(socket) {
  socket.on('disconnect', function() {
    // delete users[socket.username];
    socket.broadcast.to(socket.room).emit('disconnected', socket.username);
    socket.leave(socket.room);

    console.log(socket.username + ' disconnected and leave ' + socket.room + ' room');
  });

  socket.on('adduser', function(username) {
    socket.username = username;
    // users[username] = username;

    console.log(socket.username + ' connected with ' + socket.id + ' socket id');
  });

  socket.on('joinroom', function(newroom, videoUrl, videoTitle) {
    socket.leave(socket.room);
    socket.join(newroom);
    socket.room = newroom;

    if (rooms[socket.room] === undefined) {
      rooms[socket.room] = {
        'socketid': socket.id,
        'videoUrl': videoUrl,
        'videoTitle': videoTitle,
        'videoTime': 0
      };

      if (videoUrl === null) {
        rooms[socket.room]['videoUrl'] = 'big_buck_bunny.mp4';
        rooms[socket.room]['videoTitle'] = 'Big Buck Bunny';
      }
    }

    console.log(newroom + " " + socket.username + " " + socket.id);
    socket.broadcast.to(socket.room).emit('connected', socket.username);
    io.to(socket.id).emit('update video url', rooms[socket.room]['videoUrl']);
    io.to(socket.id).emit('update video title', rooms[socket.room]['videoTitle']);

    console.log(socket.username + ' join to ' + socket.room + ' room');
  });

  socket.on('video play', function(time) {
    socket.broadcast.to(socket.room).emit('video play', time);
    if (rooms[socket.room]['socketid'] !== socket.id) {
      io.to(socket.id).emit('sync video time', rooms[socket.room]['videoTime']);
    }
    console.log('video play');
  });

  socket.on('video pause', function(time) {
    socket.broadcast.to(socket.room).emit('video pause', time);
    console.log('video pause');
  });

  socket.on('sync video time', function(time) {
    if (rooms[socket.room]['socketid'] === socket.id) {
      console.log(time);
      rooms[socket.room]['videoTime'] = time;
    }
  });

  socket.on('chat message', function(msg) {
    socket.broadcast.to(socket.room).emit('chat message', msg, socket.username);
    //socket.broadcast.emit('chat message', msg);
  });
});

server.listen(8000);