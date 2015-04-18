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

  if (Cookie.read('username') !== null && Cookie.read('username').length !== 0) {
    setupRoutes();
  }

  function setupRoutes() {
    switch (route[0]) {
      // On concrete room page
      case 'room':
        if (Number.tryParseInt(route[1])) {
          var room = new Room(route[1]);
        }
        break;
        // On other pages
      default:
        // Generate rooms id
        $('.create-room-link').each(function(index, element) {
          $(element).attr('href', '/room/' + Room.generateRoomId(5));
        });
        break;
    }
  }
});