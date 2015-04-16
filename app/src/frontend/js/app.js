$(document).ready(function() {
  var $ = require('jquery');
  var io = require('io');
  var socket = io();

  var video = $('#video')[0];

  var chat = {
    messages: $('#chat'),
    textarea: $('#chat-compose-message-textarea'),
    submit: $('#chat-compose-message-submit'),
    nicescroll: {
      cursorcolor: "#222",
      cursorborder: "none",
      autohidemode: false,
      smoothscroll: false
    },
    decorateMessage: function decorateMessage(msg, isSelf) {
      var $wrapper = $('<li>');
      $wrapper.addClass('chat-message-wrapper clearfix');
      $wrapper.addClass('chat-message-' + (isSelf ? 'self' : 'opponent'));

      var $body = $('<div>');
      $body.addClass('chat-message');
      $body.text(msg);

      $wrapper.append($body);

      return $wrapper;
    },
    sendMessage: function sendMessage() {
      var msg = chat.textarea.val();

      socket.emit('chat message', msg);

      chat.messages.append(chat.decorateMessage(msg, true));
      chat.textarea.val('');
    }
  };

  chat.messages.niceScroll(chat.nicescroll);

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

  socket.on('chat message', function(msg) {
    chat.messages.append(chat.decorateMessage(msg, false));
  });

  chat.submit.on('click', function(event) {
    chat.sendMessage();
    return false;
  });

  chat.textarea.keypress(function(e) {
    if (e.which == 13) {
      chat.sendMessage();
      return false;
    }
    return true;
  });
});