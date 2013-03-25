// namespace and globals
var wom = (function(){
	"use strict";

	var dev = window.location.hostname === 'localhost' ? 'dev-' : '';
	var user, 
		routines,
		chosen,
		dbUrl = 'https://' + dev + 'workout-o-matic.firebaseio.com/';

	return {
		user: user,
		dbUrl: dbUrl
	};
})();