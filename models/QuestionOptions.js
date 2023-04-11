/******************************************************************************
* Copyright (C) 2022 Gymismo Holdings Pty Ltd. All Rights Reserved.
********************************************************************************/

"use strict";

const { Model } = require("sequelize");


module.exports = (sequelize, DataTypes) => {
    class QuestionOptions extends Model {
        static associate(models) {
        }
    }
    QuestionOptions.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER.UNSIGNED,
            },
            questionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "questions",
                    key: "id"
                }
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING,
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
            rank: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
        },
        {
            sequelize,
            modelName: "question_options",
        },
    );
    return QuestionOptions;
};
