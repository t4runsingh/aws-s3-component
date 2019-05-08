/* eslint-disable func-names,no-console,no-unused-vars,no-shadow */
const { messages } = require('elasticio-node');
const aws = require('aws-sdk');

exports.process = async function (msg, cfg) {
  const s3 = new aws.S3({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.accessKeySecret,
  });

  // eslint-disable-next-line no-param-reassign
  cfg.bucketName = msg.body.bucketName ? msg.body.bucketName : cfg.bucketName;

  /*
{
  "entries": [
    {"url":"s3://mybucket-alpha/custdata.1","mandatory":true},
    {"url":"s3://mybucket-alpha/custdata.2","mandatory":true},
    {"url":"s3://mybucket-beta/custdata.1","mandatory":false}
  ]
}
*/

  const result = await s3.getObject({
    Bucket: cfg.bucketName,
    Key: 'manifest.txt',
  }).promise();

  const resultJson = JSON.parse(result.Body.toString());

  resultJson.entries.forEach((content) => {
    const { url } = content; // s3://mybucket-alpha/folder/custdata.1
    const origin = url.substring(5); // mybucket-alpha/folder/custdata.1
    const originBucket = origin.substring(0, origin.lastIndexOf('/')); // mybucket-alpha/folder/
    const filename = origin.substring(origin.lastIndexOf('/') + 1); // custdata.1

    console.log(`url: ${url}`);
    console.log(`origin: ${origin}`);
    console.log(`originBucket: ${originBucket}`);
    console.log(`filename: ${filename}`);

    s3.copyObject({
      Bucket: `${originBucket}/archive`,
      CopySource: origin,
      Key: filename,
    }, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        s3.deleteObject({
          Bucket: originBucket,
          Key: filename,
        }, (err, data) => {
          if (err) {
            console.log(err, err.stack);
          }
        });
      }
    });
  });

  s3.deleteObject({
    Bucket: cfg.bucketName,
    Key: 'manifest.txt',
  }, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    }
  });

  this.emit('data', messages.newMessageWithBody({ filename: `${cfg.bucketName}/manifest.txt` }));
};
