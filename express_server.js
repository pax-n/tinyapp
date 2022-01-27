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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

const generateRandomString = function() {
  let newURL = Math.random().toString(36).substr(2,6);
  return newURL;
};

const getUserByEmail = function(email, database) { //function that loops through the database and checks if the email is present
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

app.get("/urls", (req, res) => { //page showing all current URLS (my URLs)
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { //page for creating a new TinyURL
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

app.post("/urls", (req, res) => { //creates a new url on new url page and redirects to new url page
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

app.get("/urls/:shortURL", (req, res) => { //any selected website displaying short url and long url
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { //clicking a short url will direct you to the website of the long url
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
 
app.post("/urls/:shortURL/delete", (req, res) => { //delete button on my URLs page that will delete selected tiny url
  const userID = req.cookies["user"]
  const user = users[userID]
  if (!user) {
    return res.status(403).send("You do not have permission to do this.")
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => { //edit button on my URLs page that will direct to short url page with ability to edit long url
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user"]
  const user = users[userID]
  if (!user) {
    return res.status(403).send("You do not have permission to do this.")
  } else {
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/urls/:shortURL/update", (req, res) => { //editing the long url on short url page will redirect back to my URLs page with new edit
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

app.get("/register", (req, res) => { //register page with two fields for email and password along with submit button
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase, 
    user
  }; 
  res.render("urls_registration", templateVars)
});

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

app.get("/login", (req, res) => {
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { 
    urls: urlDatabase, 
    user
  }; 
  res.render("urls_login", templateVars)
}); 

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

app.post("/logout", (req, res) => { //logout button with displayed username, pressing will return back to login button with input
  res.clearCookie("user");
  res.redirect("/urls");
});