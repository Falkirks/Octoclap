var express = require('express'),
	exphbs = require('express-handlebars'),
    jf = require('jsonfile'),
    moment = require('moment'),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient,
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    session = require('express-session');
var GITHUB_CLIENT_ID = "false";
var GITHUB_CLIENT_SECRET = "false";
console.log("Connecting...");
MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
    if(err) throw err;
    channels = db.collection('channels');
    console.log("Loading channels...");
    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete GitHub profile is serialized
    //   and deserialized.
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });


    // Use the GitHubStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and GitHub
    //   profile), and invoke a callback with a user object.
    passport.use(new GitHubStrategy({
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: "https://falk-push.herokuapp.com/auth/github/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {

                // To keep the example simple, the user's GitHub profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the GitHub account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        }
    ));
    var app = express();
    app.use(session({
        secret: 'keyboard cat'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.get('/auth/github',
        passport.authenticate('github'),
        function(req, res){
            // The request will be redirected to GitHub for authentication, so this
            // function will not be called.
        });

    // GET /auth/github/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
    });
    app.engine('handlebars', exphbs({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    app.set('port', (process.env.PORT || 5000));

    app.get('/:user/:repo', function (request, response) {

    });
    app.listen(app.get('port'), function () {
        console.log("Node app is running at localhost:" + app.get('port'))
    });
});
