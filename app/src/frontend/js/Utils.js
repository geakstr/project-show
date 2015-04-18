var Utils = (function() {
  function Utils() {}

  Number.tryParseInt = function(value, byref) {
    if (value.toString().match(/^(\d)/) != null) {
      if (byref != false)
        value = parseInt(value);
      return true;
    } else return false;
  }

  return Utils;
})();

module.exports = Utils;