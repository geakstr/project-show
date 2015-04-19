// This file was automatically generated from "app.lmd.json"
(function (global, main, modules, modules_options, options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        
        global_document = global.document,
        local_undefined,
        /**
         * @param {String} moduleName module name or path to file
         * @param {*}      module module content
         *
         * @returns {*}
         */
        register_module = function (moduleName, module) {
            lmd_trigger('lmd-register:before-register', moduleName, module);
            // Predefine in case of recursive require
            var output = {'exports': {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                // or load modules from nodejs/worker environment
                module = lmd_trigger('js:request-environment-module', moduleName, module)[1] || global[moduleName];
            } else if (typeof module === 'function') {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger('lmd-register:decorate-require', moduleName, lmd_require)[1];

                // Make sure that sandboxed modules cant require
                if (modules_options[moduleName] &&
                    modules_options[moduleName].sandbox &&
                    typeof module_require === 'function') {

                    module_require = local_undefined;
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            module = lmd_trigger('lmd-register:after-register', moduleName, module)[1];
            return modules[moduleName] = module;
        },
        /**
         * List of All lmd Events
         *
         * @important Do not rename it!
         */
        lmd_events = {},
        /**
         * LMD event trigger function
         *
         * @important Do not rename it!
         */
        lmd_trigger = function (event, data, data2, data3) {
            var list = lmd_events[event],
                result;

            if (list) {
                for (var i = 0, c = list.length; i < c; i++) {
                    result = list[i](data, data2, data3) || result;
                    if (result) {
                        // enable decoration
                        data = result[0] || data;
                        data2 = result[1] || data2;
                        data3 = result[2] || data3;
                    }
                }
            }
            return result || [data, data2, data3];
        },
        /**
         * LMD event register function
         *
         * @important Do not rename it!
         */
        lmd_on = function (event, callback) {
            if (!lmd_events[event]) {
                lmd_events[event] = [];
            }
            lmd_events[event].push(callback);
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        lmd_require = function (moduleName) {
            var module = modules[moduleName];

            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === 'string' && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {'exports': {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            'global': global,
            'modules': modules,
            'modules_options': modules_options,
            'options': options,

            'eval': global_eval,
            'register': register_module,
            'require': lmd_require,
            'initialized': initialized_modules,

            
            'document': global_document,
            
            

            'on': lmd_on,
            'trigger': lmd_trigger,
            'undefined': local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/**
 * @name sandbox
 */
(function (sb) {

// Simple JSON stringify
function stringify(object) {
    var properties = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            properties.push(quote(key) + ':' + getValue(object[key]));
        }
    }
    return "{" + properties.join(",") + "}";
}

function getValue(value) {
    if (typeof value === "string") {
        return quote(value);
    } else if (typeof value === "boolean") {
        return "" + value;
    } else if (value.join) {
        if (value.length == 0) {
            return "[]";
        } else {
            var flat = [];
            for (var i = 0, len = value.length; i < len; i += 1) {
                flat.push(getValue(value[i]));
            }
            return '[' + flat.join(",") + ']';
        }
    } else if (typeof value === "number") {
        return value;
    } else {
        return stringify(value);
    }
}

function pad(s) {
    return '0000'.substr(s.length) + s;
}

function replacer(c) {
    switch (c) {
        case '\b': return '\\b';
        case '\f': return '\\f';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '\t': return '\\t';
        case '"': return '\\"';
        case '\\': return '\\\\';
        default: return '\\u' + pad(c.charCodeAt(0).toString(16));
    }
}

function quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, replacer) + '"';
}

function indexOf(item) {
    for (var i = this.length; i --> 0;) {
        if (this[i] === item) {
            return i;
        }
    }
    return -1;
}

    /**
     * @event *:request-json requests JSON polifill with only stringify function!
     *
     * @param {Object|undefined} JSON default JSON value
     *
     * @retuns yes
     */
sb.on('*:request-json', function (JSON) {
    if (typeof JSON === "object") {
        return [JSON];
    }

    return [{stringify: stringify}];
});

    /**
     * @event *:request-indexof requests indexOf polifill
     *
     * @param {Function|undefined} arrayIndexOf default indexOf value
     *
     * @retuns yes
     */
sb.on('*:request-indexof', function (arrayIndexOf) {
    if (typeof arrayIndexOf === "function") {
        return [arrayIndexOf];
    }

    return [indexOf];
});

}(sandbox));

/**
 * This plugin enables shortcuts
 *
 * Flag "shortcuts"
 *
 * This plugin provides private "is_shortcut" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function is_shortcut(moduleName, moduleContent) {
    return !sb.initialized[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}

function rewrite_shortcut(moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        sb.trigger('shortcuts:before-resolve', moduleName, module);

        moduleName = module.replace('@', '');
        // #66 Shortcut self reference should be resolved as undefined->global name
        var newModule = sb.modules[moduleName];
        module = newModule === module ? sb.undefined : newModule;
    }
    return [moduleName, module];
}

    /**
     * @event *:rewrite-shortcut request for shortcut rewrite
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('*:rewrite-shortcut', rewrite_shortcut);

    /**
     * @event *:rewrite-shortcut fires before stats plugin counts require same as *:rewrite-shortcut
     *        but without triggering shortcuts:before-resolve event
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('stats:before-require-count', function (moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        moduleName = module.replace('@', '');
        module = sb.modules[moduleName];

        return [moduleName, module];
    }
});

}(sandbox));



    main(lmd_trigger('lmd-register:decorate-require', 'main', lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/
(this,(function (require, exports, module) { /* wrapped by builder */
var Cookie = require('./Cookie');
var Utils = require('./Utils');
var Room = require('./Room');

$(document).ready(function() {
  var url = document.createElement('a');
  url.href = document.URL;

  var route = url.pathname.split('/').filter(function(x) {
    return x !== '';
  });

  $('#username-modal').modal({
    'backdrop': false,
    'keyboard': false,
    'show': false
  });


  if (Cookie.read('username') === null || Cookie.read('username').length === 0) {
    $('#username-modal').modal('show');
  }
  $('#username-modal').find('.username-input').keypress(function(event) {
    $this = $(this);

    if ($this.val().trim().length !== 0) {
      if (event.which == 13) {
        Cookie.create('username', $this.val().trim(), 10);
        $('#username-modal').modal('hide');
        return false;
      }
    }
  });

  var wasUsername = Cookie.read('username');
  $('#username-modal').on('hide.bs.modal', function(event) {
    setupRoutes();
  });

  $('#username-modal').on('shown.bs.modal', function(event) {
    $('#username-input').focus();
  });

  if (Cookie.read('username') !== null && Cookie.read('username').length !== 0) {
    setupRoutes();
  }

  function setupRoutes() {
    switch (route[0]) {
      // On concrete room page
      case 'room':
        var room = new Room(route[1]);
        // if (Cookie.read('video-url') !== null) {
        //   $(room.video.dom).find('source').attr('src', Cookie.read('video-url'));
        // }
        if (Number.tryParseInt(route[1])) {
          if (route[2] === 'video') {
            $('#outer-wrapper > *').hide();
            $('#video-meta').hide();
            $('#outer-wrapper').css({
              "margin": "0",
              "padding": "0"
            });
            $('#video-wrapper').show();
            $('#outer-wrapper').css('width', '100%');
            $('#video-wrapper').css('width', '100%');
          } else if (route[2] === 'chat') {
            $('#outer-wrapper > *').hide();
            $('#outer-wrapper').css({
              "margin": "0",
              "padding": "0"
            });
            $('#chat-wrapper').show();
            $('#chat-wrapper').css('padding-left', '0');
            $('#chat-compose-message-textarea').css('width', "100%");
            $('#outer-wrapper').css('width', '100%');
          }
        }
        break;
        // On other pages
      case 'streamingroom':
        var Video = require('./Video');
        var video = new Video();

        break;
        // On other pages
      default:
        Dropzone.options.myDropzone = {
          'maxFiles': 1,
          init: function() {
            // this.on("addedfile", function(file) {alert('test'); $(this).removeClass('dz-clickable');$(this)[0].removeEventListener('click', this.listeners[1].events.click); }.bind(this));
            this.on('success', function(file, response) {
              Cookie.create('video-url', response, 1);
              window.location.href = '/room/' + Room.generateRoomId(5);
            });
          }
        };
        // Generate rooms id
        $('.create-room-link').each(function(index, element) {
          $(element).attr('href', '/room/' + Room.generateRoomId(5));
        });
        $('.upload-film').on('click', function() {
          $('#myDropzoneWrapper').show();
        });
        break;
    }
  }
});
}),{
"./Chat": (function (require, exports, module) { /* wrapped by builder */
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

  Chat.prototype.appendMessage = function chatAppendMessage(msg, messageType) {
    var time = moment().format("HH:mm");

    var $message = $('<div>').addClass('chat-message').text(msg);
    $message.append($('<div>').addClass('clearfix'));
    $message.append($('<div>').addClass('chat-message-time').text(time));

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
}),
"./Cookie": (function (require, exports, module) { /* wrapped by builder */
var Cookie = (function() {
  function Cookie() {}

  Cookie.create = function cookieCreate(name, value, days) {
    var expires;

    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    } else {
      expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
  }

  Cookie.read = function cookieRead(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  Cookie.remove = function cookieRemove(name) {
    Cookie.create(name, "", -1);
  }

  return Cookie;
})();

module.exports = Cookie;
}),
"./Room": (function (require, exports, module) { /* wrapped by builder */
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

    this._socket.emit('joinroom', this._roomId, Cookie.read('video-url'));

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

  Room.prototype.eventHandlers = function roomEventHandlers() {
    // Connecting with new user
    this._socket.on('connect', function() {
      this._socket.emit('adduser', Cookie.read('username'));
    }.bind(this));

    this._socket.on('update video url', function(videoUrl) {
      this._video.dom.pause();
      $(this._video.dom).find('source').attr('src', "/files/video/" + videoUrl);
      this._video.dom.load();
    }.bind(this));

    // New user connected from server
    this._socket.on('connected', function(username) {
      this._chat.appendMessage(username + ' здесь', 'event');
    }.bind(this));

    // User disconnected from server
    this._socket.on('disconnected', function(username) {
      this._chat.appendMessage(username + ' вышел', 'event');
    }.bind(this));

    // Play video from client
    this._video.dom.addEventListener("play", function() {
      this._chat.appendMessage('Начало воспроизведения', 'event');
      if (!this._videoEventFromServer) {
        this._socket.emit('video play');
      }
      this._videoEventFromServer = false;
    }.bind(this));

    // Pause video from client
    this._video.dom.addEventListener("pause", function() {
      this._chat.appendMessage('Видео на паузе', 'event');
      if (!this._videoEventFromServer) {
        this._socket.emit('video pause');
      }
      this._videoEventFromServer = false;
    }.bind(this));

    // Play video from server
    this._socket.on('video play', function(msg) {
      this._videoEventFromServer = true;
      this._video.dom.play();
    }.bind(this));

    // Pause video from server
    this._socket.on('video pause', function(msg) {
      this._videoEventFromServer = true;
      this._video.dom.pause();
    }.bind(this));

    // New chat message from server
    this._socket.on('chat message', function(msg, username) {
      this._chat.appendMessage(username + " " + msg, 'opponent');
    }.bind(this));
  };

  return Room;
})();

module.exports = Room;
}),
"./StreamingRoom": (function (require, exports, module) { /* wrapped by builder */
var VideoPlayer = require('./VideoPlayer');
var Chat = require('./Chat');
var Cookie = require('./Cookie');
var Video = require('./Video');
var Dropzone = require('./Dropzone');

var Room = (function() {
  function Room(roomId) {
    this._roomId = roomId;

    this._socket = io();
    this._video = new VideoPlayer(this._socket);
    this._chat = new Chat(this._socket);
	this._videoStream = new Video();

    this._videoEventFromServer = false;

    this._socket.emit('joinroom', this._roomId);

    this.eventHandlers();
  }

  Room.prototype.eventHandlers = function roomEventHandlers() {
    // Connecting with new user
    this._socket.on('connect', function() {
      this._socket.emit('adduser', Cookie.read('username'));
    }.bind(this));

    // New user connected from server
    this._socket.on('connected', function(username) {
      this._chat.appendMessage(username + ' здесь', 'event');
    }.bind(this));

    // User disconnected from server
    this._socket.on('disconnected', function(username) {
      this._chat.appendMessage(username + ' вышел', 'event');
    }.bind(this));

    // Play video from client
    this._video.dom.addEventListener("play", function() {
      this._chat.appendMessage('Начало воспроизведения', 'event');
      if (!this._videoEventFromServer) {
        this._socket.emit('video play');
      }
      this._videoEventFromServer = false;
    }.bind(this));

    // Pause video from client
    this._video.dom.addEventListener("pause", function() {
      this._chat.appendMessage('Видео на паузе', 'event');
      if (!this._videoEventFromServer) {
        this._socket.emit('video pause');
      }
      this._videoEventFromServer = false;
    }.bind(this));

    // Play video from server
    this._socket.on('video play', function(msg) {
      this._videoEventFromServer = true;
      this._video.dom.play();
    }.bind(this));

    // Pause video from server
    this._socket.on('video pause', function(msg) {
      this._videoEventFromServer = true;
      this._video.dom.pause();
    }.bind(this));

    // New chat message from server
    this._socket.on('chat message', function(msg) {
      this._chat.appendMessage(msg, 'opponent');
    }.bind(this));
  };

  return Room;
})();

module.exports = Room;
}),
"./Utils": (function (require, exports, module) { /* wrapped by builder */
var Utils = (function() {
  function Utils() {}

  Number.tryParseInt = function(value, byref) {
    if (value.toString().match(/^(\d)/) != null) {
      if (byref != false)
        value = parseInt(value);
      return true;
    } else return false;
  };

  Utils.generateRandomString = function utilsGenerateRandomString(len) {
    var charSet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  };

  return Utils;
})();

module.exports = Utils;
}),
"./Video": (function (require, exports, module) { /* wrapped by builder */
var Video = (function() {
  function Video() {}
  return Video;
})();

module.exports = Video;
}),
"./VideoPlayer": (function (require, exports, module) { /* wrapped by builder */
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
}),
"jquery": "@jQuery",
"io": "@io",
"moment": "@moment"
},{},{});
