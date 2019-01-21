/* eslint-disable global-require,no-unused-vars */

const fs = require('fs');
const chai = require('chai');
const sinon = require('sinon');
const nock = require('nock');

const { expect } = chai;

const readFile = require('../../lib/actions/readFile');

describe('Read file', function () {
  this.timeout(50000);
  let configuration;
  let emitter;
  let msg;

  before(async () => {
    if (fs.existsSync('.env')) {
      require('dotenv').config();
    }

    configuration = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      accessKeySecret: process.env.ACCESS_KEY_SECRET,
      bucketName: 'lloyds-dev',
    };
  });

  beforeEach(() => {
    emitter = {
      emit: sinon.spy(),
    };

    msg = {};
  });

  it('reading xml', async () => {
    msg.body = { filename: 'LU0326731121.xml' };
    await readFile.process.call(emitter, msg, configuration, {});
    const result = emitter.emit.getCall(0).args[1];
    const expectedDeclaration = {
      attributes: {
        encoding: 'UTF-8',
        version: '1.0',
      },
    };

    expect(result.body.declaration).to.deep.eql(expectedDeclaration);
  });

  it('reading json', async () => {
    msg.body = { filename: 'componentConfig.json' };
    await readFile.process.call(emitter, msg, configuration, {});
    const result = emitter.emit.getCall(0).args[1];

    expect(result.body.name).to.eql('amazon-s3-component');
  });

  it('reading csv', async () => {
    nock('http://api-service.platform.svc.cluster.local.:9000/', { encodedQueryParams: true })
      .post('/v2/resources/storage/signed-url')
      .reply(200, { put_url: 'http://api.io/some', get_url: 'http://api.io/some' });
    nock('http://api.io/', { encodedQueryParams: true })
      .put('/some').reply(200, { signedUrl: { put_url: 'http://api.io/some' } });

    msg.body = { filename: 'csv/result.csv' };

    await readFile.process.call(emitter, msg, configuration, {});
    const result = emitter.emit.getCall(0).args[1];

    const expectedAttachment = {
      'csv/result.csv': {
        url: 'http://api.io/some',
        size: 22,
        'content-type': 'text/csv',
      },
    };

    expect(result.body.attachments).to.deep.eql(expectedAttachment);
  });

  it('reading png', async () => {
    nock('http://api-service.platform.svc.cluster.local.:9000/', { encodedQueryParams: true })
      .post('/v2/resources/storage/signed-url')
      .reply(200, { put_url: 'http://api.io/some', get_url: 'http://api.io/some' });
    nock('http://api.io/', { encodedQueryParams: true })
      .put('/some').reply(200, { signedUrl: { put_url: 'http://api.io/some' } });

    msg.body = { filename: 'b_jskob_ok.png' };

    await readFile.process.call(emitter, msg, configuration, {});
    const result = emitter.emit.getCall(0).args[1];

    const expectedAttachment = {
      'b_jskob_ok.png': {
        url: 'http://api.io/some',
        size: 109170,
        'content-type': 'image/png',
      },
    };

    expect(result.body.attachments).to.deep.eql(expectedAttachment);
  });
});
