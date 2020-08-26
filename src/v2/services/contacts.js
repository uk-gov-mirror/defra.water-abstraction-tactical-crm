'use strict';

const contactValidator = require('../modules/contacts/validator');
const contactsRepo = require('../connectors/repository/contacts');
const errors = require('../lib/errors');
const { mapValidationErrorDetails } = require('../lib/map-error-response');

const createContact = async contact => {
  const { error, value: validatedContact } = contactValidator.validate(contact);

  if (error) {
    throw new errors.EntityValidationError('Contact not valid', mapValidationErrorDetails(error));
  }

  return contactsRepo.create(validatedContact);
};

const getContact = contactId => contactsRepo.findOne(contactId);

const getContactsByIds = ids => contactsRepo.findManyByIds(ids);

const deleteContact = contactId => contactsRepo.deleteOne(contactId);

exports.createContact = createContact;
exports.getContact = getContact;
exports.getContactsByIds = getContactsByIds;
exports.deleteContact = deleteContact;
