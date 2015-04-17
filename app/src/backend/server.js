var path = require('path');
var koa = require('koa');
var router = require('koa-router');
var render = require('koa-ejs');
var serve = require('koa-static');

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

// var users = {};
// var rooms = [];

app.get('/', function * (next) {
  yield this.render('index');
});

app.get('/room/:id', function * (next) {
  yield this.render('room');
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