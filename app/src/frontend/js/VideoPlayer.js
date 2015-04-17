var $ = require('jquery');

var VideoPlayer = (function() {
  function VideoPlayer(socket) {
    this._socket = socket;
    this._video = $('#video')[0];

    this.eventHandlers();
  }

  Object.defineProperty(VideoPlayer.prototype, 'dom', {
    get: function() {
      return this._video;
    },
    enumerable: true
  });

  VideoPlayer.prototype.eventHandlers = function videoPlayerEventHandlers() {

  };

  return VideoPlayer;
})();

module.exports = VideoPlayer;