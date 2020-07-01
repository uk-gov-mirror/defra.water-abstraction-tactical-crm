const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));

const DATE = Joi.date().format('YYYY-MM-DD');
const GUID = Joi.string().uuid().required();
const TEST_FLAG = Joi.boolean().optional().default(false);
const DEFAULT_FLAG = Joi.boolean().optional().default(false);
const START_DATE = DATE.required();
const END_DATE = DATE.min(Joi.ref('startDate')).optional().default(null).allow(null);
const EMAIL = Joi.string().email().optional().allow(null);
const REGIME = Joi.string().required().valid('water');
const DOC_TYPE = Joi.string().required().valid('abstraction_licence');
const DOC_STATUS = Joi.string().required().valid('current', 'draft', 'superseded');
const VERSION = Joi.number().integer().required().min(0);
const REQUIRED_STRING = Joi.string().trim().required();
const INVOICE_ACCOUNT_NUMBER = Joi.string().regex(/^[ABENSTWY][0-9]{8}A$/);
const REGION_CODE = Joi.string().regex(/^[ABENSTWY]$/);
const DATA_SOURCE = Joi.string().valid('wrls', 'nald').default('wrls');
const UPRN = Joi.number().integer().min(0).default(null).allow(null);
const OPTIONAL_STRING = Joi.string().allow('', null).trim().empty('').default(null);
const CONTACT_TYPE = Joi.string().required().valid('person', 'department');

exports.DATE = DATE;
exports.GUID = GUID;
exports.TEST_FLAG = TEST_FLAG;
exports.DEFAULT_FLAG = DEFAULT_FLAG;
exports.START_DATE = START_DATE;
exports.END_DATE = END_DATE;
exports.EMAIL = EMAIL;
exports.REGIME = REGIME;
exports.DOC_TYPE = DOC_TYPE;
exports.DOC_STATUS = DOC_STATUS;
exports.VERSION = VERSION;
exports.REQUIRED_STRING = REQUIRED_STRING;
exports.INVOICE_ACCOUNT_NUMBER = INVOICE_ACCOUNT_NUMBER;
exports.REGION_CODE = REGION_CODE;
exports.DATA_SOURCE = DATA_SOURCE;
exports.UPRN = UPRN;
exports.OPTIONAL_STRING = OPTIONAL_STRING;
exports.CONTACT_TYPE = CONTACT_TYPE;
