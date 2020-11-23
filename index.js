const express = require('express');
const uuid = require('uuid')
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport');
const { ensureLoggedIn } = require('connect-ensure-login');


const app = express();

require('./app_api/services/database');

const userController = require('./app_api/controllers/users');
const { User } = require('./app_api/models/users');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use( express.static( "public" ) );

// add & configure middleware
app.use(session({
    genid: (req) => {
      console.log('Inside the session middleware')
      console.log(req.sessionID)
      return uuid.v4(); // use UUIDs for session IDs
    },
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))


app.use(bodyParser.urlencoded({
    extended: false
  }))
  
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 


const LocalStrategy = require('passport-local').Strategy; 
passport.use(new LocalStrategy(User.authenticate())); 

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