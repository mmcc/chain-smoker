var Job = require('../models/job');
var _ = require('lodash');
var emitter = require('../emitter');

function Late(options) {
  this.lateCallback = options.lateCallback || function(err, lateJobs) {};
  this.frequency = options.lateCheckFrequency || 1500;

  this.pollForLate();
}

Late.prototype.__proto__ = emitter;

Late.prototype.pollForLate = function() {
  var self = this;
  var interval = setInterval(function() {
    self.getLate(self.lateCallback);
  }, self.frequency);

  this.interval = interval;
};

Late.prototype.stopPolling = function() {
  return clearInterval(this.interval);
};

Late.prototype.getLate = function() {
  var self = this;
  Job.findAndLoad({
    completed: false
  }, function (err, late) {
    if (err === 'not found') late = [];

    var lateJobs = _.filter(late, function(job) {
      return job.late();
    });

    var jobProperties = _.map(lateJobs, function(job) {
      return job.allProperties();
    });

    self.lateCallback(jobProperties);

    if (jobProperties.length > 0) {
      self.emit('late', jobProperties);
    }
  });
};

module.exports = function(options) {
  return new Late(options);
};
