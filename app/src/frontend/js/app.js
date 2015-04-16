$(document).ready(function() {
  var $ = require('jquery');
  var io = require('io');
  var moment = require('moment');
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
    appendMessage: function appendMessage(msg, messageType) {
      var time = moment().format("HH:mm");

      var $message = $('<div>').addClass('chat-message').text(msg);
      $message.append($('<div>').addClass('clearfix'));
      $message.append($('<div>').addClass('chat-message-time').text(time));

      var $wrapper = $('<li>');
      $wrapper.addClass('chat-message-wrapper clearfix');
      $wrapper.addClass('chat-message-' + messageType);
      $wrapper.append($message);

      chat.messages.append($wrapper);

      setTimeout(function() {
        chat.messages.getNiceScroll(0).doScrollTop(chat.messages[0].scrollHeight, 0);
      }, 100);
    },
    sendMessage: function sendMessage() {
      var msg = chat.textarea.val().trim();

      if (msg.length === 0) {
        return;
      }

      socket.emit('chat message', msg);

      chat.appendMessage(msg, 'self');
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

  socket.on('connected', function(msg) {
    chat.appendMessage('Новый пользователь подключился', 'event');
  });

  socket.on('disconnected', function(msg) {
    chat.appendMessage('Пользователь вышел', 'event');
  });

  socket.on('video play', function(msg) {
    video.play();
    chat.appendMessage('Начало воспроизведения', 'event');
  });

  socket.on('video pause', function(msg) {
    video.pause();
    chat.appendMessage('Видео на паузе', 'event');
  });

  socket.on('chat message', function(msg) {
    chat.appendMessage(msg, 'opponent');
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