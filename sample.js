const express = require('express');
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');

require('dotenv').config();

const app = express();
const oidc = new ExpressOIDC({
  issuer: process.env.ISSUER,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  appBaseUrl: process.env.APPBASEURL,
  scope: `${process.env.SCOPE}`
});

app.use(session({
  secret: process.env.RANDOM_SECRET_WORD,
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);

app.get('/', (req, res) => {
  if (req.userContext) {
    res.send(`
      Hello ${req.userContext.userinfo.name}!
      <form method="POST" action="/logout">
        <button type="submit">Logout</button>
      </form>
      <form method="GET" action="/test">
        <button type="submit">debug</button>
      </form>
    `);
  } else {
    res.send('Please <a href="/login">login</a>');
  }
});

app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send('Top Secret');
});

app.get('/test', (req, res) => {
  if (req.userContext) {
    const tokenSet = req.userContext.tokens;
    const userinfo = req.userContext.userinfo;

    console.log(`Access Token: ${tokenSet.access_token}`);
    console.log(`Id Token: ${tokenSet.id_token}`);
    console.log(`Claims: ${tokenSet.claims}`);
    console.log(`Userinfo Response: ${userinfo}`);

    res.send(`Hi ${userinfo.name}! <p>${tokenSet.id_token} <p>${tokenSet.access_token}`);
  } else {
    res.send('Hi!');
  }
});

oidc.on('ready', () => {
  app.listen(80, () => console.log('app started'));
});

oidc.on('error', err => {
    console.log(error)
  // An error occurred while setting up OIDC, during token revokation, or during post-logout handling
});
