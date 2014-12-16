var Promise = require('bluebird');
var util = require('util');
var redis = Promise.promisifyAll(require("redis"));

var redisClient = redis.createClient();

function init(suite, options, readyCb) {
  redisClient.onAsync('connect').then(function() {
    redis.client = redisClient;
    return require('./api')(suite, options);
  }).then(function() {
    return startScheduled(options);
  }).then(function() {
    return require('./runner')(suite, options);
  }).then(function(runner) {
    readyCb(null, runner);
  }).catch(function(e) {
    readyCb(e);
  });
}

function startScheduled(options) {
  return {
    checkLate: require('./scheduled/check-late')(options),
    clearOld: require('./scheduled/clear-old-jobs')(options)
  };
}



module.exports = init;
