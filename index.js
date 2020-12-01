const mongoose = require("mongoose");
const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport');
const { ensureLoggedIn } = require('connect-ensure-login');
const path = require('path');
const cookieParser = require('cookie-parser');
const MongoStore = require("connect-mongo")(session);
require('dotenv').config()


const db = mongoose.connection;
const mongoStore = new MongoStore({ mongooseConnection: db });

const userController = require('./app_api/controllers/users');
const predictionController = require('./app_api/controllers/predictions');
const { User } = require('./app_api/models/users');


async function userData(req, res, next) {
  try {
    const { user: email } = req.session.passport;

    const user = await User.findOne({ email}).lean();

    const currentDate = new Date();
    const freeTrialEndDate = new Date;
    freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);

    req.user = user;
    req.user.freeTrial = currentDate < freeTrialEndDate ? true : false;
  
    return next();
  } catch(error){
    return next();
  }
}


const app = express();

require('./app_api/services/database');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(cookieParser('secret'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


const sessionOpts = {
  saveUninitialized: true, // saved new sessions
  resave: false, // do not automatically write to the session store
  store: mongoStore,
  secret: 'big secret',
  cookie : { httpOnly: true, maxAge: 2419200000 } // configure when sessions expires
}
app.use(session(sessionOpts))


app.use(passport.initialize());
app.use(passport.session());

const LocalStrategy = require('passport-local').Strategy; 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(userData);

const PORT = process.env.PORT || 3000;

// index page
app.get('/', (req, res) => {
  const isConnected = req.user ? true: false;
    res.render('pages/index', { isConnected } );
});

app.get('/login', (req, res) => {
  const isConnected = false;
    res.render('pages/login', { isConnected });
});

app.post('/login', userController.login);

app.get('/signin', (req, res) => {
  const isConnected = false;
  res.render('pages/signin', { isConnected });
});

app.post('/signin', userController.signIn);

app.get('/account', ensureLoggedIn(), (req, res) => {
  const { freeTrial } = req.user;
  const prediction = false;
  const features = {
    local_type: "",
    building_area: "",
    land_area: "",
    total_room: "", 
    street_type: "",  
    street_name: "", 
    postal_code: ""
};

const isConnected = true;
  res.render('pages/account', { isConnected, freeTrial, prediction, features });
});

app.get('/prediction', ensureLoggedIn(), (req, res) => {
  const { freeTrial } = req.user;
  const prediction = false;
  const features = {
    local_type: "",
    building_area: "",
    land_area: "",
    total_room: "", 
    street_type: "",  
    street_name: "", 
    postal_code: ""
};

const isConnected = true;
  res.render('pages/account', { isConnected, freeTrial, prediction, features });
});

app.get('/subscription', ensureLoggedIn(), (req, res) => {
  const isConnected = true;
  const PAYPAL_URL = process.env.PAYPAL_URL;
  const PAYPAL_PLAN_ID = process.env.PAYPAL_PLAN_ID;

  res.render('pages/payment', { isConnected, PAYPAL_URL, PAYPAL_PLAN_ID });
});

app.get('/verification/refresh/:userId', userController.emailValidationRefresh);

app.get('/verification/:userId/:code', userController.emailValidation);

app.post('/prediction', ensureLoggedIn(), predictionController.createPrediction)

app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
      const isConnected = false;
      const validation = true;
      res.render('pages/login', { isConnected, validation }); //Inside a callback… bulletproof!
  });
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
})