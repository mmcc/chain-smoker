var _ = require('lodash');

var Job = require('../models/job');
var Step = require('../step');
var utils = require('../utils');

var callbackRoute = function(req, res) {
  var suite = req.app.get('suite');

  var currentStep = _.where(suite.tests, {
    name: req.params.step_name
  })[0];

  if (!currentStep) {
    console.log("Received a callback we don't have a step for...");

    // Even though we don't have a step and this isn't successful, we'll send a successful response
    // here in case the deliverer will retry on errors.
    return res.sendStatus(200);
  }

  var id = currentStep.get_external_id(req);

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

    var step = Step(currentStep, true, job);
    var validations = step.handleCallbackRequest(req, function(err) {
      if (err) return console.error(err);

      res.status(204).send();
    });
  });
};

module.exports = callbackRoute;
