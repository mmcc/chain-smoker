var _ = require('lodash');

var validator = {};

validator.validateStep = function(step, err, msg, callback) {
  var assertions, completed;

  if (callback) {
    assertions = step.callback_assertions;
  } else {
    assertions = step.assertions;
  }

  // If there are no assertions to validate, assume a 2xx response is successful
  if (!assertions) {
    completed = !!(msg.statusCode >= 200 && msg.statusCode <= 299);
  } else {
    completed = {};
    _.keys(assertions).forEach(function(assertion) {
      completed[assertion] = validator.runAssertion(assertion, step, msg);
    });
  }

  return completed;
};

validator.runAssertion = function(assertionKey, step, msg, callback) {
  var status;

  var assertion = step.assertions[assertionKey];

  if (_.isFunction(assertion)) {
    status = assertion(msg);
  } else {
    status = _.isEqual(msg[assertionKey], assertion);
  }

  return status;
};

validator.checkComplete = function(step, runAssertions, isCallback) {
  // We can go ahead and assume this isn't 100% finished yet if
  // this is not a callback response and the callback_assertions block
  // is not empty.
  if (!isCallback && !(_.isEmpty(step.callback_assertions))) {
    return false;
  }

  var assertionValues = _.values(runAssertions);

  var failureCheck = assertionValues.indexOf(false);

  return failureCheck < 0;
};

module.exports = validator;
