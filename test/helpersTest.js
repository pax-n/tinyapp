const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.isTrue(user.id === expectedUserID);
  });

  it('should return undefined with any email that is not registered in the database', function() {
    const user = getUserByEmail("not-user@example.com", testUsers)
    const expectedUserID = undefined;
    assert.isTrue(user === expectedUserID);
  });

});