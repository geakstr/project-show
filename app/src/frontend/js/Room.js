var VideoPlayer = require('./VideoPlayer');
var Chat = require('./Chat');
var Cookie = require('./Cookie');

var Room = (function() {
  function Room(roomId) {
    this._roomId = roomId;

    this._socket = io();
    this._video = new VideoPlayer(this._socket);
    this._chat = new Chat(this._socket);

    this._videoEventFromServer = false;

    this._socket.emit('joinroom', this._roomId, Cookie.read('video-url'), Cookie.read('video-title'));
    this.updateVideoUrl(Cookie.read('video-url'));

    this.eventHandlers();
  }

  Object.defineProperty(Room.prototype, 'video', {
    get: function() {
      return this._video;
    },
    enumerable: true
  });

  Room.generateRoomId = function roomGenerateRoomId(len) {
    var charSet = '0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  };

  Room.prototype.updateVideoUrl = function roomUpdateVideoUrl(videoUrl) {
    this._video.dom.pause();
    $(this._video.dom).find('source').attr('src', "/files/video/" + videoUrl);
    this._video.dom.load();
  };

  Room.prototype.eventHandlers = function roomEventHandlers() {
    // Connecting with new user
    this._socket.on('connect', function() {
      this._socket.emit('adduser', Cookie.read('username'));
    }.bind(this));

    this._socket.on('update video url', function(videoUrl) {
      this.updateVideoUrl(videoUrl);
    }.bind(this));

    this._socket.on('update video title', function(videoTitle) {
      $(this._video.dom).parent("#video-wrapper").find("#video-meta-title").text(videoTitle);
    }.bind(this));

    // New user connected from server
    this._socket.on('connected', function(username) {
      this._chat.appendMessage(username + ' здесь', 'event');
    }.bind(this));

    // User disconnected from server
    this._socket.on('disconnected', function(username) {
      this._chat.appendMessage(username + ' вышел', 'event', username);
    }.bind(this));

    // Play video from client
    this._video.dom.addEventListener("play", function() {
      this._chat.appendMessage('Начало воспроизведения', 'event');
      if (!this._videoEventFromServer) {
        this._socket.emit('video play', this._video.dom.currentTime);
      }
      this._videoEventFromServer = false;
    }.bind(this));

    // Pause video from client
    this._video.dom.addEventListener("pause", function() {
      this._chat.appendMessage('Видео на паузе', 'event');
      if (!this._videoEventFromServer) {
        this._socket.emit('video pause', this._video.dom.currentTime);
      }
      this._videoEventFromServer = false;
    }.bind(this));

    // Play video from server
    this._socket.on('video play', function(time) {
      this._videoEventFromServer = true;
      this._video.dom.play();
    }.bind(this));

    // Pause video from server
    this._socket.on('video pause', function(time) {
      this._videoEventFromServer = true;
      this._video.dom.pause();
    }.bind(this));

    // Sync time from server
    this._socket.on('sync video time', function(time) {
      console.log(time);
      this._video.dom.currentTime = time;
    }.bind(this));

    // New chat message from server
    this._socket.on('chat message', function(msg, username) {
      this._chat.appendMessage(msg, 'opponent', username);
    }.bind(this));

    // Transfer video time to server
    setInterval(function() {
      this._socket.emit('sync video time', this._video.dom.currentTime);
    }.bind(this), 1000);
  };

  return Room;
})();

module.exports = Room;