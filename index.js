var express = require('express');
var logger = require('morgan');
var apicache = require('apicache');
var routes = require('./routes');

var app = express();
var cache = apicache.middleware;


app.use(logger('dev'));
app.set('view engine', 'hbs');

app.get('/', routes.index);
app.get('/api', cache('30 seconds'), routes.apiIndex);

/*app.get('/api/users/:id([0-9]{1,9})', routes.userByID);
app.get('/api/users/:username', routes.userByUsername);
app.get('/api/users', routes.users);*/
app.get('/api/users/:id?', cache('30 seconds'), routes.users);

app.get('/api/frontpage/:id', routes.getFrontPage);
app.get('/api/profilepage/:id', routes.getProfilePage);
app.get('/api/postpage/:id', routes.getPostPage);
app.get('/api/stats/top10postingusers', routes.getTop10PostingUsers);
app.get('/api/stats/userregistrations', routes.getUserRegistrations);
app.get('/api/stats/genderdivision', routes.getGenderDivision);
app.get('/api/stats', routes.getStatistics);

app.get('*', routes.default);

var server = app.listen(3000, function() {
    console.log('Kuulame pordil 3000');
});
