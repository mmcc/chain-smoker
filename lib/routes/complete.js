var Job = require('../models/job');
var _ = require('lodash');

var complete = function(req, res) {
  getComplete(function(err, jobs) {
    if (err) return res.status(500).json(err);

    var jobProperties = _.map(jobs, function(job) {
      return job.allProperties();
    });

    res.status(200).send(jobProperties);
  });
};

function getComplete(cb) {
  Job.findAndLoad({
    completed: true
  }, function (err, incomplete) {
    cb(err, incomplete);
  });
}

module.exports = complete;
