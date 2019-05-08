/* eslint-disable func-names */
const { messages } = require('elasticio-node');
const aws = require('aws-sdk');

exports.process = async function (msg, cfg) {
  const s3 = new aws.S3({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.accessKeySecret,
  });

  // eslint-disable-next-line no-param-reassign
  cfg.bucketName = msg.body.bucketName ? msg.body.bucketName : cfg.bucketName;

  // eslint-disable-next-line no-use-before-define
  const awsInputs = createAWSInputs(cfg.bucketName);
  const results = [];

  const data = await s3.listObjects(awsInputs).promise();

  data.Contents.forEach((c) => {
    results.push({
      url: `s3://${awsInputs.Bucket}/${c.Key}`,
      mandatory: true,
    });
  });

  await s3.putObject({
    Bucket: cfg.bucketName,
    Key: 'manifest.txt',
    Body: JSON.stringify({ entries: results }),
    ContentType: 'application/json',
  }).promise();

  this.emit('data', messages.newMessageWithBody({ filename: `${cfg.bucketName}/manifest.txt` }));
};

function createAWSInputs(bucketName) {
  if (bucketName.indexOf('/') > -1) {
    const index = bucketName.indexOf('/');
    const folder = `${bucketName.substring(index + 1)}/BPipe.`;
    const bucket = bucketName.substring(0, index);
    return { Bucket: bucket, Delimiter: '/', Prefix: folder };
  }
  return { Bucket: bucketName };
}
