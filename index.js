if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const SERVICE_G = process.env.SERVICE_G;
const U_NAME = process.env.U_NAME;
const P_WORD = process.env.P_WORD;
const SESSION_SECRET = process.env.SESSION_SECRET;


const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
// const session = require('express-session');
const flash = require('connect-flash');
const { emailSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


// mongoose.connect('mongodb://127.0.0.1:27017/dragon');

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

const nodemailer = require('nodemailer');
const http = require('http');
const server = http.Server(app);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.use(express.static(path.join(__dirname, "views/contact")));



// const sessionConfig = {
//     name: 'ses',
//     secret: SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie:{
//         httpOnly: true,
//         secure: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// };

// app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
     "https://cdn.jsdelivr.net",
];

const connectSrcUrls = [
  
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// app.use((req,res,next) =>{
//     res.locals.success = req.flash('success');
//     next();
// })

const validateEmail = (req, res, next) =>{
    const { error } = emailSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else{ next()}
};


app.get('/', (req,res)=>{
    res.render('home');
});

app.get('/gallery', (req,res)=>{
    res.render('gallery');
});

app.get('/artists', (req,res)=>{
    res.render('artists');
});

app.get('/events', (req,res)=>{
    res.render('events');
});

app.get('/contact', (req,res)=>{
    res.render('contact');
});


//Apply rate limiting
const limiter = rateLimit({
    windowMs: 24* 60 * 60 * 1000,
    max: 5
});



app.post('/sendEmail', validateEmail, limiter, catchAsync(async (req,res, next) =>{

    const{ title, deadline, description, purpose, budget, name, email }= req.body;

    const text = ` Project name:${title}. Requested by ${name} with email of ${email}. Deadline: ${deadline}. Budget: ${budget}. Description: ${description}. Purpose: ${purpose}. `;

    const transporter = nodemailer.createTransport({
        service: SERVICE_G,
        auth:{
            user: U_NAME,
            pass: P_WORD
        }
    });
    const mailOptions = {
        from: email,
        to: U_NAME,
        subject: title,
        text: text
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){  
            console.log(error)    
        } else{ console.log("Email send: " + info.response)}
    });
    // req.flash('success', 'Message received!');   
    res.redirect("/");
}));

app.all('*', (req, res, next) =>{
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) =>{
    const{ statusCode = 500, message= 'Sorry, something went wrong' } = err;
    res.status(statusCode).render('error');
});


app.listen(3000, ()=>{
    console.log('Serving on port 3000')
});