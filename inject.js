// Generated by CoffeeScript 1.3.3
(function() {

  if (steal.plugins) {
    steal.plugins('jquery')('./inject-core.js', './controller.js').then('./cache.js', './eager.js').then('./parent.js');
  } else {
    steal('jquery', './inject-core.js', './controller.js').then('./cache.js', './eager.js').then('./parent.js');
  }

}).call(this);
