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