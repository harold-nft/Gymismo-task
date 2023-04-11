/******************************************************************************
* Copyright (C) 2022 Gymismo Holdings Pty Ltd. All Rights Reserved.
********************************************************************************/

// Model Import
const QuestionsModel = require("../models").questions;
const QuestionOptionModel = require("../models").question_options;
const QuestionTypeModel = require("../models").question_types;
const UserQuestionAnswerModel = require("../models").user_question_answer;

// Import Common files
const i18n = require("i18n");
const validationMessage = require("../common/validationMessage");
const commonController = require("./common");
let sequelize = require("sequelize");
const logger = require("../common/logger");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Model Relationships
QuestionOptionModel.belongsTo(QuestionsModel);
QuestionsModel.hasMany(QuestionOptionModel);

QuestionsModel.belongsTo(QuestionTypeModel);
QuestionTypeModel.hasMany(QuestionsModel);

module.exports = {

  /*
  * Create new record
  * function is used to create new record
  */
  async add(req, res) {
    try {
      await logger.addInfoLog(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Error(errors.errors[0].msg);
      } else {
        let reqName = req.body.name.trim();
        if (req.body.questionTypeId == null || req.body.questionTypeId == "") {
          throw Error(i18n.__(validationMessage.questionOptionModule.invalidQuestionType));
        } else if (reqName == null || reqName == "") {
          throw Error(i18n.__(validationMessage.commonMessage.nameRequired));
        } else {
          let isNameExists = await commonController.isValidModuleData(req, res, QuestionsModel, { name: sequelize.where(sequelize.fn("LOWER", sequelize.col("name")), "LIKE", "" + reqName.toLowerCase() + "") });
          if (isNameExists) {
            throw Error(i18n.__(validationMessage.commonMessage.nameAlreadyUse));
          } else {
            let saveObject = {
              name: reqName,
              questionTypeId: req.body.questionTypeId,
              profileDisplayName: req.body.profileDisplayName,
              type: req.body.type
            };
            await QuestionsModel.create(saveObject).then(async (questionsModelData) => {
              res.status(201).send({
                status: "1",
                message: i18n.__(validationMessage.questionModule.questionSuccess),
                data: questionsModelData
              });
            }).catch((error) => {
              if (error instanceof sequelize.ForeignKeyConstraintError) {
                throw Error(i18n.__(validationMessage.questionOptionModule.invalidQuestionType));
              } else {
                throw Error(i18n.__(error.message));
              }
            });
          }
        }
      }
    } catch (error) {
      await logger.addErrorLog(req, error);
      res.status(400).send({
        status: "0",
        message: error.message,
        data: {}
      });
    }
  },

  /*
  * Get list of all records
  */
  async list(req, res) {
    try {
      await logger.addInfoLog(req);
      let search = req.body.keyword || "";
      let page = req.body.pageIndex || 1;
      let limit = validationMessage.commonMessage.recordLimit;
      let searchData = [page, limit];
      let type = "adminQuestionList";
      let where = {
        deleted: false,
        activated: true,
        name: sequelize.where(sequelize.fn("LOWER", sequelize.col("questions.name")), "LIKE", "%" + search.toLowerCase() + "%")
      };
      let questionData = await commonController.getAllQuestionAndOptions(req, res, searchData, type, QuestionsModel, QuestionOptionModel, QuestionTypeModel, where);
      if (questionData) {
        res.status(200).send({
          status: "1",
          message: i18n.__(validationMessage.questionModule.questionListFound),
          totalRecord: questionData[1],
          data: questionData[0]
        });
      } else {
        throw Error(i18n.__(validationMessage.questionModule.questionListNotFound));
      }
    } catch (error) {
      await logger.addErrorLog(req, error);
      res.status(400).send({
        status: "0",
        message: error.message,
        totalRecord: 0,
        data: []
      });
    }
  },

  /*
  * Get record by ID
  * function is used to get single record
  */
  async getById(req, res) {
    try {
      await logger.addInfoLog(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Error(errors.errors[0].msg);
      } else {
        await QuestionsModel.findByPk(req.body.id, {
          attributes: ["id", "name", ["activated", "status"], "createdAt", "updatedAt", "questionTypeId"],
          include: [
            {
              model: QuestionOptionModel,
              attributes: ["id", "name"],
            }
          ],
        }).then(async (questionsModelData) => {
          if (questionsModelData) {
            res.status(200).send({
              status: "1",
              message: i18n.__(validationMessage.questionModule.questionDetailFound),
              data: questionsModelData
            });
          } else {
            throw Error(i18n.__(validationMessage.questionModule.questionNotFound));
          }
        }).catch((error) => {
          throw Error(i18n.__(error.message));
        });
      }
    } catch (error) {
      await logger.addErrorLog(req, error);
      res.status(400).send({
        status: "0",
        message: error.message,
        data: {}
      });
    }
  },

  /*
  * Update record 
  * function is used to update record
  */
  async update(req, res) {
    try {
      await logger.addInfoLog(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Error(errors.errors[0].msg);
      } else {
        let questionId = req.body.id;
        await QuestionsModel.findOne({
          where: {
            id: questionId
          }
        }).then(async (question) => {
          if (!question) {
            throw Error(i18n.__(validationMessage.questionModule.questionNotFound));
          } else {
            let reqName = req.body.name.trim();
            let isNameExists = await commonController.isValidModuleData(req, res, QuestionsModel, { name: sequelize.where(sequelize.fn("LOWER", sequelize.col("name")), "LIKE", "" + reqName.toLowerCase() + ""), id: { [Op.ne]: req.body.id } });
            if (isNameExists) {
              throw Error(i18n.__(validationMessage.commonMessage.nameAlreadyUse));
            } else {
              let updateObject = {
                name: reqName || question.name,
                profileDisplayName: req.body.profileDisplayName,
              };
              if (question.questionTypeId != req.body.questionTypeId) {
                await QuestionOptionModel.findAndCountAll({
                  where: {
                    questionId: req.body.id
                  }
                }).then(async (options) => {
                  if (options.count > 0) {
                    throw Error(i18n.__(validationMessage.questionModule.optionsAddedToQuestion));
                  } else {
                    updateObject = {
                      name: reqName || question.name,
                      questionTypeId: req.body.questionTypeId || question.questionTypeId,
                      profileDisplayName: req.body.profileDisplayName
                    };
                  }
                }).catch((error) => {
                  throw Error(i18n.__(error.message));
                });
              }

              await question.update(updateObject).then(async (updateData) => {
                if (!updateData) {
                  throw Error(i18n.__(validationMessage.questionModule.questionUpdatedFail));
                } else {
                  res.status(201).send({
                    status: "1",
                    message: i18n.__(validationMessage.questionModule.questionUpdatedSuccess),
                    data: updateData
                  });
                }
              }).catch((error) => {
                if (error instanceof sequelize.ForeignKeyConstraintError) {
                  throw Error(i18n.__(validationMessage.questionOptionModule.invalidQuestionType));
                } else {
                  throw Error(i18n.__(error.message));
                }
              });
            }
          }
        }).catch((error) => {
          throw Error(i18n.__(error.message));
        });

      }
    } catch (error) {
      await logger.addErrorLog(req, error);
      res.status(400).send({
        status: "0",
        message: error.message
      });
    }
  },

  /*
  * Get all question type list
  */
  async getAllQuestionType(req, res) {
    try {
      await logger.addInfoLog(req);
      await QuestionTypeModel.findAndCountAll({
        attributes: ["id", "name", "type"],
        where: {
          activated: true
        }
      }).then(async (typeList) => {
        if (typeList.count) {
          res.status(200).send({
            status: "1",
            message: i18n.__(validationMessage.questionModule.questionTypeListFoundSuccess),
            data: typeList.rows
          });
        } else {
          throw Error(i18n.__(validationMessage.questionModule.questionTypeListFoundFail));
        }
      }).catch((error) => {
        throw Error(i18n.__(error.message));
      });
    } catch (error) {
      await logger.addErrorLog(req, error);
      return res.status(404).send({
        status: "0",
        message: i18n.__(validationMessage.questionModule.questionTypeListFoundFail),
        totalRecord: 0,
        data: []
      });
    }
  },

  /*
  * Change status 
  * function is used to change status
  * If value selected then can't change status.
  */
  async status(req, res) {
    try {
      await logger.addInfoLog(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Error(errors.errors[0].msg);
      } else {
        let id = req.body.id;
        // Set foreign key Id to check in store table.
        let whereCondition = {
          questionId: id
        };
        // Main model , Store table 
        let models = [QuestionsModel, UserQuestionAnswerModel];
        // Common function to change 
        let changeStatus = await commonController.adminChangeStatus(req, res, models, whereCondition);
        if (changeStatus) {
          res.status(200).send({
            status: "1",
            message: i18n.__(validationMessage.commonMessage.recordUpdatedSuccessfully),
            data: changeStatus
          });
        } else {
          throw Error(i18n.__(validationMessage.commonMessage.recordUpdatedFail));
        }


      }
    } catch (error) {
      await logger.addErrorLog(req, error);
      res.status(400).send({
        status: "0",
        message: error.message,
        data: {}
      });
    }
  },

  /*
  * Change delete flag 
  * function is used to change delete flag
  * If value selected then can't change delete flag.
  */
  async deleted(req, res) {
    try {
      await logger.addInfoLog(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw Error(errors.errors[0].msg);
      } else {
        let id = req.body.id;
        let whereCondition = {
          questionId: id
        };
        let models = [QuestionsModel, UserQuestionAnswerModel];
        let deleteRecord = await commonController.adminDeletedFlag(req, res, models, whereCondition);
        if (deleteRecord) {
          res.status(200).send({
            status: "1",
            message: i18n.__(validationMessage.commonMessage.recordUpdatedSuccessfully),
            data: deleteRecord
          });
        } else {
          throw Error(i18n.__(validationMessage.commonMessage.recordUpdatedFail));
        }
      }
    } catch (error) {
      await logger.addErrorLog(req, error);
      res.status(400).send({
        status: "0",
        message: error.message,
        data: {}
      });
    }
  },

};
