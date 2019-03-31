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
  var awsInputs = createAWSInputs(cfg.bucketName)
  var results = []

  listAllKeys();

  function listAllKeys() {
    s3.listObjectsV2(awsInputs, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        var contents = data.Contents;
        contents.forEach(function (content) {
          results.push({
            url: "s3://" + awsInputs.Bucket + "/" + content.Key,
            mandatory: true
          })
        });
        if (data.IsTruncated) {
          awsInputs.ContinuationToken = data.NextContinuationToken;
          listAllKeys();
        } else {
          s3.putObject({
            Bucket: cfg.bucketName,
            Key: 'manifest.txt',
            Body: JSON.stringify({entries: results}),
            ContentType: "application/json"},
            function (err, data) {
              if (err) {
                  console.log("Error uploading manifest: ", err);
              }
            }
          );
        }
      }
    });
  }
  
  this.emit('data', messages.newMessageWithBody({ filename: cfg.bucketName + "/manifest.txt" }));
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
