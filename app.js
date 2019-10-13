const   express = require('express'),
    app = express(),
    mustacheExpress = require('mustache-express'),
    session = require("express-session")({
        secret: 'sessionSecret',
        resave: false,
        saveUninitialized: false,
    }),
    sharedsession = require("express-socket.io-session"),
    server = require('http').createServer(app),
    io = require('./lib/socket');

app.use(express.static(__dirname + '/public'));
app.engine('mustache',mustacheExpress());
app.set('view engine', 'mustache');
app.use(express.static(__dirname + '/node_modules'));
app.use(express.urlencoded({extended: true}));
app.use(session);
io.attach(server);
io.use(sharedsession(session, {
    autoSave:true
}));

app.use('/', function(req, res) {
    req.session.Alpaca_Key_ID = 'YOUR KEY';
    req.session.Alpaca_Secret_ID= 'YOUR SECRET';
    req.session.IsSandboxMode= true;
    req.session.granularity= '1m';
    req.session.currentTicker= 'SPY';

    view = {
        granularity: req.session.granularity,
        currentTicker: req.session.currentTicker
    };
    res.render('platform', view);
});

server.listen(3000);

