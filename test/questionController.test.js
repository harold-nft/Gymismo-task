// Note: pseudocode (test suite not runnable)

const assert = require('assert');
const sinon = require('sinon');

const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const qc = require('../controllers/QuestionController');

beforeEach(async () => {
  const testQuestion = {
    id: 1,
    name: 'Test Question',
    activated: true,
    deleted: false,
    questionTypeId: 1,
    programStructureDefinitionId: 1,
    profileDisplayName: 'Test Profile Display Name',
    rank: 0,
    type: 'Test Type'
  };
  await db.QuestionsModel.create(testQuestion);
});

afterEach(async () => {
  await db.QuestionsModel.destroy({ where: { id: 1 } });
});

describe('checkIfNameExists', function() {
  beforeEach(() => {
    req = {};
    res = {};
    whereData = {
      name: 'Test Name'
    };
  });

  it('should not throw an error if name does not exist', async function() {
    await qc.checkIfNameExists(req, res, 'New name', whereData);
  });
  it('should throw an error if the name already exists', async function() {
    try {
      await qc.checkIfNameExists(req, res, 'Test Name', whereData);
      expect.fail('Expected an error to be thrown');
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.strictEqual(error.message, 'Input Error: Name "Test Name" already exists');
    }
  });
});


describe('add', function() {
  it('should add a new record', async function() {
    const req = {
      body: {
        questionTypeId: 2,
        name: "New name"
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.add(req, res);
    assert(res.sendResponse.calledWith(200, 'Success', ["Test Type"]));
  });

  it('should return an error if the questionTypeId is invalid', async function() {
    const req = {
      body: {
        questionTypeId: "",
        name: "New name"
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.add(req, res);
    assert(res.sendResponse.calledWith(400, 'Input Error: questionTypeId is invalid', {}));
  });

  it('should return an error if name of new record already exists', async function() {
    const req = {
      body: {
        questionTypeId: 2,
        name: "Test Question"
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.add(req, res);
    assert(res.sendResponse.calledWith(400, 'Input Error: Name "Test Question" already exists', {}));
  });
});


describe('list', function() {
  it('should return a list of all activated records', async function() {
    const req = {
      body: {
        keyword: 'Test Keyword',
        pageIndex: 'Test PageIndex'
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.list(req, res);

    assert(res.sendResponse.calledWith(200, 'Found', [{ id: 1, activated: true, otherFields: ""}], 1));
  });

  it('should return an error if no records are found', async function() {
    const req = {
      body: {
        keyword: "Bad Keyword",
        pageIndex: "Bad PageIndex"
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.list(req, res);
    assert(res.sendResponse.calledWith(400, 'No records found for the keyword "Bad Keyword" and pageIndex "Bad PageIndex"', [], 0));
  });
});


describe('getById', function() {
  it('should return a question with the correct id', async function() {
    const req = {
      body: {
        id: 1
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.getById(req, res);
    assert(res.sendResponse.calledWith(200, 'Found', { id: 1, otherFields: ""}));
  });

  it('should return an error if question id not found', async function() {
    const req = {
      body: {
        id: 1
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.getById(req, res);
    assert(res.sendResponse.calledWith(400, 'Question with id 2 not found'));
  });
});


describe('update', function() {
  it('should update a question', async function() {
    const req = {
      body: {
        id: 1,
        name: "Updated name"
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.update(req, res);
    assert(res.sendResponse.calledWith(200, 'Success', { id: 1, name: "Updated name", otherFields: "..." }));
  });

  it('should return an error if question id not found', async function() {
    const req = {
      body: {
        id: 2
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.update(req, res);
    assert(res.sendResponse.calledWith(400, 'Question with id 2 not found'));
  });
});


describe('getAllQuestionType', function() {
  it('should return all question types for an existing question', async function() {
    const req = {
      body: {
        id: 1
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.getAllQuestionType(req, res);
    assert(res.sendResponse.calledWith(200, 'Success', ["Test Type"]));
  });

  it('should return an error if no question types found', async function() {
    await db.QuestionsModel.destroy({ where: { id: 1 } });
    const testQuestion = {
      id: 1,
      name: 'Test Question',
      activated: false,
      deleted: false,
      questionTypeId: 1,
    };
    await db.QuestionsModel.create(testQuestion);
    const req = {
      body: {
        id: 1
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.getAllQuestionType(req, res);
    assert(res.sendResponse.calledWith(400, 'No types could be found', []));
  });
});


describe('status', function() {
  it('should change the status for the specified question', async function() {
    const req = {
      body: {
        id: 1
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.status(req, res);
    assert(res.sendResponse.calledWith(200, 'Success', { id: 1, fieldToBeChanged: "changed" }));
  });

  it('should return an error if the change status operation fails', async function() {
    const req = {
      body: {
        id: 2
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.status(req, res);
    assert(res.sendResponse.calledWith(400, 'Change Status failed', {}));
  });
});

describe('deleted', function() {
  it('should set the deleted flag to true for the specified question', async function() {
    const req = {
      body: {
        id: 1
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.deleted(req, res);
    assert(res.sendResponse.calledWith(200, 'Success', { id: 1, delete: true }));
  });

  it('should return an error if the delete operation fails', async function() {
    const req = {
      body: {
        id: 2
      }
    };
    const res = {
      sendResponse: sinon.spy()
    };

    await qc.deleted(req, res);
    assert(res.sendResponse.calledWith(400, 'Delete failed', {}));
  });
});

