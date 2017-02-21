
const chai = require('chai');
const chap = require('chai-as-promised');
const PortRatesModel = require('./PortRatesModel');

chai.use(chap);

const expect = chai.expect;

let rm  = new PortRatesModel();

describe('Port Rates Model', () => {
  it('should be created successfully', () => {
    expect(rm).to.be.an('object');
  });

  it('should be an instance of PortRatesModel', () => {
    expect(rm).to.be.instanceOf(PortRatesModel);
  });

  it('countries should return the correct list of countries', () => {
    expect(rm.countries).to.have.members(['CN', 'HK', 'US']);
  });
});

describe('Rates Model parseData', () => {
  it('should complete successfully', () => {
    expect(rm.parseData([{port: 'ABCDE'}])).to.have.property('AB');
  });

  it('should throw TypeError with incorrect data', () => {
    // let res = rm.parseData("");
    expect(rm.parseData.bind(rm, false)).to.throw(TypeError, /must be an array/);
  });
});
