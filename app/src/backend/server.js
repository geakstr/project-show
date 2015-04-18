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

// add these two lines near the variable declarations at the top
var BinaryServer = require('binaryjs').BinaryServer;
var video = require('./video');

var rooms = {};
// var users = {};

app.get('/', function * (next) {
  yield this.render('index');
});

app.get('/room/:id', function * (next) {
  yield this.render('room/desktop');
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

  socket.on('joinroom', function(newroom, videoUrl) {
    socket.leave(socket.room);
    socket.join(newroom);
    socket.room = newroom;

    if (rooms[socket.room] === undefined) {
      rooms[socket.room] = {
        'socketid': socket.id,
        'videoUrl': videoUrl
      };
    }
    socket.broadcast.to(socket.room).emit('connected', socket.username);
    io.to(socket.id).emit('update video url', rooms[socket.room]['videoUrl']);

    console.log(socket.username + ' join to ' + socket.room + ' room');
  });

  socket.on('video play', function(msg) {
    socket.broadcast.to(socket.room).emit('video play', msg);
    //socket.broadcast.emit('video play', msg);
    console.log('video play');
  });

  socket.on('video pause', function(msg) {
    socket.broadcast.to(socket.room).emit('video pause', msg);
    //socket.broadcast.emit('video pause', msg);
    console.log('video pause');
  });

  socket.on('chat message', function(msg) {
    socket.broadcast.to(socket.room).emit('chat message', msg);
    //socket.broadcast.emit('chat message', msg);
  });
});

server.listen(8000);
// add this after the call to server.listen()
bs = new BinaryServer({
  port: 9000
});

bs.on('connection', function(client) {
  client.on('stream', function(stream, meta) {
    switch (meta.event) {
      // list available videos
      case 'list':
        video.list(stream, meta);
        break;

        // request for a video
      case 'request':
        video.request(client, meta);
        break;

        // attempt an upload
      case 'upload':
        // default:
        video.upload(stream, meta);
    }
  });
});