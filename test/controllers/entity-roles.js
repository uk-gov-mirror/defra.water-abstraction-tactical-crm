'use strict';

const server = require('../../index');
const { version } = require('../../config');
const uuid = require('uuid/v4');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const DB = require('../../src/lib/connectors/db');

const { expect } = require('code');

const createRequest = (entityId, method = 'GET') => {
  const url = `/crm/${version}/entity/${entityId}/roles`;

  return {
    method,
    url,
    headers: { Authorization: process.env.JWT_TOKEN }
  };
};

const deleteEntityRoles = async () => {
  const query = `
    delete
    from crm.entity_roles r
    where r.permissions->>'unitTest'::text = 'true'`;

  await DB.query(query);
};

lab.experiment('entity-roles controller', () => {
  lab.afterEach(deleteEntityRoles);

  lab.test('The API should create an entity role', async () => {
    const entityId = uuid();
    const request = createRequest(entityId, 'POST');
    request.payload = {
      entity_id: entityId,
      role: 'primary_user',
      permissions: { unitTest: true }
    };

    const res = await server.inject(request);
    expect(res.statusCode).to.equal(201);

    const payload = JSON.parse(res.payload);
    expect(payload.error).to.equal(null);
    expect(payload.data.entity_role_id).to.be.a.string();
    expect(payload.data.entity_id).to.equal(entityId);
    expect(payload.data.permissions).to.equal({ unitTest: true });
  });
});
