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

  it('getLatest should return data when given correct api key', () => {
    return expect(cc.getLatest(cc.url, process.env.OXR_APP_ID))
      .to.eventually.contain.all
      .keys(['disclaimer', 'base', 'timestamp', 'rates']);
  });

  it('rate should return exchange rate for valid currency', () => {
    expect(cc.rate('NOK')).to.be.a.float;
  });

  it('rate should return undefined for invalid currency', () => {
    expect(cc.rate('FOO')).to.be.undefined;
  });

  it('exchange should return float with correct amount', () => {
    let amount = parseFloat((100 / cc.rate('NOK')).toFixed(4));
    expect(cc.exchange({currency: 'NOK', amount: 100})).to.equal(amount);
  });

  it('should throw TypeError with invalid input', () => {
    expect(cc.exchange.bind(cc, null)).to.throw(TypeError);
  });
});
