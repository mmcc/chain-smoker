var Job = require('../models/job');
var _ = require('lodash');

var pending = function(req, res) {
  getIncomplete(function(err, jobs) {
    if (err) return res.status(500).json(err);

    var jobProperties = _.map(jobs, function(job) {
      return job.allProperties();
    });

    res.status(200).send(jobProperties);
  });
};

function getIncomplete(cb) {
  Job.findAndLoad({
    completed: false
  }, function (err, incomplete) {
    cb(err, incomplete);
  });
}

module.exports = pending;
