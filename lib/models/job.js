var nohm = require('nohm').Nohm;
var redis = require('redis').createClient();

redis.on("connect", function() {
  nohm.setClient(redis);
});

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
    completed: {
      type: 'boolean',
      defaultValue: false,
      index: true
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
      return this.p('last_updated') - this.p('created_at');
    },
    saveAndUpdate: function(cb) {
      this.p('last_updated', Date.now());
      this.save(cb);
      return this;
    }
  }
});

module.exports = Job;
