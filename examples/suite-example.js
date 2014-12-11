var ChainSmoker = require('chain-smoker');

var Suite = {};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

Suite.tests = [
  {
    address: 'http://www.example.com/accounts/'+ getRandomInt(100, 999) +'/subscriptions',
    method: 'POST',
    body: {
      endpoint: this.callbackAddress,
      events: ['herp', 'derp']
    },
    callback: true,
    assertions: {
      statusCode: 201
    }
  },
  {
    address: 'http://example.com',
    assertions: {
      statusCode: 200
    }
  }
];

ChainSmoker(Suite, {}, function(err, runner) {
  if (err) return console.log(err);
  console.log('Locked and loaded.');
  runner.runAll();
});
