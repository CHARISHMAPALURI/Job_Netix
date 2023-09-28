const axios = require('axios');
const ejs = require('ejs');
const express = require('express');
const bp = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore,Filter } = require('firebase-admin/firestore');
var passwordHash = require('password-hash');

const app = express();

app.set('viewengine','ejs');
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

var serviceAccount = require("./servicekey.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

let arr = [];

app.get("/",(req,res) => {
  res.render('landpage.ejs');
});

app.post('/search',(req,res) => {
  const j = req.body.job;
  async function request(){

const options = {
   method: 'POST',
  url: 'https://linkedin-jobs-scraper-api.p.rapidapi.com/jobs',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': '27888810famsh58fbd5980bab239p10cb63jsnbc78860760c7',
    'X-RapidAPI-Host': 'linkedin-jobs-scraper-api.p.rapidapi.com'
  },
  data: {
    title: j,
    location: 'India',
    rows: 10
  }
};
  let resp = await axios.request(options);
  
  for(let i=0;i<=9;i++){
    arr.push(resp.data[i]);
  }
  res.render('job.ejs',{jobarray : arr,job:j});
    arr = [];
}
request();
});

app.get("/signup" , function(req,res){
    res.render('signup.ejs',{msg2:''});
});

app.post("/signupsubmit",function(req,res){
  db.collection("signupdetails").where(
    Filter.or(
      Filter.where("username","==",req.body.username),
      Filter.where("password","==",req.body.pswd)
    ))
    .get()
    .then((docs)=>{
    if(docs.size>0){
    res.render("signup.ejs",{msg2:"Username already exists!!!"})}
  else{
    db.collection("signupdetails").add({
      fname : req.body.fname,
      lname : req.body.lname,
      username : req.body.username,
      password : passwordHash.generate(req.body.pswd)
    }).then(()=>{
      res.render('home.ejs');
    })
  }
  })
})
app.get("/login",function(req,res){
    res.render("login.ejs",{msg:''})
});
app.post("/loginsubmit",function(req,res){
  
  db.collection("signupdetails").where('username','==',req.body.Email )
    .get().then((docs)=>{
      let verified = false;
      docs.forEach((doc)=>{
        verified = passwordHash.verify(req.body.pswd, doc.data().password);
      })
      if(verified){
        res.render('home.ejs');
      }
      else{
        res.render('login.ejs',{msg:"Username is not found!!\nPlease signup"});
      }
    })
})

app.listen(4000,()=>{
  console.log("Server is started");
});