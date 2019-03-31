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
    Key: "manifest.txt"
  }).promise();

  const resultJson = JSON.parse(result.Body.toString())

  resultJson.entries.foreach(function (content) {
    const url = content.url;                                          // s3://mybucket-alpha/folder/custdata.1
    const origin = url.substring(5)                                   // mybucket-alpha/folder/custdata.1
    const originBucket = origin.substring(0, origin.lastIndexOf('/')) // mybucket-alpha/folder/
    const filename = origin.substring(origin.lastIndexOf('/') + 1)    // custdata.1

    console.log("url: " + url)
    console.log("origin: " + origin)
    console.log("originBucket: " + originBucket)
    console.log("filename: " + filename)

    s3.copyObject({
        Bucket: originBucket + "/archive", // destination
        CopySource: origin, // /sourcebucket/filename
        Key: filename // filename
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            s3.deleteObject({
                Bucket: originBucket,
                Key: filename
            }, function(err, data) {
                if (err) {
                    console.log(err, err.stack)
                }
            })
        }
    })
  });
  
  this.emit('data', messages.newMessageWithBody({ filename: cfg.bucketName + "/manifest.txt" }));
};
