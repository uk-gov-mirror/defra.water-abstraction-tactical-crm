const { experiment, test, beforeEach, afterEach } = exports.lab = require('@hapi/lab').script();
const { expect } = require('@hapi/code');
const sandbox = require('sinon').createSandbox();
const controller = require('../../../../src/v2/modules/documents/controller');
const repos = require('../../../../src/v2/connectors/repository');

experiment('v2/modules/documents/controller', () => {
  beforeEach(async () => {
    sandbox.stub(repos.documents, 'findByDocumentRef').resolves([{
      documentId: 'doc_1'
    }, {
      documentId: 'doc_2'
    }]);
  });

  afterEach(async () => {
    sandbox.restore();
  });

  experiment('getDocuments', () => {
    let request, response;

    beforeEach(async () => {
      request = {
        query: {
          regime: 'water',
          documentType: 'water_abstraction',
          documentRef: '01/115'
        }
      };
      response = await controller.getDocuments(request);
    });

    test('calls repository method with correct arguments', async () => {
      expect(repos.documents.findByDocumentRef.calledWith(
        request.query.regime,
        request.query.documentType,
        request.query.documentRef
      )).to.be.true();
    });

    test('resolves with mapped response', async () => {
      expect(response).to.equal([{
        documentId: 'doc_1'
      }, {
        documentId: 'doc_2'
      }]);
    });
  });
});
