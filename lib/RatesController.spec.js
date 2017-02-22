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

  it('should be an instance of RatesController', () => {
    expect(rates).to.be.instanceOf(RatesController);
  });
});
