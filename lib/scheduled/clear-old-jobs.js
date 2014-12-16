var Job = require('../models/job');
var _ = require('lodash');

function Cleaner(options) {
  this.maxCompletedAge = options.maxCompletedAge || 3600000;
  this.cleanFrequency = options.cleanFrequency || 5000;
  this.cleanFailures = options.cleanFailures || false;
  this.cleanerPoll();
}

Cleaner.prototype.cleanerPoll = function() {
  var self = this;
  var interval = setInterval(function() {
    self.getOld();
  }, self.cleanFrequency);

  this.interval = interval;
};

Cleaner.prototype.stopPolling = function() {
  return clearInterval(this.interval);
};

Cleaner.prototype.getOld = function() {
  var self = this;

  var query = { completed: true };
  if (!self.cleanFailures) { query.successful = true; }

  Job.findAndLoad(query, function (err, jobs) {
    if (err === 'not found') return;
    else if (err) return console.error(err);

    var oldJobs = _.filter(jobs, function(job) {
      return job.age() >= self.maxCompletedAge;
    });

    oldJobs.forEach(function(job) {
      job.remove({}, function(err) {
        if (err) console.error(err);
      });
    });
  });
};

module.exports = function(options) {
  return new Cleaner(options);
};
