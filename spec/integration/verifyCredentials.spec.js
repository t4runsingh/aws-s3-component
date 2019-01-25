/* eslint-disable global-require */

const fs = require('fs');
const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;

const verifyCredentials = require('../../verifyCredentials');

describe('Insert file', function () {
  this.timeout(50000);
  let configuration;
  let cb;

  before(async () => {
    if (fs.existsSync('.env')) {
      require('dotenv').config();
    }

    configuration = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      accessKeySecret: process.env.ACCESS_KEY_SECRET,
    };
  });

  beforeEach(() => {
    cb = sinon.spy();
  });

  it('validating credentials - correct', async () => {
    const result = await verifyCredentials(configuration, cb);
    expect(result).to.eql({ verified: true });
  });

  it('validating credentials - incorrect', async () => {
    configuration.accessKeyId = 'wrong';

    const result = await verifyCredentials(configuration, cb);
    expect(result).to.eql({ verified: false });
  });
});
