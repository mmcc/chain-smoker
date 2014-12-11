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
  var ChainSmoker = require('../');

  var Suite = {};

  Suite.tests = [
    {
      name: 'Example get',
      address: 'http://example.com',
      assertions: {
        statusCode: 200
      }
    }
  ];

  ChainSmoker(Suite, { apiPort: 8080 }, function(err, runner) {
    if (err) return console.log(err);
    console.log('Locked and loaded.');

    // Now that everything's nice and ready, we need to
    // kick off the tests. Sit back and let the man smoke.
    runner.runAll();
  });
  ```

3. Enjoy.
