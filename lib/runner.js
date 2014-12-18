var _ = require('lodash');
var Job = require('./models/job');
var Step = require('./step');

function Runner(suite) {
  this.suite = suite;
}

Runner.prototype.run = function(i) {
  this.step = this.suite.steps[i];

  _runStep(step, i);
};

Runner.prototype.runAll = function() {
  this.suite.tests.forEach(_runStep);
};

/* Private */
function _runStep(currentStep, i) {
  var job = new Job();

  // Step handles the logic for making the requests, updating the job, etc
  var step = Step(currentStep).init(job);
  step.makeRequest();
}


module.exports = function(suite, options) {
  return new Runner(suite);
};
