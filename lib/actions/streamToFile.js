const { messages } = require('elasticio-node');
const aws = require('aws-sdk');
const { PassThrough } = require('stream');
const debug = require('debug')('streamToFile');

const { NoAuthRestClient } = require('../StatelessBasicAuthRestClient');

exports.process = async function (msg, cfg) {
  debug('Input: %j', JSON.stringify(msg));
  const s3 = new aws.S3({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.accessKeySecret,
  });

  // eslint-disable-next-line no-param-reassign
  cfg.bucketName = msg.body.bucketName ? msg.body.bucketName : cfg.bucketName;

  // eslint-disable-next-line arrow-body-style
  const attachments = Object.keys(msg.attachments).map((attachmentKey) => {
    return {
      key: attachmentKey,
      url: msg.attachments[attachmentKey],
    };
  });

  if (attachments.length > 1) {
    throw new Error('More than 1 attachment');
  } else if (attachments.length === 0) {
    throw new Error('Has no attachment');
  }

  debug('trying to get attachment from %j', attachments[0].url.url);

  const attachmentClient = new NoAuthRestClient(this, {});
  const attachmentContent = await attachmentClient.makeRawRequest({
    method: 'GET',
    url: attachments[0].url.url,
    isJson: false,
    urlIsSegment: false,
  });

  const passthrough = new PassThrough();
  attachmentContent.pipe(passthrough);

  const s3Input = {
    Bucket: cfg.bucketName,
    Key: msg.body.filename ? msg.body.filename : attachments[0].key.replace(/\//g, ''),
    Body: passthrough,
  };

  debug('inserting into s3: %j', s3Input);

  const result = await s3.upload(s3Input).promise();

  this.emit('data', messages.newMessageWithBody(result));
};
