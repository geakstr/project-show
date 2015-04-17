var Cookie = require('./Cookie');

$(document).ready(function() {
  Number.tryParseInt = function(value, byref) {
    if (value.toString().match(/^(\d)/) != null) {
      if (byref != false)
        value = parseInt(value);
      return true;
    } else return false;
  }

  var url = document.createElement('a');
  url.href = document.URL;

  var route = url.pathname.split('/').filter(function(x) {
    return x !== '';
  });

  switch (route[0]) {
    // On concrete room page
    case 'room':
      if (Number.tryParseInt(route[1])) {
        var Room = require('./Room');
        var room = new Room(route[1]);
      }
      break;
      // On other pages
    default:
      // Join room button click
      $('.create-room-link').on('click', function() {
        $this = $(this);
        var username = $this.parent('.film-card-wrapper').find('.create-room-username');

        if (username.hasClass('hidden')) {
          username.removeClass('hidden');
          username.focus();
          $this.removeClass('btn-default');
          $this.addClass('btn-success');
          $this.attr('disabled', true);
          return false;
        } else {
          var usernameVal = username.val().trim();
          if (usernameVal.length !== 0) {
            Cookie.create('username', usernameVal, 10);
          }
        }
        return true;
      });
      // Everything changes to nickname text field
      $('.create-room-username').on('input change', function() {
        $this = $(this);
        var username = $this.val().trim();
        var submit = $this.parent('.film-card-wrapper').find('.create-room-link');
        submit.attr('disabled', username.length === 0);
      });
      // Input something to nickname text field
      $('.create-room-username').keypress(function(event) {
        $this = $(this);

        if ($this.val().trim().length !== 0) {
          // Emulate click on create room button
          if (event.which == 13) {
            var submit = $this.parent('.film-card-wrapper').find('.create-room-link');
            submit[0].click();
            return false;
          }
        }
        return true;
      });
  }
});