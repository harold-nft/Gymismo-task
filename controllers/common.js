

module.exports = {


    /*
   * Check valid data or not
   */
  async isValidModuleData(req, res, ModuleModel, whereData) {
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
  },


  async getAllQuestionAndOptions(
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
  },

  /*
   * Function to change status for all admin module
   */
  async adminChangeStatus(req, res, modules, whereCondition) {
    // Details omitted for brevity
  },

  async adminDeletedFlag(req, res, modules, whereCondition) {
    // Details omitted for brevity
  },

}