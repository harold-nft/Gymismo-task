/******************************************************************************
* Copyright (C) 2022 Gymismo Holdings Pty Ltd. All Rights Reserved.
********************************************************************************/

"use strict";

const { Model } = require("sequelize");

const UserMessage = {
  InvalidUser: "Invalid first or last name"
};

module.exports = (sequelize, DataTypes) => {
  class UserQuestionAnswer extends Model {
    static associate(models) {
    }
  }
  UserQuestionAnswer.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      },
      questionId: {
        type: DataTypes.INTEGER,
        references: {
          model: "questions",
          key: "id"
        }
      },
      questionOptionId: {
        type: DataTypes.INTEGER,
        references: {
          model: "question_options",
          key: "id"
        }
      },
      programStructureOptionId: {
        type: DataTypes.INTEGER,
      },
      answer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      complexityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "complexity_levels",
          key: "id"
        },
      },
    },
    {
      sequelize,
      modelName: "user_question_answer",
    }
  );
  return UserQuestionAnswer;
};
