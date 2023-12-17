const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const port = process.env.PORT;
const app = express();

require('dotenv').config();

// Connect to MongoDB
// MONGODB_CONNECT_URI='mongodb+srv://prinuvinod:BlahBlah123@authentication.syjh7e6.mongodb.net/Authentication?retryWrites=true&w=majority'
mongoose.connect(process.env.MONGODB_CONNECT_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect('mongodb+srv://prinuvinod:BlahBlah123@authentication.syjh7e6.mongodb.net/Authentication?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('MongoDB connected successfully');
});

// Use EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', __dirname + '/views');

// Use bodyParser and set up static folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set up session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Set up passport
app.use(passport.initialize());
app.use(passport.session());

// Set up user model
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Redirect to the register page when the server starts
app.get('/', (req, res) => {
  res.redirect('/register');
});

// Register route
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      console.error(err);
      return res.render('register', { error: 'Registration failed. Please try again.' });
    }

    // Redirect to the login page after successful registration
    res.redirect('/login');
  });
});

// Register route
app.get('/register', (req, res) => {
  res.render('register', { error: null }); // Pass an empty or null error initially
});

app.post('/register', (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      console.error(err);
      return res.render('register', { error: 'Registration failed. Please try again.' });
    }

    // No need for passport.authenticate here, as the user is already registered
    res.redirect('/dashboard');
  });
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: 'http://prinuvinod.me',
  failureRedirect: '/login'
}));

// Logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/register');
});

// Dashboard route (protected)
// app.get('/dashboard', isLoggedIn, (req, res) => {
//   res.send('Dashboard Page');
// });

// Middleware to check if a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/`);
});