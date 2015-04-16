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
}),{
"jquery": "@jQuery",
"io": "@io"
},{},{});
