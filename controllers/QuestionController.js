/******************************************************************************
* Copyright (C) 2022 Gymismo Holdings Pty Ltd. All Rights Reserved.
********************************************************************************/

// Model Import
const QuestionsModel = require("../models").questions;
const QuestionOptionModel = require("../models").question_options;
const QuestionTypeModel = require("../models").question_types;
const UserQuestionAnswerModel = require("../models").user_question_answer;

// Import Common files
const commonController = require("./common");
let sequelize = require("sequelize");
const logger = require("../common/logger");
const { Op } = require("sequelize");

// Model Relationships
QuestionOptionModel.belongsTo(QuestionsModel);
QuestionsModel.hasMany(QuestionOptionModel);

QuestionsModel.belongsTo(QuestionTypeModel);
QuestionTypeModel.hasMany(QuestionsModel);

// Helper function to check if name already exists in Questions
async function checkIfNameExists(req, res, reqName, whereData) {
  let isNameExists = await commonController.isValidModuleData(
    req,
    res,
    QuestionsModel,
    whereData
  );

  if (isNameExists) {
    throw Error(`Input Error: Name "${reqName}" already exists`);
  }
}

/**
 * Create a new record.
 *
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If invalid input type, or error occurred while creating new question.
 * @returns {Promise<void>} - Promise object representing the completion of the function.
 */
async function add(req, res) {
  try {
    await logger.addInfoLog(req);
    commonController.validateReq(req);

    let reqName = commonController.safeGetFieldFromReqBody(req, 'name').trim();
    if (req.body.questionTypeId == null || req.body.questionTypeId == "") {
      throw Error("Input Error: questionTypeId is invalid");
    }
    
    checkIfNameExists(
      req,
      res,
      reqName,
      { name: sequelize.where(sequelize.fn("LOWER", sequelize.col("name")), "LIKE", "" + reqName.toLowerCase() + "") }
    );

    let saveObject = {
      name: reqName,
      questionTypeId: req.body.questionTypeId,
      profileDisplayName: req.body.profileDisplayName,
      type: req.body.type
    };
    
    let questionsModelData = await QuestionsModel.create(saveObject);
    if (questionsModelData) {
      commonController.sendResponse(res, 201, "Success", questionsModelData);
    } else {
      throw Error("Error occurred while creating new question");
    }
  
  } catch (error) {
    await logger.addErrorLog(req, error);
    commonController.sendResponse(res, 400, i18n.__(error.message), {});
  }
};


/**
 * Get a list of all records.
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If no records are found for the given keyword and page index.
 * @returns {Promise<void>} - Promise object representing the completion of the function.
 */
async function list(req, res) {
  try {
    await logger.addInfoLog(req);
    let search = commonController.safeGetFieldFromReqBody(req, 'keyword');
    let page = commonController.safeGetFieldFromReqBody(req, 'pageIndex');
    let limit = "limit";
    let searchData = [page, limit];
    let type = "adminQuestionList";
    let where = {
      deleted: false,
      activated: true,
      name: sequelize.where(sequelize.fn("LOWER", sequelize.col("questions.name")), "LIKE", "%" + search.toLowerCase() + "%")
    };

    let questionData = await commonController.getAllQuestionAndOptions(
      req,
      res,
      searchData,
      type,
      QuestionsModel,
      QuestionOptionModel,
      QuestionTypeModel,
      where
    );

    if (questionData) {
      commonController.sendResponse(res, 200, "Found", questionData[0], questionData[1]);
    } else {
      throw Error(`No records found for the keyword '${search}' and pageIndex ${page}`);
    }
    
  } catch (error) {
    await logger.addErrorLog(req, error);
    commonController.sendResponse(res, 400, i18n.__(error.message), [], 0);
  }
};


/**
 * Retrieves a single record by its ID.
 * @async
 * @function getById
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If the record is not found.
 * @returns {Promise<void>} - Promise object representing the completion of the function.
 */
async function getById(req, res) {
  try {
    await logger.addInfoLog(req);
    commonController.validateReq(req)
    let id = commonController.safeGetFieldFromReqBody(req, 'id');

    let questionsModelData = await QuestionsModel.findByPk(
      id,
      {
        attributes: ["id", "name", ["activated", "status"], "createdAt", "updatedAt", "questionTypeId"],
        include: [
          {
            model: QuestionOptionModel,
            attributes: ["id", "name"],
          }
        ],
      }
    );
    
    if (questionsModelData) {
      commonController.sendResponse(res, 200, "Found", questionsModelData);
    } else {
      throw Error(`Question with id ${id} not found`);
    }
    
  } catch (error) {
    await logger.addErrorLog(req, error);
    commonController.sendResponse(res, 400, i18n.__(error.message), {});
  }
};

// Helper function to create an updateObject
async function createUpdateObj(question, req) {
  let updateObject = {
    name: question.name,
    profileDisplayName: req.body.profileDisplayName,
  };

  if (question.questionTypeId != req.body.questionTypeId) {
    let options = await QuestionOptionModel.findAndCountAll({
      where: {
        questionId: req.body.id
      }
    });

    if (options.count > 0) {
      throw Error("Error: One or more possible question options exist");
    } else {
      updateObject.questionTypeId = question.questionTypeId;
    }
  }

  return updateObject;
}


/**
 * Update a record.
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If the record with given ID is not found or an error occurs during update.
 * @returns {Promise<void>} - Promise object representing the completion of the function.
 */
async function update(req, res) {
  try {
    await logger.addInfoLog(req);
    commonController.validateReq(req);
    let questionId = commonController.safeGetFieldFromReqBody(req, 'id');
    
    const question = await QuestionsModel.findOne({
      where: {
        id: questionId
      }
    });

    if (!question) {
      throw Error(`Question with id ${questionId} not found`);
    }

    let reqName = commonController.safeGetFieldFromReqBody(req, 'name').trim();
    checkIfNameExists(
      req,
      res,
      reqName,
      {
        name: sequelize.where(sequelize.fn("LOWER", sequelize.col("name")), "LIKE", "" + reqName.toLowerCase() + ""),
        id: { [Op.ne]: req.body.id }
      }
    )

    let updateObject = await createUpdateObj(question, req);
    let updateData = await question.update(updateObject);
    if (updateData) {
      commonController.sendResponse(res, 201, "Success", updateData);
    } else {
      throw Error("Update failed");
    }
    
  } catch (error) {
    await logger.addErrorLog(req, error);
    commonController.sendResponse(res, 400, i18n.__(error.message));
  }
};


/**
 * Retrieves all activated question types.
 *
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If no types could be found
 * @returns {Promise<void>} - Promise object representing the completion of the function.
 */
async function getAllQuestionType(req, res) {
  try {
    await logger.addInfoLog(req);
    let typeList = await QuestionTypeModel.findAndCountAll({
      attributes: ["id", "name", "type"],
      where: {
        activated: true
      }
    });
    
    if (typeList.count) {
      commonController.sendResponse(res, 200, "Success", typeList.rows);
    } else {
      throw Error("No types could be found");
    }
  } catch (error) {
    await logger.addErrorLog(req, error);
    return commonController.sendResponse(res, 404, i18n.__(error.message), [], 0);
  }
};


/**
 * Changes the status of a question.
 * @async
 * @function status
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If the change status operation fails.
 * @returns {Promise<void>} - Promise object representing the completion of the function.
 */
async function status(req, res) {
  try {
    await logger.addInfoLog(req);
    commonController.validateReq(req);
    let id = commonController.safeGetFieldFromReqBody(req, 'id');
    // Set foreign key Id to check in store table.
    let whereCondition = {
      questionId: id
    };
    // Main model , Store table 
    let models = [QuestionsModel, UserQuestionAnswerModel];
    // Common function to change 
    let changeStatus = await commonController.adminChangeStatus(req, res, models, whereCondition);
    if (changeStatus) {
      commonController.sendResponse(res, 200, "Success", changeStatus);      
    } else {
      throw Error("Change Status failed");
    }
    
  } catch (error) {
    await logger.addErrorLog(req, error);
    commonController.sendResponse(res, 400, i18n.__(error.message), {});
  }
};


/**
 * Changes the delete flag of a question and its associated answers.
 *
 * @async
 * @function deleted
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} - If the delete operation fails.
 * @returns {Promise<void>} - Promise object representing the completion of the function.
 */
async function deleted(req, res) {
  try {
    await logger.addInfoLog(req);
    commonController.validateReq(req);

    let id = commonController.safeGetFieldFromReqBody(req, 'id');
    let whereCondition = {
      questionId: id
    };
    let models = [QuestionsModel, UserQuestionAnswerModel];

    let deleteRecord = await commonController.adminDeletedFlag(req, res, models, whereCondition);
    if (deleteRecord) {
      commonController.sendResponse(res, 200, "Success", deleteRecord);
    } else {
      throw Error("Delete failed");
    }
    
  } catch (error) {
    await logger.addErrorLog(req, error);
    commonController.sendResponse(res, 400, i18n.__(error.message), {});
  }
};

module.exports = {
  checkIfNameExists,
  add,
  list,
  getById,
  update,
  getAllQuestionType,
  status,
  deleted,
};
