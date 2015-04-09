$(document).ready(function() {
  var $ = require('jquery');
  var io = require('io');
  var socket = io();

  var player = $('#player')[0];

  player.addEventListener("play", function() {
    socket.emit('video play');
  });

  player.addEventListener("pause", function() {
    socket.emit('video pause');
  });

  // player.addEventListener("timeupdate", function() {
  //   socket.emit('video timeupdate', player.currentTime);
  // });

  socket.on('video play', function(msg) {
    player.play();
  });

  socket.on('video pause', function(msg) {
    player.pause();
  });
});