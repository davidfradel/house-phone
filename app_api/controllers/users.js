const passport = require('passport');

const { User } = require('../models/users');

async function signIn(req, res) {

    const Users= new User({ email: req.body.email, username : req.body.email}); 
    console.log('Users', Users)

  
    const response = await User.register(Users, req.body.password)
    console.log('response', response)

   
    res.render('pages/signin');
}

async function login(req, res, next) {
    req.body.username = req.body.email;
   
    if(!req.body.username) return res.json({success: false, message: "Username was not given"}); 
    if(!req.body.password) return res.json({success: false, message: "Password was not given"});

    passport.authenticate('local',(err, user, info) => {
        console.log('err',err )
        console.log('user',user )
        console.log('info', info)

        if (err) return next(err);
        if (!user) return res.redirect('/login');
                
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/account');
        });
    })(req, res, next);
  }; 

module.exports = {
    signIn,
    login,
}