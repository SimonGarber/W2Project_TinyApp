// Random ID Helper Function
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
// Global users object
const users = {
  "test": {
    id: "test", 
    email: "hello@gmail.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Helper Function for looking up emails
function emailLookUp(email){
  for(i in users){
    if(users[i].email === email){
    return users[i]; 
    }
    
  }
  return false;
}
// Helper Function for looking up passwords
function passwordLookup(password){
  for(i in users){
    if(users[i].password === password){
    return password 
    }
    
  }
  
}


// function is not passing the correct information or the helper function is not iterating properly, need to 
// check to see what this function is doing and if it is scoped correctly
app.get("/register", (req,res) => {
 
  res.render("urls_register")
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new",{
    user:users[req.cookies.user_id]
  });

});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: users[req.cookies.user_id]
  };
  // console.log(templateVars)
  res.render("urls_show", templateVars);

});

 app.get("/login",(req,res) => {
   
  //  console.log(res.cookies.user_id);
   let templateVars = {};
   res.render("urls_login",templateVars)
 });


app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies.user_id]
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

app.get("/login",(req,res) => {
 
  
  res.render("login");
})

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

app.post("/login",(req,res) => {
  /**
   * Reaction from the site after the user logs their login information and presses the button.
   * the site will log a cookie and redirect them to the urls page.
   * 
   */
  
   if(!emailLookUp(req.body.email)){
    res.status(403).send("you need to register an account")

  

    
  }
  else {
    let user = emailLookUp(req.body.email)
    console.log(user);
    if(users[i].password === req.body.password){
      res.cookie("user_id",user.id)
    res.redirect("/urls");
    }
    else {
      res.status(403).send("the password does not match!")
    }

  }
  
    
  
  
  // res.redirect("/urls"); 
});

app.post("/logout",(req,res) =>{
  /**
   * Reaction from the site after the user hits the logout button 
   * the site will clear the cookie associated with the username and redirect them to the urls page
   * 
   *
   */
    
   res.clearCookie("user_id")
  res.redirect("/urls");
  });

  app.post("/register",(req,res) =>{
    if (!req.body.email){
      res.status(400).send("Email is required")
      // res.redirect("/register")
    }
    if(!req.body.password){
      res.status(400).send("Password is required")
    } 
    if(req.body.email === emailLookUp(req.body.email)) {
      res.status(400).send("already exists")
      // res.redirect("/register"); <---- doesn't do anything 
    
    }
    
  
    const newId = generateRandomString()
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: req.body.password,
    }
    res.cookie("user_id",newId)
    res.redirect("/urls");
    console.log(req.body.password)
    console.log(users)
  
  });
