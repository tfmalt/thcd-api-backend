const chai = require('chai');
const chap = require('chai-as-promised');
const RatesController = require('./RatesController');

chai.use(chap);

const expect = chai.expect;

let rates = new RatesController();

describe('RatesController', () => {
  it('should be created successfully', () => {
    expect(rates).to.be.an('object');
  });

  it('should be an instance of OXRController', () => {
    expect(rates).to.be.instanceOf(RatesController);
  });

  it('should return correct list of countries', () => {
    expect(rates.countries).to.be.an.array;
    expect(rates.countries).to.have.members(['CN', 'HK', 'US']);
  });

  it('should return correct object for distribution', () => {
    let result = rates.distribution('HK');
    expect(result).to.be.an.object;
    expect(result).to.contain.all.keys(['data', 'percentiles', 'average']);
  });
});
