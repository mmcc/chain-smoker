# Chain Smoker

It runs your tests. It checks the callbacks. Chain Smoker is an old curmudgeon that will yell at you when your stuff falls over.

## It's totally not ready for use yet. Come back later.

### Setup

Chain Smoker requires [Redis](http://redis.io/).

1. Install Chain Smoker

  ```shell
  $ npm install chain-smoker --save
  ```

2. Create your test suite.

  ```js
  var ChainSmoker = require('chain-smoker');

  var Suite = {};

  Suite.tests = [
    {
      name: 'example-get',
      address: 'http://example.com',
      assertions: {
        statusCode: 200
      }
    },
    {
      name: 'example-callback',
      address: 'http://example.com/call/me/back',
      method: 'POST',
      headers: {
        'X-Awesome-Header': 'this is really cool'
      },
      body: {
        neato: true,
        callback_url: 'http://this-hostname/callback/example-callback'
      },
      external_id: function(req) {
        return req.body.id;
      }
    }
  ];

  var options = {
    apiPort: 8080,
    lateCallback: function(jobs) {
      if (jobs.length === 0) {
        console.log('There are no late jobs!');
      } else {
        console.log('There are '+ jobs.length +' late jobs!');
        console.log(jobs);
      }
    }
  }

  ChainSmoker(Suite, options, function(err, runner) {
    if (err) return console.log(err);
    console.log('Locked and loaded.');

    // Now that everything's nice and ready, we need to
    // kick off the tests. Sit back and let the man smoke.
    runner.runAll();
  });
  ```

3. Enjoy.

### Test options

Option   | Details (default)
-------  | ---------
name     | `String` (`null`) - Name of the test (really useful for callback routing)
address  | `string` (`null`) - Endpoint to hit for the test
method   | `string` (`GET`) - HTTP method to use when hitting the specified address
headers  | `Object` (`{}`) - Headers to deliver when making the request
body     | `String` or `Object` ('null') - If an object is given, it will be stringified before making the request.
external_id | `Function` (`msg.body.id`) - Function that returns a unique ID from the response. If this is null, `msg.body.id` is blindly used, so external_id could potentially be null.
assertions | `Object` ({}) - Object containing the assertions to run against the initial request. The values of each assertion can either be a string (or object) to compare against the key of the same name in the response, or a function that returns true or false.
callback_assertions | `Object` (`null`) - Same as above, but for the callback received from the initial request
callback_time_limit | `Integer` (`0`) - Amount of time (in milliseconds) before a callback is considered late. After this point, the late jobs begin to show up in the `lateCallback` mentioned below.

### Chain Smoker Run Options

Option        | Values (default)      | Details
------------- | ----------------      | ------------
apiPort       | Integer (`3000`)      | The port to use for the callback server
lateCallback  | Fn([jobs]) (`noop()`) | The function to call when the check for late jobs comes back. The callback fires even if the array is empty, which can be useful to clear out any pager alerts or other things fired when the array was not empty.
lateCheckFrequency | Integer (`1500`) | How often in milliseconds to check for late jobs
disableCleaner | Boolean (`false`)    | If true, old completed jobs will not be removed from the database
cleanFailures  | Boolean (`false`)    | Whether or not to remove jobs that have completed, but were unsuccessful
maxCompletedAge | Integer (`3600000`) | If cleanup is enabled, this is the age (in milliseconds) threshold before a job is cleaned. Default is 1 hour.
cleanFrequency | Integer (`5000`)     | How often in milliseconds to run the cleanup check
