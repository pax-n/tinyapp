const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

//generates a six character string containing letters or numbers
const generateRandomString = function() {
  let newURL = Math.random().toString(36).substr(2,6);
  return newURL;
};

//function that loops through the database and checks if a registered email is present
const getUserByEmail = function(email, database) {
  //loops through all the existing userIDs in the database
  for (let userID in database) {
    //if entered email exist to email in database, return the matching database
    if (email === database[userID].email) {
      return database[userID];
    }
  }
  return undefined;
};

//function that matches encrypted password with user password
const authenticateUser = (email, password, users) => {
  // retrieve the user with that email
  const user = getUserByEmail(email, users);
  console.log("FORM PASSWORD:", password, "DB PASSWORD:", user.password);
  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};


module.exports = { generateRandomString, getUserByEmail, authenticateUser };