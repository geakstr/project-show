var fs = require('fs');
var path = require('path');
var koa = require('koa');
var router = require('koa-router');
var render = require('koa-ejs');
var serve = require('koa-static');
var koaBody = require('koa-body')({
  'multipart': true
});

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
// var users = {};
// var rooms = [];

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
  console.log(this.request.body.files.file.path);
  this.body = "AZAAZA";

  var oldPath = fs.createReadStream(this.request.body.files.file.path);
  var newPath = fs.createWriteStream(path.join(__dirname, projectRootDir + 'app/www/static/files/video/test.mp4'));

  var self = this;
  fs.readFile(self.request.body.files.file.path, function(err, data) {
    fs.writeFile(path.join(__dirname, projectRootDir + 'app/www/static/files/video/test.mp4'), data, function(err) {
      fs.unlink(self.request.body.files.file.path, function() {
        if (err) throw err;
      });
    });
  });
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

  socket.on('joinroom', function(newroom) {
    socket.leave(socket.room);
    socket.join(newroom);
    socket.room = newroom;

    socket.broadcast.to(socket.room).emit('connected', socket.username);

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