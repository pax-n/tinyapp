const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const { reset } = require("nodemon");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['76edb64e-dd5c-4e83-ade7-1d7cd9a4bf85', '29cc7359-608b-4d51-a339-eb57d9428869']
}));

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const urlDatabase = {
  b6UTxQ: {
      longURL: "http://www.lighthouselabs.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = { 
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
}

const { generateRandomString, getUserByEmail, authenticateUser } = require('./helpers.js')


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//page showing all current URLS (my URLs)
app.get("/urls", (req, res) => { 
  const userID = req.session["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

//page for creating a new TinyURL
app.get("/urls/new", (req, res) => {
  const userID = req.session["user"]
  const user = users[userID]
  const templateVars = {
    user,
  }
  //if a user is logged in they can create new url
  if (!userID) {
    //user redirected to login if not logged in
    res.redirect("/login");
  } else {
    //redirected to create new url page
    res.render("urls_new", templateVars);
  }
});

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

//creates a new url on new url page and redirects to new url page
app.post("/urls", (req, res) => { 
  //generates a six character string
  const randomKey = generateRandomString();
  const userID = req.session["user"]
  const user = users[userID]
  //assigns new random key to entered longURL and user ID
  urlDatabase[randomKey] = {
    longURL: req.body.longURL,
    userID: user.id
  }
  console.log(user);
  console.log(urlDatabase);
  //redirects to new TinyURL page
  res.redirect(`/urls/${randomKey}`);
});

//any selected website displaying short url and long url
app.get("/urls/:shortURL", (req, res) => { 
  const userID = req.session["user"]
  //const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user
  };
  res.render("urls_show", templateVars);
});

//clicking a short url will direct you to the website of the long url
app.get("/u/:shortURL", (req, res) => { 
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//delete button on my URLs page that will delete selected tiny url
app.post("/urls/:shortURL/delete", (req, res) => { 
  const userID = req.session["user"]
  const user = users[userID]
  if (!user) {
    return res.status(403).send("You do not have permission to do this.")
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//edit button on my URLs page that will direct to short url page with ability to edit long url
app.post("/urls/:shortURL/edit", (req, res) => { 
  const shortURL = req.params.shortURL;
  const userID = req.session["user"]
  const user = users[userID]
  if (!user) {
    return res.status(403).send("You do not have permission to do this.")
  } else {
    res.redirect(`/urls/${shortURL}`);
  }
});

//editing the long url on short url page will redirect back to my URLs page with new edit
app.post("/urls/:shortURL/update", (req, res) => { 
  const shortURL = req.params.shortURL;
  const userID = req.session["user"];
  const user = users[userID];
  if (!user) {
    return res.status(403).send("You do not have permission to do this.")
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: user.id
    }
    res.redirect(`/urls`);
  };
});

//register page with two fields for email and password along with submit button
app.get("/register", (req, res) => { 
  const userID = req.session["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase, 
    user
  }; 
  res.render("urls_registration", templateVars)
});

//register button will generate new id for entered email and password.
app.post("/register", (req, res) => {
  const userChecker = getUserByEmail(req.body.email, users);
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email or password cannot be blank.");
  } else if (userChecker) {
    return res.status(400).send("Email is already in use.");
  }

  const user = generateRandomString()
  users[user] = {
    id: user,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt),
  };
  req.session["user"] = user;
  //res.cookie("user", user)
  res.redirect("/urls");
});  

//login page with two fields for email and password along with login button.
app.get("/login", (req, res) => {
  const userID = req.session["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase, 
    user
  }; 
  res.render("urls_login", templateVars)
}); 

//login button will log you into an existing account with an email and password.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);

  //If authenticated, set a cookie with its user id and redirect.
  if (user) {
    const user_id = user.id
      req.session["user"] = user_id 
      res.redirect(`/urls`);
    } else {
      return res.status(403).send("Wrong password.");
    }
});

//logout button with displayed username, pressing will return back to login button with input
app.post("/logout", (req, res) => { 
  req.session["user"] = null;
  res.redirect("/urls");
});