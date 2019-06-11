

// Packages
const bcrypt = require('bcrypt');
const express = require("express");
const cookieSession = require('cookie-session')
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// Server
const app = express();
// MiddleWare
app.use(cookieSession({name: 'session',keys: ["secrets"]}))
app.use(bodyParser.urlencoded({extended: true}));  
app.set("view engine", "ejs") 


//************ Users Database for URLS********************
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"},
} 
// ******** Helper functions*************
// Finds URLs for logged in users
function urlsForUser(id) {
  let result = {}
  for(key in urlDatabase){
    if(urlDatabase[key]["userID"] === id){
      result[key] = urlDatabase[key];
    }
  }
  return result;
}
// Finds valid users based on comparing user input email and registered user email in DB
function emailLookUp(email){
  for(i in users){
    if(users[i].email === email){
    return users[i]; 
    }
    }
  return false; 
};
//// ********Helper Function for looking up passwords***********
function passwordLookup(password){
  for(i in users){
    if(users[i].password === password){
    return password 
    }
    
  }
  return false
};

// Random ID Helper Function*******************
function generateRandomString() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
  
     return result;
  };

// *******Global users object*****************************
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "hello@gmail.com", 
    password: "purplemonkeydinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
// ***********************************************************
//******** Users register from this page with a unique email address that hasn't been previously registered***

app.get("/register", (req,res) => {
  let templateVars = {
    urls:urlDatabase,
    user:users[req.session.user_id]
    
  };
  res.render("urls_register",templateVars)
});

// ****** Only registered and logged in users can create Tiny URLs*********

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user:users[req.session.user_id]
  }
    if(!req.session.user_id){
       
      res.redirect("/login")
    }
  
  res.render("urls_new",templateVars)

});

// ****** URLs can be updated to point to new Long URLs *****************
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params)
  console.log(urlDatabase[req.params.shortURL])
  let templateVars = { 
  
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]["longURL"], 
    user: users[req.session.user_id]
  };
  
  res.render("urls_show", templateVars);

});

// ******* List of User's URLS*************************
app.get("/urls", (req, res) => {
  const key = req.session.user_id
  const userUrls = urlsForUser(key);
  const templateVars = { 
   user: users[key],
   urls: userUrls
  }
    
    res.render("urls_index", templateVars);
});
// ******* Home Page that redirects to URLs list**************
app.get("/",(req, res) => {

 res.redirect("/urls");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL",(req,res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL']
  res.redirect(longURL);
});

app.get("/login",(req,res) => {
  let templateVars = { 
    
    user: users[req.session.user_id]
  };
  res.render("urls_login",templateVars);
});

app.post("/urls", (req, res) => {
  if(req.session.user_id){
    let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
  url: req.body['longURL'],
  userID: req.session.user_id,
  
};
res.redirect("/urls/"+shortURL);
  }
  else
    response.status(400);
});

app.post("/urls/:shortURL/delete",(req,res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

app.post("/urls/:shortURL",(req,res) => {
console.log(req.body)
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]){
  urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL
  
  
}

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
    const user = emailLookUp(req.body.email)
    
    if(bcrypt.compareSync(req.body.password,user["password"])){ 
      return res.session("user_id",user.id).redirect("/urls");
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
    
   req.session = null;
  res.redirect("/urls");
  });

  app.post("/register",(req,res) =>{

    const user = emailLookUp(req.body.email)
    
    if (!req.body.email){
      res.status(400).send("Email is required").redirect("/register");
      // res.redirect("/register")
    }
    if(!req.body.password){
      res.redirect("/register");
    } 
    if(req.body.email === user.email) {
      res.status(400).redirect("/register");
  
    
    }
    else {
    
    let newId = generateRandomString()
    users[newId] = {
      id: newId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
    req.session.user_id = newId
    console.log(users[newId])
    return res.redirect("/urls")
   
  
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});