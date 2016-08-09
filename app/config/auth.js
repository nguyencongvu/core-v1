// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '105660646519031', // your App ID
        'clientSecret'  : '5033b154b10d7720e948294345583ed2', // your App Secret
        'callbackURL'   : 'http://localhost:8000/auth/facebook/callback', 
        'profileFields': ["id", "email", "gender", "about", "birthday", "cover"]
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '873026146341-ce0605glrtsfebtiqt0vnsmd3k9nidfi.apps.googleusercontent.com',
        'clientSecret'  : '923j9wnJZPWdsJEzahQz0egI',
        'callbackURL'   : 'http://localhost:8000/auth/google/callback'
    }

};