$(document).ready(function() {
  var $ = require('jquery');
  var io = require('io');
  var socket = io();
  var chat = $('#chat');

  chat.niceScroll({
    cursorcolor: "#222",
    cursorborder: "none",
    autohidemode: false,
    smoothscroll: false
  });

  var video = $('#video')[0];

  video.addEventListener("play", function() {
    socket.emit('video play');
  });

  video.addEventListener("pause", function() {
    socket.emit('video pause');
  });

  // video.addEventListener("timeupdate", function() {
  //   socket.emit('video timeupdate', video.currentTime);
  // });

  socket.on('video play', function(msg) {
    video.play();
  });

  socket.on('video pause', function(msg) {
    video.pause();
  });
});