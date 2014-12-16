var Job = require('../models/job');
var _ = require('lodash');

var pending = function(req, res) {
  getLate(function(err, jobs) {
    if (err) {
      if (err === 'not found') return res.status(200).send([]);

      return res.status(500).json(err);
    }

    var jobProperties = _.map(jobs, function(job) {
      return job.allProperties();
    });

    res.status(200).send(jobProperties);
  });
};

function getLate(cb) {
  Job.findAndLoad({
    completed: false
  }, function (err, incomplete) {
    var lateJobs = _.filter(incomplete, function(job) {
      return job.late();
    });
    cb(err, lateJobs);
  });
}

module.exports = pending;
