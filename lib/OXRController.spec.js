const chai = require('chai');
const chap = require('chai-as-promised');
const OXRController = require('./OXRController');

chai.use(chap);

const expect = chai.expect;

let cc = new OXRController();

describe('OXR Controller', () => {
  if (
    process.env.OXR_APP_ID === 'undefined' ||
    typeof process.env.OXR_APP_ID !== 'string'
  ) {
    console.error(
      'process.env.OXR_APP_ID not set correctly\n' +
      'You must provide a valid Openexchangerates APP ID for tests to run.\n'
    );
    return;
  }

  it('should be created successfully', () => {
    expect(cc).to.be.an('object');
  });

  it('should be an instance of OXRController', () => {
    expect(cc).to.be.instanceOf(OXRController);
  });

  it('getLatest should return undefined on error', () => {
    return expect(cc.getLatest(cc.url)).to.eventually.be.undefined;
  });

  it('getLatest should return data when given correct api key', () => {
    return expect(cc.getLatest(cc.url, process.env.OXR_APP_ID))
      .to.eventually.contain.all
      .keys(['disclaimer', 'base', 'timestamp', 'rates']);
  });
});
