var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var flash = require('connect-flash');
var storage = require('node-persist');
var cognitiveServices = require('cognitive-services');
var rp = require('request-promise');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

app.use(session({
  secret: 'ilovescotchscotchyscotchscotch'
}));
app.use(flash());

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

var Twitter = require('twitter');

var computerVision = cognitiveServices.computerVision({
   API_KEY: '92975dfa345a423c8756e800f9ed0b14'
})

var client = new Twitter({
  consumer_key: 'asQ3HBBRWHNKK43PAUZ1JO1Xk',
  consumer_secret: 'jjfHX2h4EleIa1ZPGOGWqjLCSxmnhD5DxjEChgd205KpTQpLBT',
  access_token_key: '3017462262-845203149979738112-TaL2P5jtGxH2TzpBP0dAkaqf4Fs9mRb',
  access_token_secret: 'HEpf16tO3SdOg6TgW40R5PD9T6zWYJuaxeJV2QzuWvYdp'
});

var parameters = {
  visualFeatures: "Categories"
};


var params = {
  screen_name: 'MKBHD'
};

storage.initSync();

app.get('/', function(req, res) {

  var tweets = [];
  var descr = [];
  var imgURL = [];
  var results = [];

  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      // console.log(tweets);
      storage.setItemSync('name', tweets);
      for (var i = 0; i < tweets.length; i++) {
        var res = {};
        if (tweets[i].extended_entities !== undefined) {
          var res_text = tweets[i].text;
          res_text = res_text.replace(/https?:\/\/t.co\/.+/,'');
          console.log(res_text);
          res['text'] = res_text;
          res['name'] = tweets[i].user.screen_name;
          var img_url = tweets[i].extended_entities.media[0].media_url;
          res['img'] = img_url;
          imgURL.push(img_url);

          storage.setItemSync('img_URL', imgURL);
          results.push(res);
          storage.setItemSync('mixedJSON', results);
          var descOptions = {
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

          /*var recogOptions = {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': ''
            },
            uri: 'https://westus.api.cognitive.microsoft.com/vision/v1.0/recognize',
            qs: {
              maxCandidates: 1
            },
            body: {
              url: img_url
            },
            json: true // Automatically stringifies the body to JSON
          };*/

          rp(descOptions)
            .then(function(parsedBody) {
              descr.push(parsedBody.description.captions[0]);
              storage.setItemSync('desc', descr);
              // console.log(descr);
            })
            .catch(function(err) {
              throw err;
            });

          /*rp(recogOptions)
            .then(function(parsedBody) {
              descr.push(parsedBody.description.captions[0]);
              storage.setItemSync('recognize', );
              console.log(parsedBody);
            })
            .catch(function(err) {
              throw err;
            });*/
        }
      }
    }
  });


  var tweetArr = storage.getItemSync('name');
  var desc = storage.getItemSync('desc');
  var img_urls = storage.getItemSync('img_URL');
  var mixed = storage.getItemSync('mixedJSON');
  console.log(mixed);
  desc.forEach( function(element, index) {
    // mixed[index]['desc'] = desc[index];
    console.log(desc[index]);
  });
  /*console.log("Changed");
  console.log(mixed);*/

  res.render('index.ejs', {
    tweetArr: tweetArr,
    desc: desc,
    img_urls: img_urls,
    mixed: mixed
  });

});

app.listen(port);
console.log('The magic happens on port ' + port);
