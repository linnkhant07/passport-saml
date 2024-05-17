const express = require('express');
const path = require('path');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const session = require('express-session');

const app = express();
const PORT = 3000;

// Configure session middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure the SAML strategy
passport.use(new SamlStrategy(
  {
    path: '/login/callback',
    entryPoint: 'https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php',
    issuer: 'passport-saml',
    cert: '-----BEGIN CERTIFICATE-----\nMIID...base64-encoded certificate...\n-----END CERTIFICATE-----', // Replace with the actual certificate from OpenIDP
  },
  function(profile, done) {
    findByEmail(profile.email, function(err, user) {
      if (err) {
        return done(err);
      }
      return done(null, user);
    });
  })
);

// Serve static files (if any)
app.use(express.static(path.join(__dirname)));

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/login', passport.authenticate('saml', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

app.post('/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect('/');
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

function findByEmail(email, cb) {
  // Dummy function to simulate finding a user by email
  // Replace with your actual user lookup logic
  const user = { id: 1, email: email };
  cb(null, user);
}
