/******************************************************************************
* Copyright (C) 2022 Gymismo Holdings Pty Ltd. All Rights Reserved.
********************************************************************************/

"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QuestionTypes extends Model {
    static associate(models) {
    }
  }
  QuestionTypes.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      activated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
    },
    {
      sequelize,
      modelName: "question_types",
    }
  );
  return QuestionTypes;

};