"use strict"

module.exports = function(app) {
	// Error handling
	function errorHandler(err, req, res, next) {
	  res.status(500);
	  console.log(err);
	  res.render('500');
	}

	app.use(errorHandler)
	app.use(function(req, res, next) {
	  res.render('404');
	});
}
