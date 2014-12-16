var Promise = require('bluebird');
var request = require('request');
var shortId = require('shortid');
var _ = require('lodash');
var utils = require('./utils');
var Job = require('./models/job');
var validator = require('./validator');

function Runner(suite) {
  this.suite = suite;
}

Runner.prototype.run = function(i) {
  var step = this.suite.steps[i];

  runStep(step);
};

Runner.prototype.runAll = function() {
  this.suite.tests.forEach(runStep);
};


/* Private */
function runStep(step, i) {
  var job = new Job();
  job.p('group_id', shortId.generate());
  job.p('step_num', i);
  job.p('address', step.address);
  job.p('method', step.method);

  if (step.callback_time_limit) job.p('callback_time_limit', step.callback_time_limit);

  job.save(function(err) {
    if (err) return console.error(err);
  });

  request({
    uri: step.address,
    method: step.method,
    headers: step.headers,
    json: true,
    body: step.body
  }, function(err, msg, body) {
    var validations = validator.validateStep(step, err, msg);

    if (validations === true || validations === false) {
      job.p('successful', validations);
    } else {
      job.p('run_assertions', validations);

      var status = validator.checkSuccess(step, validations);
      job.p('successful', status);
    }
    job.p('completed', validator.checkComplete(step, false));

    // make the id a string mo matter what
    job.p('external_id', ''+ msg.body.id);

    job.p('response_code', msg.statusCode);
    job.saveAndUpdate(function(err) {
      if (err) return console.error(err);
    });
  });
}

module.exports = function(suite, options) {
  return new Runner(suite);
};
