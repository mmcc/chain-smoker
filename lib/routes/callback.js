var _ = require('lodash');

var Job = require('../models/job');
var validator = require('../validator');
var utils = require('../utils');

var callbackRoute = function(req, res) {
  var suite = req.app.get('suite');

  var step = _.where(suite.tests, {
    name: req.params.step_name
  })[0];

  if (!step) {
    console.log("Received a callback we don't have a step for...");

    // Even though we don't have a step and this isn't successful, we'll send a successful response
    // here in case the deliverer will retry on errors.
    return res.sendStatus(200);
  }

  var id = step.external_id(req.body);

  Job.findAndLoad({
    external_id: id
  }, function(err, jobs) {
    if (jobs.length > 1) {
      console.log('For some reason, we found multiple tests for this unique ID?!\nUsing the first one...');
    }

    var job = jobs[0];
    if (!job) {
      return console.log('No job found...');
    }

    var validations = validator.validateStep(step, null, req, true);

    if (validations === true || validations === false) {
      job.p('successful', validations);
    } else {
      validations = _.merge(job.p('run_assertions'), validations);
      job.p('run_assertions', validations);

      var allDone = validator.checkSuccess(step, validations, true);

      job.p('successful', allDone);
    }

    job.p('completed', validator.checkComplete(step, true));

    job.saveAndUpdate(function(err) {
      if (err) return console.error(err);

      res.status(204).send();
    });
  });
};

module.exports = callbackRoute;
