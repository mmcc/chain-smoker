var ChainSmoker = require('chain-smoker');

var Suite = {};

Suite.tests = [
  {
    address: 'http://example.com',
    assertions: {
      statusCode: 200,
      html_header: function(response) {
        return response.headers['content-type'] === 'text/html';
      }
    }
  }
];

ChainSmoker(Suite, {}, function(err, runner) {
  if (err) return console.log(err);
  console.log('Locked and loaded.');
  runner.runAll();
});
