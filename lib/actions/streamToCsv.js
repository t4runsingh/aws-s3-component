/* eslint new-cap: [2, {"capIsNewExceptions": ["Q"]}] */
var Q = require('q');
var elasticio = require('elasticio-node');
var messages = elasticio.messages;
var AWS = require('aws-sdk');
var s3Stream = require('s3-upload-stream');
var csvParser = require('csv');
var _ = require('lodash');

/**
 * Singleton instance for streaming
 */
var outStream;

module.exports.process = processAction;

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg) {
  var self = this;
  var counter = 0;
  var fileIndex = 0;

  console.log('Processing CSV row with config=%j', cfg);

  function prepareStreams() {
    if (!outStream) {
      var s3client = new AWS.S3({
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.accessKeySecret
      });
      var streamClient = s3Stream(s3client);
      var csv = cfg.csv || {};
      var columnConfig = csv.columns || [];
      if (columnConfig.length === 0) {
        throw new Error("Columns can not be empty");
      }
      var columns = {};
      _.map(columnConfig, function transform(column) {
        columns[column.property] = column.title;
      });
      console.log('Processing following column configuration columns=%j', columns);
      var stringifier = csvParser.stringify({header: true, columns: columns});
      var upload = streamClient.upload({
        Bucket: cfg.bucketName,
        Key: cfg.keyName + (fileIndex > 0? fileIndex : ''),
        ContentType: "text/csv"
      });
      stringifier.pipe(upload);
      outStream = stringifier;
      // Register shutdown hook
      process.on('exit', function() {
        console.log('Shutting down');
        stringifier.end();
        console.log('Shutdown completed');
      });
    }
    return outStream;
  }

  function writeData(stream) {
    stream.write(msg.body);
    counter++;
    if (counter >= 1000) {
      console.log('Flushing the log file');
      outStream.end();
      outStream = null;
      counter = 0;
      fileIndex++;
    }
  }

  function emitData() {
    var data = messages.newMessageWithBody(msg.body);
    self.emit('data', data);
  }

  function emitError(e) {
    console.log('Oops! Error occurred', e.stack || e);
    self.emit('error', e);
  }

  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q().then(prepareStreams).then(writeData).then(emitData).fail(emitError).done(emitEnd);
}
