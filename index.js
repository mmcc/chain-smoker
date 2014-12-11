var app = require('./lib/chain-smoker');

module.exports = function(suite, options, readyCb) {
  app(suite, options, readyCb);
};
