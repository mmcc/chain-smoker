var express    = require('express');
var path       = require('path');
var logger     = require('morgan');
var bodyParser = require('body-parser');
var moment     = require('moment');

var Job = require('./models/job');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
var pending = require('./routes/pending');
var complete = require('./routes/complete');
var callback = require('./routes/callback');

app.get('/', function(req, res) {
  res.status(200).json({ cool: true });
});

app.get('/pending', pending);
app.get('/complete', complete);
app.post('/callback/:step_name', callback);

app.post('/job', function(req, res) {
  var options = req.body.options;

  res.status(200).json(options);
});

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
