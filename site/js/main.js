(function(){
	"use strict";
	var wom = {}; // primitive namespace

	var routines, workoutId;
	var dbUrl = 'https://workout-o-matic.firebaseio.com/';
	var appRef = new Firebase(dbUrl);

	var routinesRef = new Firebase(dbUrl + 'routines');

	wom.Routine = Backbone.Model.extend({});

	wom.RoutineList = Backbone.Firebase.Collection.extend({
		model: wom.Routine,
		firebase: dbUrl + 'routines'
	});



	var NUM_LOOKUPS = 2;
	var workoutTpl = '<input type="hidden" id="routineId" value="<%= id %>" />'
		+ '<%= description %>'
		+ '<% if (typeof source !== "undefined" && source) { %> <a href="<%= source %>" target="_blank">Source</a><% } %>';
	var workoutTplFn = _.template(workoutTpl);

	var init = function() {
		getRoutines();
		getUserWorkouts();
	};

	var getRoutines = function() {
		routines = new wom.RoutineList();
		routines.firebase.on('value', function(snapshot){
			console.log('data loaded', snapshot);
			dataLoaded();
		});

		// routines.on('changed', dataLoaded);
		console.log(routines);
		window.routines = routines;
		// routinesRef.on('value', function(snapshot){
		// 	routines = snapshot.val();
		// 	dataLoaded();
		// });
	};

	var getUserWorkouts = function() {
		dataLoaded();
	};

	var dataLoaded = function() {
		console.log('in dataLoaded', NUM_LOOKUPS, 'routines.length:', routines.length);
		NUM_LOOKUPS--;
		if (NUM_LOOKUPS === 0) { afterDataLoaded(); }
	};

	var afterDataLoaded = function() {
		workoutId = getWorkoutId();
		var wod = routines.get(workoutId).toJSON();
		console.log('WORKOUT:', wod);
		$('#wod-spinner').hide();
		$('#wod').html(workoutTplFn(wod));
	};

	var getWorkoutId = function() {
		var keys = routines.pluck('id');
		var filteredKeys = _(keys).filter(function(key){
			var item = routines.get(key);
			return !item.get('run') && item.get('type') !== 'Flexibility';
		});
		var index = Math.floor(Math.random()*filteredKeys.length);
		return filteredKeys[index];
	};

	$(init);
})();

