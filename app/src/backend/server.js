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

app.get('/', function * (next) {
  yield this.render('index');
});

io.on('connection', function(socket) {
  socket.broadcast.emit('connected');

  socket.on('disconnect', function() {
    socket.broadcast.emit('disconnected');
  });

  socket.on('video play', function(msg) {
    socket.broadcast.emit('video play', msg);
  });

  socket.on('video pause', function(msg) {
    socket.broadcast.emit('video pause', msg);
  });

  socket.on('chat message', function(msg) {
    socket.broadcast.emit('chat message', msg);
  });
});

server.listen(8000);