var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var flash    = require('connect-flash');
var storage = require('node-persist');
var cognitiveServices = require('cognitive-services');
var rp = require('request-promise');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(flash());

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

var Twitter = require('twitter');

var computerVision = cognitiveServices.computerVision({
    API_KEY: '92975dfa345a423c8756e800f9ed0b14'
})

var client = new Twitter({
  consumer_key: 'I1fumJtHqLRwLc4oPzqkghqoD',
  consumer_secret: 'J7vMfxXVI4zZyXqFtoLPV2fwyUQWVP8Dh1Ky6PBgFUAZd4xD0C',
  access_token_key: '3017462262-3bJEiTDm87TXcPHVD6CSTADSEZR7ngpfw12iUNH',
  access_token_secret: '9f7Nn35SD3Qbr4eKdjVzM2YukJiFK7jt4PB4pu4t6Vjfq'
});

/*var config = {
    consumerKey: 'I1fumJtHqLRwLc4oPzqkghqoD',
    consumerSecret: 'J7vMfxXVI4zZyXqFtoLPV2fwyUQWVP8Dh1Ky6PBgFUAZd4xD0C',
    accessToken: '3017462262-3bJEiTDm87TXcPHVD6CSTADSEZR7ngpfw12iUNH',
    accessTokenSecret: '10f7Nn35SD3Qbr4eKdjVzM2YukJiFK7jt4PB4pu4t6Vjfq',
    callBackUrl: 'http://localhost:8080/auth/twitter/callback'
};*/

var parameters = {
    visualFeatures: "Categories"
};


var params = {screen_name: 'mkbhd'};

storage.initSync();

app.get('/', function(req, res) {

  var tweets = [];
  var descr = [];

  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      storage.setItemSync('name', tweets);

      for (var i = 0; i < tweets.length; i++) {
        if(tweets[i].extended_entities !== undefined) {
          var img_url = tweets[i].extended_entities.media[0].media_url;
          console.log(img_url);

          var options = {
              method: 'POST',
              headers: {
                  'Ocp-Apim-Subscription-Key': '92975dfa345a423c8756e800f9ed0b14'
              },
              uri: 'https://westus.api.cognitive.microsoft.com/vision/v1.0/describe',
              qs: {
                  maxCandidates: 1
              },
              body: {
                  url: img_url
              },
              json: true // Automatically stringifies the body to JSON 
          };

          rp(options)
              .then(function (parsedBody) {
                  descr.push(parsedBody.description.captions[0]);
                  storage.setItemSync('desc', descr);
                  console.log(descr);
              })
              .catch(function (err) {
                  throw err;
              });
        }
      }
    }
  });

  var tweetArr = storage.getItemSync('name');
  var desc = storage.getItemSync('descr');

  console.log(tweetArr);
  console.log(desc);

  res.render('index.ejs', {
    tweetArr: tweetArr,
    desc: descr
  });

});

app.listen(port);
console.log('The magic happens on port ' + port);
