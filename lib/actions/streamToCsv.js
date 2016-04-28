/* eslint new-cap: [2, {"capIsNewExceptions": ["Q"]}] */
var Q = require('q');
var elasticio = require('elasticio-node');
var messages = elasticio.messages;
var AWS = require('aws-sdk');
var s3Stream = require('s3-upload-stream');
var csvParser = require('csv');
var _ = require('lodash');

module.exports.process = processAction;

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg) {
  var self = this;

  AWS.config.update({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.accessKeySecret
  });
  var upload = s3Stream(new AWS.S3());

  console.log('Processing CSV row with config=%j', cfg);

  function formatData() {
    var csv = cfg.csv || {};
    var columns = csv.columns || [];

    if (columns.length === 0) {
      return;
    }

    var headers = _.map(columns, 'title');
    var body = msg.body || {};
    var keyName = cfg.keyName;

    var values = [];

    _.map(columns, 'property').forEach(function(prop) {
      values.push(formatValue(body[prop]));
    });

    var headerStr = stringify(headers);
    var rowStr = stringify(values);

  }

  function emitData() {
    console.log('About to say hello to ' + name + ' again');

    var body = {
      greeting: name + ' How are you today?',
      originalGreeting: msg.body.greeting
    };

    var data = messages.newMessageWithBody(body);

    self.emit('data', data);
  }

  function emitError(e) {
    console.log('Oops! Error occurred');

    self.emit('error', e);
  }

  function emitEnd() {
    console.log('Finished execution');

    self.emit('end');
  }

  Q().then(formatData).then(emitData).fail(emitError).done(emitEnd);
}


function stringify(str) {
  return csvParser().from([]).stringifier.stringify(str);
}

function formatValue(value) {
  if(_.isNull(value) || _.isUndefined(value)) {
    return '';
  }

  return String(value);
}
