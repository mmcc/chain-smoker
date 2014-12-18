var Promise = require('bluebird');
var util = require('util');
var redis = Promise.promisifyAll(require("redis"));

function init(suite, options, readyCb) {
  options = setOptions(options);

  Promise.resolve().bind({}).then(function() {
    this.redisClient = redis.createClient(options.redis_port, options.redis_host);
    return this.redisClient;
  }).then(function(redisClient) {
    return this.redisClient.onAsync('connect');
  }).then(function(redisClient) {
    redis.client = this.redisClient;
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

function setOptions(options) {
  options = options || {};

  options.redis_port = 6379;
  options.redis_host = '127.0.0.1';

  return options;
}


module.exports = init;
