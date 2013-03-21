// namespace and globals
var wom = (function(){
	"use strict";
	var user, 
		routines,
		wod,
		dbUrl = 'https://workout-o-matic.firebaseio.com/';

	return {
		user: user,
		dbUrl: dbUrl
	};
})();