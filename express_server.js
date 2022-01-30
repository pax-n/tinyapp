const { generateRandomString, getUserByEmail, authenticateUser } = require('./helpers.js');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const { reset } = require("nodemon");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['76edb64e-dd5c-4e83-ade7-1d7cd9a4bf85', '29cc7359-608b-4d51-a339-eb57d9428869']
}));

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const urlDatabase = {};
const users = {};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//redirects to url index page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//page showing all current URLS (my URLs)
app.get("/urls", (req, res) => {
  const userID = req.session["user"];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

//page for creating a new TinyURL
app.get("/urls/new", (req, res) => {
  const userID = req.session["user"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  //checking if a user is logged in
  if (!user) {
    //user redirected to login if not logged in
    res.redirect("/login");
  } else {
    //redirected to create new url page
    res.render("urls_new", templateVars);
  }
});

//creates a new url on new url page and redirects to new url page
app.post("/urls", (req, res) => {
  //generates a six character string
  const randomKey = generateRandomString();
  const userID = req.session["user"];
  const user = users[userID];
  //assigns new random key to entered longURL and user ID
  urlDatabase[randomKey] = {
    longURL: req.body.longURL,
    userID: user.id
  };
  console.log(user);
  console.log(urlDatabase);
  //if user is logged in
  if (!user) {
    //user redirected to login if not logged in
    res.redirect("/login");
  } else {
    //redirected to their new url page
    res.redirect(`/urls/${randomKey}`);
  }
});

//New tinyURL page for any newly created urls
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user"];
  const user = users[userID];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };
  //checks if user is logged in with existing account before visiting url page
  if (!user) {
    //if user is not logged on they will be told to be login or register
    return res.status(403).send("Please login or register.");
    //logged in users who own this tinyURL will be redirected to the url page
  } else if (urlDatabase[req.params.shortURL].userID === user.id) {
    res.render("urls_show", templateVars);
  } else {
    //users who did not create this url will be given this message.
    return res.status(403).send("You do not have access to this URL with this account.");
  }
});

//clicking a short url will direct you to the website of the long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//delete button on my URLs (index) page that will delete selected tiny url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user"];
  const user = users[userID];
  //if any logged out user somehow manages to get this page, they cannot delete the URL
  if (!user) {
    return res.status(403).send("You do not have permission to do this.");
  } else {
    //deletes the url if user is logged in
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//edit button on my URLs page that will direct to short url page with ability to edit long url
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user"];
  const user = users[userID];
  //if any logged out user somehow manages to get this page, they cannot edit the URL
  if (!user) {
    return res.status(403).send("You do not have permission to do this.");
  } else {
    //redirects to url page if user is logged in
    res.redirect(`/urls/${shortURL}`);
  }
});

//editing the long url on short url page will redirect back to my URLs page with new edit
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user"];
  const user = users[userID];
  //any logged out users that visit the new url page cannot edit the long URL
  if (!user) {
    return res.status(403).send("You do not have permission to do this.");
  } else {
    //newly edited urls will show up and will redirect back to index page
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: user.id
    };
    res.redirect(`/urls`);
  }
});

//register page with two fields for email and password along with submit button
app.get("/register", (req, res) => {
  const userID = req.session["user"];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  //if user is logged in
  if (!user) {
    //if user is not logged in, shows registration page
    res.render("urls_registration", templateVars);
  } else {
    //if user is already logged in, redirects to url page
    res.redirect("/urls");
  }
  
});

//register button will generate new id for entered email and password.
app.post("/register", (req, res) => {
  const userChecker = getUserByEmail(req.body.email, users);
  //checks if email or password input is empty
  if (!req.body.email || !req.body.password) {
    //will return an error if either email or password is empty
    return res.status(400).send("Email or password cannot be blank.");
  } else if (userChecker) {
    //will return an error if user tries to sign up with existing email in database
    return res.status(400).send("Email is already in use.");
  }
  //generates random six character string for newly registered account and stores in the database
  const user = generateRandomString();
  users[user] = {
    id: user,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt),
  };
  //automatically logs user in and redirects back to index page
  req.session["user"] = user;
  res.redirect("/urls");
});

//login page with two fields for email and password along with login button.
app.get("/login", (req, res) => {
  const userID = req.session["user"];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  //if user is logged in
  if (!user) {
    //if user is not logged in, shows login page
    res.render("urls_login", templateVars);
  } else {
    //if user is already logged in, redirects to url page
    res.redirect("/urls");
  }
});

//login button will log you into an existing account with an email and password.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);
  //If authenticated, set a cookie with its user id and redirect.
  if (user) {
    const userID = user.id;
    req.session["user"] = userID;
    res.redirect(`/urls`);
  } else {
    //returns an error if user enters a wrong email or password.
    return res.status(403).send("Wrong credentials, please try again. If you do not have an account, please register.");
  }
});

//logout button with displayed username, pressing will return back to login button with input
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});