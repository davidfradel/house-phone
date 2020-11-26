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
        if (err) return next(err);
        if (!user) return res.redirect('/login');

        req.user = user;
                
        req.logIn(user, (err) => {
            if (err) return next(err);

            const currentDate = new Date();
            const freeTrialEndDate = new Date;
            freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);

            const freeTrial = currentDate < freeTrialEndDate;

            res.render('pages/account', { freeTrial });
        });
    })(req, res, next);
  }; 

module.exports = {
    signIn,
    login,
}