const { experiment, test, beforeEach, afterEach } = exports.lab = require('@hapi/lab').script();
const { expect } = require('@hapi/code');
const sandbox = require('sinon').createSandbox();

const { invoiceAccounts, invoiceAccountAddresses } = require('../../../../src/v2/connectors/repository');
const { InvoiceAccount } = require('../../../../src/v2/connectors/bookshelf');
const queries = require('../../../../src/v2/connectors/repository/queries/invoice-accounts');

const repoHelpers = require('../../../../src/v2/connectors/repository/helpers');
const raw = require('../../../../src/v2/connectors/repository/lib/raw');

experiment('v2/connectors/repository/invoice-account', () => {
  let stub, model;

  beforeEach(async () => {
    model = {
      toJSON: sandbox.stub().returns({ invoiceAccountId: 'test-id' })
    };
    stub = {
      fetch: sandbox.stub(),
      where: sandbox.stub().returnsThis(),
      save: sandbox.stub().resolves(model)
    };
    sandbox.stub(InvoiceAccount, 'forge').returns(stub);
    sandbox.stub(InvoiceAccount, 'collection').returns(stub);
    sandbox.stub(invoiceAccountAddresses, 'create').resolves({ invoiceAccountAddressId: 'test-id' });
    sandbox.stub(repoHelpers, 'deleteTestData');
    sandbox.stub(repoHelpers, 'deleteOne');
    sandbox.stub(raw, 'singleRow');
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('.findOne', () => {
    let result;
    const invoiceAccountId = 'test-id';

    experiment('when a model is found', () => {
      beforeEach(async () => {
        stub.fetch.resolves(model);
        result = await invoiceAccounts.findOne(invoiceAccountId);
      });

      test('.forge() is called on the model with correct ID', async () => {
        expect(InvoiceAccount.forge.calledWith({
          invoice_account_id: invoiceAccountId
        }));
      });

      test('.fetch() is called on the model to get related models', async () => {
        const { withRelated } = stub.fetch.lastCall.args[0];
        expect(withRelated).to.include([
          'company',
          'invoiceAccountAddresses',
          'invoiceAccountAddresses.address'
        ]);
      });

      test('.fetch() is called with "require" option set to false', async () => {
        const { require } = stub.fetch.lastCall.args[0];
        expect(require).to.be.false();
      });

      test('.toJSON() is called on the returned model', async () => {
        expect(model.toJSON.called).to.be.true();
        expect(result).to.equal({ invoiceAccountId });
      });
    });

    experiment('when a model is not found', () => {
      beforeEach(async () => {
        stub.fetch.resolves(null);
        result = await invoiceAccounts.findOne(invoiceAccountId);
      });

      test('null is returned', async () => {
        expect(result).to.equal(null);
      });
    });
  });

  experiment('.findWithCurrentAddress', () => {
    let result;
    const invoiceAccountIds = ['id-1', 'id-2'];

    experiment('when model(s) are found', () => {
      beforeEach(async () => {
        model.toJSON.returns([{
          invoiceAccountId: 'id-1'
        }, {
          invoiceAccountId: 'id-2'
        }]);
        stub.fetch.resolves(model);
        result = await invoiceAccounts.findWithCurrentAddress(invoiceAccountIds);
      });

      test('.collection() is called on the model with correct IDs', async () => {
        expect(InvoiceAccount.collection.called).to.be.true();
      });

      test('.where() called on the model with correct filter', async () => {
        const [field, operator, values] = stub.where.lastCall.args;
        expect(field).to.equal('invoice_account_id');
        expect(operator).to.equal('in');
        expect(values).to.equal(invoiceAccountIds);
      });

      test('.fetch() called with correct related models', async () => {
        const { withRelated } = stub.fetch.lastCall.args[0];
        expect(withRelated).to.include('company');
        expect(withRelated[1].invoiceAccountAddresses).to.be.a.function();
        expect(withRelated).to.include('invoiceAccountAddresses.address');
      });

      test('.invoiceAccountAddresses selected are current - when end date is null', async () => {
        const qbStub = {
          where: sandbox.stub()
        };
        const { invoiceAccountAddresses } = stub.fetch.lastCall.args[0].withRelated[1];
        invoiceAccountAddresses(qbStub);
        expect(qbStub.where.calledWith(
          'end_date', null
        )).to.be.true();
      });

      test('.toJSON() is called on the collection', async () => {
        expect(model.toJSON.called).to.be.true();
      });
      test('resolves with an array of data', async () => {
        expect(result).to.be.an.array();
      });
    });
  });

  experiment('.create', () => {
    let invoiceAccount, result;

    beforeEach(async () => {
      sandbox.stub(repoHelpers, 'create').returns('create-response');

      invoiceAccount = { companyId: 'test-company-id', invoiceAccountNumber: 'A12345678A', startDate: '2020-04-01' };
      result = await invoiceAccounts.create(invoiceAccount);
    });

    test('uses the repository helpers create function', async () => {
      const [model, data] = repoHelpers.create.lastCall.args;

      expect(model).to.equal(InvoiceAccount);
      expect(data).to.equal(invoiceAccount);
    });

    test('returns the data from the helper', async () => {
      expect(result).to.equal('create-response');
    });
  });

  experiment('.deleteOne', () => {
    test('uses the repository helpers deleteOne function', async () => {
      await invoiceAccounts.deleteOne('test-invoice-account-id');

      const [model, idKey, id] = repoHelpers.deleteOne.lastCall.args;
      expect(model).to.equal(InvoiceAccount);
      expect(idKey).to.equal('invoiceAccountId');
      expect(id).to.equal('test-invoice-account-id');
    });
  });

  experiment('.deleteTestData', () => {
    test('is deleted using the helpers', async () => {
      await invoiceAccounts.deleteTestData();

      const [model] = repoHelpers.deleteTestData.lastCall.args;
      expect(model).to.equal(InvoiceAccount);
    });
  });

  experiment('.findOneByGreatestAccountNumber', () => {
    beforeEach(async () => {
      await invoiceAccounts.findOneByGreatestAccountNumber('A');
    });

    test('calls raw.singleRow with the correct query and params', async () => {
      const [query, params] = raw.singleRow.lastCall.args;
      expect(query).to.equal(queries.findOneByGreatestAccountNumber);
      expect(params).to.equal({
        query: 'A%'
      });
    });
  });
});
