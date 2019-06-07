
function generateRandomString() {
var result = '';
var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var charactersLength = characters.length;
for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   // console.log(result);
   return result;
};

var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = 8080; // default port 8080
app.use(cookieParser());
app.set("view engine", "ejs")
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {
  res.render("urls_new",{
    username:req.cookies.username
  });

});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], 
  username: req.cookies.username
  };
  // console.log(templateVars)
  res.render("urls_show", templateVars);

});

// app.get("/urls/login",(req,res) =>


app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username:req.cookies.username
  };
  res.render("urls_index", templateVars);

});

app.get("/",(req, res) => {
 console.log('Cookies: ', req.cookies)
 res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL",(req,res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
   // console.log(req.body);
  const shortened = generateRandomString()
  urlDatabase[shortened] = req.body.longURL
  // console.log(urlDatabase[shortened]);
  // console.log(urlDatabase);
  res.redirect("/urls/"+shortened);
});

app.post("/urls/:shortURL/delete",(req,res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update",(req,res) => {
console.log(req.params, req.body)
urlDatabase[req.params.shortURL] = req.body.longURL
res.redirect("/urls");

});

app.post("/login",(req,res) =>{
  /**
   * Reaction from the site after the user logs their login information and presses the button.
   * the site will log a cookie and redirect them to the urls page.
   * 
   */
  const username = req.body.username
  res.cookie("username",username)
  res.redirect("/"); 
});

app.post("/logout",(req,res) =>{
  /**
   * Reaction from the site after the user hits the logout button 
   * the site will clear the cookie associated with the username and redirect them to the urls page
   * 
   *
   */
    
   res.clearCookie("username")
  res.redirect("/urls");
  });

