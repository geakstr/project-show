var $ = require('jquery');
var moment = require('moment');

var Chat = (function() {
  function Chat(socket) {
    this._socket = socket;

    this._selfUser = {};
    this._messages = $('#chat');
    this._textarea = $('#chat-compose-message-textarea');
    this._submit = $('#chat-compose-message-submit');
    this._nicescrollConfig = {
      cursorcolor: "#222",
      cursorborder: "none",
      autohidemode: false,
      smoothscroll: false
    };
    this._messages.niceScroll(this._nicescrollConfig);

    this.eventHandlers();
  }

  Chat.prototype.appendMessage = function chatAppendMessage(msg, messageType, username) {
    var time = moment().format("HH:mm");

    var $message = $('<div>').addClass('chat-message').text(msg);
    $message.append($('<div>').addClass('clearfix'));
    var $meta = $('<div>');
    if (username !== undefined) {
      $meta.append($('<span>').addClass('chat-message-username').text(username));
    }
    $meta.append($('<span>').addClass('chat-message-time').text(time));
    $message.append($meta);

    var $wrapper = $('<li>');
    $wrapper.addClass('chat-message-wrapper clearfix');
    $wrapper.addClass('chat-message-' + messageType);
    $wrapper.append($message);

    this._messages.append($wrapper);

    setTimeout(function() {
      this._messages.getNiceScroll(0).doScrollTop(this._messages[0].scrollHeight, 0);
    }.bind(this), 100);
  };

  Chat.prototype.sendMessage = function chatSendMessage() {
    var msg = this._textarea.val().trim();

    if (msg.length === 0) {
      return;
    }

    this._socket.emit('chat message', msg);

    this.appendMessage(msg, 'self');
    this._textarea.val('');
  };

  Chat.prototype.eventHandlers = function chatEventHandlers() {
    // Send message from client by click on send button
    this._submit.on('click', function(event) {
      this.sendMessage();
      return false;
    }.bind(this));

    // Send message from client by press Enter in textarea
    this._textarea.keypress(function(event) {
      if (event.which == 13) {
        this.sendMessage();
        return false;
      }
      return true;
    }.bind(this));
  };

  return Chat;
})();

module.exports = Chat;