const passport = require('passport');
const nodemailer = require('nodemailer');

const { v4: uuidv4 } = require('uuid');

const { User } = require('../models/users');
const { Secret } = require('../models/secrets');

async function signIn(req, res) {
    const { email, password } = req.body;
    const isConnected = false;

    try {
        const Users = new User({ email, username : email}); 
        const user = await User.register(Users, password)

        const code = uuidv4();
        await Secret.create({ email, code })

        // Initialize mail server
        const transporter = nodemailer.createTransport({
            host: "ssl0.ovh.net",
            port: 587,
            auth: {
                type: "login",
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD
            },
        });

        const url = `https://www.renard-bleu.fr/verification/${user._id}/${code}`

        await transporter.sendMail({
            from: '"Renard Bleu" <contact@renard-bleu.fr>',
            to: email,
            subject: "Renard Bleu vous souhaite la bienvenue",
            text: `Veuillez accéder au lien suivant pour valider votre compte ${url}`,
            html: `<p>Veuillez cliquer sur lien suivant pour valider votre compte  <a href="${url}">${url}</a>
            </p>`,
        });
  

        res.render('pages/signin', { isConnected, success: true });
        
    } catch(error){
        const errorMessage = `Cet email est déjà prise par un utilisateur`
        res.render('pages/signin', { isConnected, errorMessage });
    }
}

async function login(req, res, next) {
    req.body.username = req.body.email;
   
    if(!req.body.username) return res.json({success: false, message: "Username was not given"}); 
    if(!req.body.password) return res.json({success: false, message: "Password was not given"});

    passport.authenticate('local',(err, user, info) => {
        if (err) return next(err);
        let isConnected = false;

        const unvalidated = true;
        if (!user) return res.redirect('/login');
        const userId = user._id;

        if (user && user.status === `pending`) return res.render('pages/login', { isConnected, unvalidated, userId });

        const currentDate = new Date();
        const freeTrialEndDate = new Date;
        freeTrialEndDate.setDate(freeTrialEndDate.getDate() + 7);
    
        req.user = user;
        req.user.freeTrial = currentDate < freeTrialEndDate ? true : false;
                
        req.logIn(user, (err) => {
            if (err) return next(err);

            const freeTrial = req.user.freeTrial;
            const prediction = false;
            const features = {};
            isConnected = req.user ? true : false;

            res.render('pages/account', { isConnected, freeTrial, prediction, features });
        });
    })(req, res, next);
  }; 

  async function emailValidation(req, res) {
    const { userId, code } = req.params;

    const user = await User.findById(userId).lean();

    const { email } = user;

    const secret = await Secret.findOne({ email }).lean();

    if(secret && secret.code === code){
        await Promise.all([
            User.findOneAndUpdate({ _id: userId}, {status: `done`}),
            Secret.findOneAndDelete({ email }),
        ])

        const isConnected = false;
        const validated = true;
        res.render('pages/login', { isConnected, validated });
    } else {
        return res.redirect('/login');
    }
  }; 

  async function emailValidationRefresh(req, res) {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();
    const { email } = user;

    const code = uuidv4();

    await Secret.findOneAndUpdate({ email }, { code }, { upsert: true, new: true });

    // Initialize mail server
    const transporter = nodemailer.createTransport({
        host: "ssl0.ovh.net",
        port: 587,
            auth: {
                type: "login",
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD
        },
    });
    
    const url = `https://www.renard-bleu.fr/verification/${userId}/${code}`
    
    await transporter.sendMail({
        from: '"Renard Bleu" <contact@renard-bleu.fr>',
        to: email,
        subject: "Renard Bleu vous souhaite la bienvenue",
        text: `Veuillez accéder au lien suivant pour valider votre compte ${url}`,
        html: `<p>Veuillez cliquer sur lien suivant pour valider votre compte  <a href="${url}">${url}</a>
        </p>`,
    });
      
    return res.redirect('/login');
  }; 



module.exports = {
    signIn,
    login,
    emailValidation,
    emailValidationRefresh,
}