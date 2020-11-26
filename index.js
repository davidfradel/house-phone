const mongoose = require("mongoose");
const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport');
const { ensureLoggedIn } = require('connect-ensure-login');
const path = require('path');
const cookieParser = require('cookie-parser');
const MongoStore = require("connect-mongo")(session);

const db = mongoose.connection;
const mongoStore = new MongoStore({ mongooseConnection: db });

const userController = require('./app_api/controllers/users');
const PredictionController = require('./app_api/controllers/predictions');
const { User } = require('./app_api/models/users');


async function userData(req, res, next) {
  try {
    const { user: email } = req.session.passport;

    const user = await User.findOne({ email});

    const currentDate = new Date();
    const freeTrialEndDate = new Date;
    freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);

    req.user = user;
    req.user.freeTrial = currentDate < freeTrialEndDate;
  
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
    res.render('pages/index');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.post('/login', userController.login);

app.get('/signin', (req, res) => {
    res.render('pages/signin');
});

app.post('/signin', userController.signIn);

// about page
app.get('/about', (req, res) => {
    console.log("req", req)
    res.render('pages/about');
});

app.get('/account', ensureLoggedIn(), (req, res) => {
  console.log('req', req.user)
  const { freeTrial } = req.user;
  res.render('pages/account', { freeTrial });
});

app.post('/prediction', (req, res) => {
  console.log('req.body--------', req.body)
  res.render('pages/login');
})

app.get('/test', ensureLoggedIn(), (req, res) => {
    console.log('req.user', req.user)
    res.send('TOTO!')
})

app.get('/sessions', (req, res) => {
    req.sessionStore.sessionModel.findAll()
      .then(sessions => sessions.map(sess => JSON.parse(sess.dataValues.data)))
      .then((sessions) => {
        res.send(sessions)
      })
  })

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})