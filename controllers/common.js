const { validationResult } = require("express-validator");

/**
 * Validates a request against the validation rules set by express-validator.
 * @param {Object} req - The request object to be validated.
 * @returns {boolean} - Returns true if the request is valid.
 * @throws {Error} - Throws an error if the request is invalid.
 */
function validateReq(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => e.msg);
    throw Error(errorMessages);
  }
  return true;
};


/**
 * Safely get a field from the request body.
 * @param {Object} req - The request object.
 * @param {string} field - The name of the field to get from the request body.
 * @throws {Error} If the request body does not contain the specified field.
 * @returns {*} The value of the specified field in the request body.
 */
function safeGetFieldFromReqBody(req, field) {
  const res = req.body[field];
  if (!res) {
    throw Error(`Error: request body does not contain field '${field}'`);
  };
  return res;
};


/**
 * Send response with specified status, message, data and total record count.
 *
 * @param {Object} res - The response object.
 * @param {number} status - HTTP status code.
 * @param {string} message - Response message.
 * @param {Object} [data] - Response data object. Optional.
 * @param {number} [totalRecord] - Total number of records. Optional.
 */
function sendResponse(res, status, message, data, totalRecord) {
  const resObj = {
    status: status === 200 || status === 201 ? "1" : "0",
    message: message,
  }

  if (typeof data !== 'undefined') {
    resObj.data = data;
  }

  if (typeof totalRecord !== 'undefined') {
    resObj.totalRecord = totalRecord;
  }
  
  res.status(status).send(resObj);
}


/**
 * Check if module data is valid by checking if the data exists in the database.
 * @async
 * @function isValidModuleData
 * @param {Object} ModuleModel - Sequelize model for the module table.
 * @param {Object} whereData - Object containing the data to use for the WHERE clause in the Sequelize query.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean value indicating if the module data is valid or not.
 */
async function isValidModuleData(ModuleModel, whereData) {
  try {
    let isValidData = await ModuleModel.findOne({
      attributes: ["createdAt"],
      where: whereData,
    });
    if (isValidData) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

async function getAllQuestionAndOptions(
  req,
  res,
  searchData,
  type,
  QuestionsModel,
  QuestionOptionsModel,
  QuestionTypeModel,
  whereCondition,
  complexityType
) {
  // Details omitted for brevity
  return [];
};

/*
  * Function to change status for all admin module
*/
 async function adminChangeStatus(req, res, modules, whereCondition) {
  // Details omitted for brevity
};

async function adminDeletedFlag(req, res, modules, whereCondition) {
  // Details omitted for brevity
};

module.exports = {
  validateReq,
  safeGetFieldFromReqBody,
  sendResponse,
  isValidModuleData,
  getAllQuestionAndOptions,
  adminChangeStatus,
  adminDeletedFlag
};