const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser"); 
const { reset } = require("nodemon");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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

//generates a six character string containing letters or numbers
const generateRandomString = function() {
  let newURL = Math.random().toString(36).substr(2,6);
  return newURL;
};

//function that loops through the database and checks if a registered email is present
const getUserByEmail = function(email, database) { 
  for (let userID in database) {
    if (email === database[userID].email) {
      return database[userID];
    }
  }
  return undefined;
}

const randomKey = generateRandomString();

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//page showing all current URLS (my URLs)
app.get("/urls", (req, res) => { 
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

//page for creating a new TinyURL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = {
    user,
  }
  if (!userID) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

//creates a new url on new url page and redirects to new url page
app.post("/urls", (req, res) => { 
  const randomKey = generateRandomString();
  const userID = req.cookies["user"]
  const user = users[userID]
  urlDatabase[randomKey] = {
    longURL: req.body.longURL,
    userID: user.id
  }
  console.log(user);
  console.log(urlDatabase);
  res.redirect(`/urls/${randomKey}`);
});

//any selected website displaying short url and long url
app.get("/urls/:shortURL", (req, res) => { 
  const userID = req.cookies["user"]
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
  const userID = req.cookies["user"]
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
  const userID = req.cookies["user"]
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
  const userID = req.cookies["user"];
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
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase, 
    user
  }; 
  res.render("urls_registration", templateVars)
});

//registering button will generate new id for entered email and password.
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
    password: req.body.password,
  };
  res.cookie("user", user)
  res.redirect("/urls");
});  

//login page with two fields for email and password along with login button.
app.get("/login", (req, res) => {
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase, 
    user
  }; 
  res.render("urls_login", templateVars)
}); 

//login button will log you into an existing account with an email and password.
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (user.password === req.body.password) {
      const user_id = user.id;
      res.cookie("user", user_id);
      res.redirect("/urls");
    } else if (req.body.password !== user.password) {
      return res.status(403).send("Password does not match.")
    }
  } else {
    return res.status(403).send("Email does not exist.")
  }
});

//logout button with displayed username, pressing will return back to login button with input
app.post("/logout", (req, res) => { 
  res.clearCookie("user");
  res.redirect("/urls");
});