var
	express = require('express'),
	memStore = express.session.MemoryStore,
	dust = require('express-dust'),
	faye = require('faye'),
	bayeux = new faye.NodeAdapter({
		mount:    '/faye',
		timeout:  45
	}),
	app = express.createServer();
bayeux.attach(app);


//--------------
// Config
//--------------
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'zneak170154', store: memStore({reapInterval: 60*60*24*7})}));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res, next){
		if (req.accepts('html')) {
			res.status(404);
			res.render('404', { url: req.url });
			return;
		}
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}
		res.type('txt').send('Not found');
	});
	app.use(function(err, req, res, next){
		res.status(err.status || 500);
		res.render('500', { error: err });
	});
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.dynamicHelpers({
	session: function(req, res){
		return req.session;
	},
	user: function(req, res){
		return req.session.user;
	},
	flash: function(req, res){
		var msg = req.flash();
		return msg;
	}
});

dust.makeBase({
	copy: 'Made by <a href="http://nickswider.com/">Nick Swider</a>.'
});

var options = {db: {type: 'memory'}};


//-------------------
// Auth Helpers
//-------------------
function requiresLogin(req, res, next){
	if(req.session.user){
		next();
	}else{
		res.redirect('/login?next='+req.url);
	}
}



//-------------------
// Routes
//-------------------

//=== General
app.get('/', requiresLogin, function(req, res, next) {
	res.render('index', {
		title: 'Member Home'
	});
});
app.get('/host', requiresLogin, function(req, res, next) {
	res.render('host', {
		title: 'Host Page'
	});
});


//=== Auth
app.get('/login', function(req, res, next) {
	res.render('login', { next: req.query.next || '/' });
});
app.post('/login', function(req, res, next) {
	if (req.body.user) {
		req.session.regenerate(function(){
			req.session.user = req.body.user;
			res.redirect(req.body.next+'?fromLogin=true');
		});
	} else {
		req.flash("warn", "No username supplied.");
		res.redirect('/login?next='+req.body.next);
	}
});
app.get('/logout', function(req, res){
	req.session.destroy(function(){
		res.redirect('/');
	});
});


//-------------------
// Log Pub/Sub
//-------------------
bayeux.getClient().subscribe('/buzz', function(msg) {
	console.log("> Buzz from "+msg.user);
});
bayeux.getClient().subscribe('/buzz', function(msg) {
	console.log("> Buzzers reset");
});


//-------------------
// Start Server
//-------------------
var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
