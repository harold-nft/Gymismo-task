/******************************************************************************
* Copyright (C) 2022 Gymismo Holdings Pty Ltd. All Rights Reserved.
********************************************************************************/

"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Questions extends Model {
        static associate(models) {
        }
    }
    Questions.init(
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
                unique: {
                    args: true,
                }
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
            questionTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "question_types",
                    key: "id"
                },
            },
            programStructureDefinitionId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            profileDisplayName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            rank: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            type: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: "normal",
            },
        },
        {
            sequelize,
            modelName: "questions",
        }
    );
    return Questions;
};
