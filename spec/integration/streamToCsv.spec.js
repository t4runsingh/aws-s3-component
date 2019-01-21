/* eslint-disable global-require */

const fs = require('fs');
const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');

const { expect } = chai;

const streamToCsv = require('../../lib/actions/streamToFile');

describe('Insert file', function () {
  this.timeout(50000);
  let configuration;
  let testInput;
  let emitter;
  let msg;

  before(async () => {
    if (fs.existsSync('.env')) {
      require('dotenv').config();
    }

    configuration = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      accessKeySecret: process.env.ACCESS_KEY_SECRET,
      bucketName: 'lloyds-dev/Demo',
    };
  });

  beforeEach(() => {
    emitter = {
      emit: sinon.spy(),
    };

    msg = { body: { filename: 'some123isin' }, attachments: { someKey: { url: 'https://attachment.url.loc/someof' } } };

    testInput = [{ hello: 'world' }, { andSomething: 'too' }];
  });

  it('updating', async () => {
    nock('https://attachment.url.loc/', { encodedQueryParams: true })
      .get('/someof').reply(200, testInput);

    await streamToCsv.process.call(emitter, msg, configuration, {});
    const result = emitter.emit.getCall(0).args[1];
    expect(Object.keys(result.body)[0]).to.eql('ETag');
  });
});
