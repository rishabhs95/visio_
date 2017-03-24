var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var flash    = require('connect-flash');

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



app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.listen(port);
console.log('The magic happens on port ' + port);
