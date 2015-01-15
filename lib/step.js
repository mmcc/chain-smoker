var request = require('request');
var shortId = require('shortid');
var _ = require('lodash');

function Step(step, isCallback, job) {
  this.step = step;
  this.isCallback = isCallback || false;
  if (job) this.job = job;
}

Step.prototype.init = function(job, i) {
  job.p('group_id', shortId.generate());
  job.p('step_num', i);
  job.p('address', this.step.address);
  job.p('method', this.step.method);

  if (this.step.callback_time_limit) job.p('callback_time_limit', this.step.callback_time_limit);

  if (this.step.preset_id) job.p('external_id', ''+ this._setExternalId());

  job.save(function(err) {
    if (err) return console.error(err);
  });

  this.job = job;

  return this;
};

Step.prototype.makeRequest = function() {
  var params = {
    uri: this.step.address,
    method: this.step.method,
    headers: this.step.headers,
    json: true,
    body: this._bodyStringifyAndReplace()
  };

  request(params, this.handleInitialResponse.bind(this));
};

Step.prototype._bodyStringifyAndReplace = function() {
  if (!this.step.body) return;

  var body, isJson = false;
  if (_.isObject(this.step.body)) {
    isJson = true;
    body = JSON.stringify(this.step.body);
  } else {
    body = this.step.body;
  }

  var idRegex = new RegExp("{{external_id}}");
  body = body.replace(idRegex, this.externalId);

  if (isJson) return JSON.parse(body);

  return body;
};

Step.prototype.handleInitialResponse = function(err, res, body) {
  // Request will return an error if actual HTTP communication fails, so we'll call that a failure.
  // If it does error out, there won't be a `res` object, so account for that.
  res = res || { statusCode: 0 };
  this.err = err;
  this.res = res;

  validations = this.validate(err);

  if (validations === true || validations === false) {
    this.job.p('successful', validations);
  } else {
    this.job.p('run_assertions', validations);

    this.job.p('successful', this.checkSuccess(validations));
  }
  this.job.p('completed', this.checkComplete());

  // make the id a string no matter what
  if (!this.job.p('external_id')) {
    this.job.p('external_id', ''+ this._setExternalId());
  }

  this._saveBody(err, res);
  this.job.p('response_code', res.statusCode);
  this.job.saveAndUpdate(function(err) {
    if (err) return console.error(err);
  });
};

Step.prototype._saveBody = function(err, res) {
  if (err) return this.job.p('response_body', err);

  var body, jsonSearch;

  if (res.headers['content-type']) {
    var jsonRegex = new RegExp("application/json");
    jsonSearch = res.headers['content-type'].search(/application\/json/);
  }

  if (jsonSearch && jsonSearch >= 0) {
    body = JSON.stringify(res.body);
  } else {
    body = res.body;
  }

  this.job.p('response_body', body);
};

Step.prototype.handleCallbackRequest = function(req, cb) {
  this.req = req;

  var validations = this.validate();

  if (validations === true || validations === false) {
    this.job.p('successful', validations);
  } else {
    validations = _.merge(this.job.p('run_assertions'), validations);
    this.job.p('run_assertions', validations);

    var allDone = this.checkSuccess();

    this.job.p('successful', allDone);
  }

  this.job.p('completed', this.checkComplete());

  this.job.saveAndUpdate(cb);
};

Step.prototype.validate = function(preFail) {
  if(preFail) return false;

  var assertions, completed;

  assertions = this._chooseAssertions();

  // If there are no assertions to validate, assume a 2xx response is successful
  // Empty assertions is also only valid on the initial response, not a callback.
  if (!assertions) {
    completed = !!(this.res.statusCode >= 200 && this.res.statusCode <= 299);
  } else {
    completed = {};
    _.keys(assertions).forEach(function(assertion) {
      completed[assertion] = this.runAssertion(assertion);
    }, this);
  }

  return completed;
};

Step.prototype.runAssertion = function(assertionKey) {
  var assertions, msg, status;

  assertions = this._chooseAssertions();
  msg = this.res || this.req;

  var assertion = assertions[assertionKey];
  if (_.isFunction(assertion)) {
    status = assertion(msg);
  } else {
    status = _.isEqual(msg[assertionKey], assertion);
  }

  return status;
};

Step.prototype.checkComplete = function() {
  return !(this.step.callback_assertions && !this.isCallback);
};

Step.prototype.checkSuccess = function(assertions) {
  var assertionValues = _.values(assertions);

  var failureCheck = assertionValues.indexOf(false);

  return failureCheck < 0;
};

Step.prototype._chooseAssertions = function() {
  if (this.isCallback) {
    return this.step.callback_assertions;
  } else {
    return this.step.assertions;
  }
};

// External IDs can be tricky. In some cases, such as Zencoder, we can use the exact same
// path for the ID for both the initial request and the notification. For other services,
// not so much.
Step.prototype._setExternalId = function() {
  var msg = this.res || this.req;
  var externalId;
  if (_.isFunction(this.step.set_external_id)) {
    externalId = this.step.set_external_id(msg);
  } else {
    externalId = this.step.set_external_id;
  }

  this.externalId = externalId;

  return externalId;
};


module.exports = function(step, isCallback, job) {
  return new Step(step, isCallback, job);
};
