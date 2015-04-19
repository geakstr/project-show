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