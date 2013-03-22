// PRIMITIVE NAMESPACE
var wom = window.wom || {};
wom.auth = (function(){
	"use strict";

	var appRef = new Firebase(wom.dbUrl);
	var authClient;
	var loginCallback;
	var user = wom.user;

	var init = function(cb) {
		loginCallback = cb;
		$('.user-mgt button').click(doLogin);
		authClient = new FirebaseAuthClient(appRef, processLogin);
	};

	var doLogin = function(event) {
		var label = $(this).text();
		authClient.login(label.toLowerCase());
	};

	var processLogin = function(error, argUser) {
		user = argUser;
		if (error) {
			// an error occurred while attempting login
			console.warn(error);
		} else if (user) {
			// user authenticated with Firebase
			user = new wom.User(argUser);
			console.log('User ID: ' + user.id + ', Provider: ' + user.get('provider'));
			var avatar = '<img src="' + user.get('profile_image_url') + '" class="avatar" alt="" />';
			var name = user.get('displayName').split(' ')[0];
			$('.user-mgt .has-user').html(avatar + ' Hello ' + name + '.');
		} else {
			// user is logged out
		}
		wom.user = user;
		toggleUserStuff();
		$('.show-on-auth').show('slow');
		if (loginCallback) loginCallback(user);
	};

	var toggleUserStuff = function() {
		console.log('USER', user);
		$('.user-auth').hide();
		if (user) {
			$('.has-user').show();
		} else {
			$('.no-user').show();
		}
	};

	var logout = function() {
		authClient.logout();
		wom.user = null;
		toggleUserStuff();
	};


	return {
		init: init,
		logout: logout
	};
})();