var _ = require('lodash');

var validator = {};

validator.validateStep = function(step, err, msg, isCallback) {
  var assertions, completed;

  assertions = chooseAssertions(step, isCallback);

  // If there are no assertions to validate, assume a 2xx response is successful
  if (!assertions) {
    completed = !!(msg.statusCode >= 200 && msg.statusCode <= 299);
  } else {
    completed = {};
    _.keys(assertions).forEach(function(assertion) {
      completed[assertion] = validator.runAssertion(assertion, step, msg, isCallback);
    });
  }

  return completed;
};

validator.runAssertion = function(assertionKey, step, msg, isCallback) {
  var assertions, status;

  assertions = chooseAssertions(step, isCallback);

  var assertion = assertions[assertionKey];
  if (_.isFunction(assertion)) {
    console.log('it was a function');
    status = assertion(msg);
  } else {
    status = _.isEqual(msg[assertionKey], assertion);
  }

  return status;
};

validator.checkComplete = function(step, isCallback) {
  return !(step.callback_assertions && !isCallback);
};

validator.checkSuccess = function(step, runAssertions) {
  var assertionValues = _.values(runAssertions);

  var failureCheck = assertionValues.indexOf(false);

  return failureCheck < 0;
};

function chooseAssertions(step, callback) {
  if (callback) return step.callback_assertions;

  return step.assertions;
}

module.exports = validator;
