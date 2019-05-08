/* eslint-disable global-require,func-names */

const fs = require('fs');
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;

const getAllFilesInBucket = require('../../lib/actions/getAllFilesInBucket');

describe('Insert file', function () {
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
      bucketName: 'lloyds-dev/inbound',
    };
  });

  beforeEach(() => {
    emitter = {
      emit: sinon.spy(),
    };

    msg = { body: { filename: 'some123isin' } };
  });

  it('getting files', async () => {
    await getAllFilesInBucket.process.call(emitter, msg, configuration);
    const result = emitter.emit.getCalls();
    expect(result.length).to.eql(103);
  });
});
