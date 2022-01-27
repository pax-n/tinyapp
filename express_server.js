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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const generateRandomString = function() {
  let newURL = Math.random().toString(36).substr(2,6);
  return newURL;
};

//function that loops through the database and checks if the email is present
const getUserByEmail = function(email, database){
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

app.get("/urls/new", (req, res) => { //page for creating a new TinyURL
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => { //page showing all current URLS (my URLs)
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => { //creates a new url on new url page and redirects to new url page
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${randomKey}`);
  urlDatabase[randomKey] = req.body.longURL;         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => { //any selected website displaying short url and long url
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { //clicking a short url will direct you to the website of the long url
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
 
app.post("/urls/:shortURL/delete", (req, res) => { //delete button on my URLs page that will delete selected tiny url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => { //edit button on my URLs page that will direct to short url page with ability to edit long url
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/update", (req, res) => { //editing the long url on short url page will redirect back to my URLs page with new edit
  const newURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { urls: urlDatabase, user}; 
  res.render("urls_login", templateVars)
}); 

app.post("/login", (req, res) => { //login button with input box to display username
  const user_id = generateRandomString()
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("user", user_id)
  res.redirect("/urls");
});  

app.post("/logout", (req, res) => { //logout button with displayed username, pressing will return back to login button with input
  res.clearCookie("user");
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => { //register page with two fields for email and password along with submit button
  const userID = req.cookies["user"]
  const user = users[userID]
  const templateVars = { urls: urlDatabase, user}; 
  res.render("urls_registration", templateVars)
});

app.post("/register", (req, res) => {
  const userChecker = getUserByEmail(req.body.email, users);
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email and password cannot be blank.");
  } else if (userChecker) {
    return res.status(400).send("Email is already in use.");
  }

  const user_id = generateRandomString()
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("user", user_id)
  res.redirect("/urls");
});  



