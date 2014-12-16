var nohm = require('nohm').Nohm;
var redis = require('redis').client;

nohm.setClient(redis);

var Job;

Job = nohm.model('Job', {
  properties: {
    address: {
      type: 'string'
    },
    method: {
      type: 'string',
      defaultValue: 'GET'
    },
    group_id: {
      type: 'string',
      index: true,
      validations: [
        ['notEmpty']
      ]
    },
    created_at: {
      type: 'timestamp',
      defaultValue: Date.now(),
      validations: [
        ['notEmpty']
      ]
    },
    last_updated: {
      type: 'timestamp',
      defaultValue: Date.now(),
      validations: [
        ['notEmpty']
      ]
    },
    external_id: {
      type: 'string',
      index: true
    },
    response_code: {
      type: 'integer'
    },
    successful: {
      type: 'boolean',
      defaultValue: false,
      index: true
    },
    completed: {
      type: 'boolean',
      defaultValue: false,
      index: true
    },
    callback_time_limit: {
      type: 'integer'
    },
    run_assertions: {
      type: 'json'
    },
    test_name: {
      type: 'string'
    },
    step_num: {
      type: 'integer'
    }
  },
  methods: {
    age: function() {
      return Date.now() - this.p('created_at');
    },
    late: function() {
      if (this.p('callback_time_limit') === 0) return false;
      var maxAcceptableAge = this.p('created_at') + this.p('callback_time_limit');
      return Date.now() > maxAcceptableAge;
    },
    saveAndUpdate: function(cb) {
      this.p('last_updated', Date.now());
      this.save(cb);
      return this;
    }
  }
});

module.exports = Job;
