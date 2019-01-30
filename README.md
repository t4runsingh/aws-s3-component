# amazon-s3-component [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> elastic.io integration component that can read and write to AWS S3

# amazon-s3-component
&gt; AWS S3 component for the [elastic.io platform](http://www.elastic.io &#34;elastic.io platform&#34;)

If you plan to **deploy it into [elastic.io platform](http://www.elastic.io &#34;elastic.io platform&#34;) you must follow sets of instructions to succseed**. 

## What's inside?

Inside this component you will find a generic sample on how to work with AWS S3. Currently a following Triggers / Actions are implemented:

##Actions:
### Write to File

This action creates or rewritees a new file on S3 with the content that is passed as an input attachment.
The name of the file would be same to the attachment name.
Be careful: this action can process only one attachment - if it would be more or no attachment at all the execution would fail with exception.

### Input fields
 - **Bucket Name** - name of S3 bucket to write file in.

### Read file

This action reads file from S3 bucket by provided name. The result is storing in the output body (for json or xml) or in the output attachment (for other types).
File type resolves by it's extension. The name of attachment would be same to filename.

  ### Input fields
 - **Bucket Name** - name of S3 bucket to read file from.
 

### Get filenames

This action gets all names of files which are storing in S3 bucket with provided name. The filenames emits individually.

### Input fields
  - **Bucket Name** - name of S3 bucket to read filenames (content list).
  

### Delete File

This action removes file from S3 by provided name in selected bucket. The action will emit single filename of removed file.

### Input fields
  - **Bucket Name** - name of S3 bucket to delete file from.


## Before you Begin

Before you can deploy any code into elastic.io **you must be a registered elastic.io platform user**. Please see our home page at [http://www.elastic.io](http://www.elastic.io) to learn how. 

We&#39;ll use git and SSH public key authentication to upload your component code, therefore you must **[upload your SSH Key](http://docs.elastic.io/docs/ssh-key)**. 

&gt; If you fail to upload you SSH Key you will get **permission denied** error during the deployment.

## Getting Started

After registration and uploading of your SSH Key you can proceed to deploy it into our system. At this stage we suggest you to:
* [Create a team](http://docs.elastic.io/docs/teams) to work on your new component. This is not required but will be automatically created using random naming by our system so we suggest you name your team accordingly.
* [Create a repository](http://docs.elastic.io/docs/component-repositories) where your new component is going to *reside* inside the team that you have just created.

Now as you have a team name and component repository name you can add a new git remote where code shall be pushed to. It is usually displayed on the empty repository page:

```bash
$ git remote add elasticio your-team@git.elastic.io:your-repository.git
```

Obviously the naming of your team and repository is entierly upto you and if you do not put any corresponding naming our system will auto generate it for you but the naming might not entierly correspond to your project requirements.
Now we are ready to push it:

```bash
$ git push elasticio master
```

## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)

[npm-image]: https://badge.fury.io/js/amazon-s3-component.svg
[npm-url]: https://npmjs.org/package/amazon-s3-component
[travis-image]: https://travis-ci.org/elasticio/amazon-s3-component.svg?branch=master
[travis-url]: https://travis-ci.org/elasticio/amazon-s3-component
[daviddm-image]: https://david-dm.org/elasticio/amazon-s3-component.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/elasticio/amazon-s3-component
