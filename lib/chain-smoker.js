var api = require('./api');
var runner = require('./runner')();

setTimeout(function() {
  runner.runAll();
}, 1000);
