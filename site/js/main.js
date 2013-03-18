(function(){
	"use strict";
	// PRIMITIVE NAMESPACE
	var wom = window.wom || {};

	// LOCAL GLOBALS
	var wod = wom.wod;
	console.log('WOM', wom);

	var myWorkouts;

	var NUM_LOOKUPS = 2;
	var workoutTpl = '<input type="hidden" id="routineId" value="<%= id %>" />' +
		'<%= description %>' +
		'<% if (typeof source !== "undefined" && source) { %> <br /><a href="<%= source %>" target="_blank">Source</a><% } %>';
	var workoutTplFn = _.template(workoutTpl);

	// FUNCTIONS
	var init = function() {
		initControls();
		wom.auth.init(getUserWorkouts);
		getRoutines();
		$('body').css('visibility', 'visible');
	};

	var initControls = function() {
		$('.wod-container select').change(chooseWod);
		$('#workout-notes #save-btn').click(saveWorkout);
	};

	var chooseWod = function(event) {
		var wodId = $(this).val();
		displayWod(wodId);
	};

	var saveWorkout = function(event) {
		if (event) event.preventDefault();
		var w = new wom.Workout({
			routineId: wod.id,
			duration: $('#duration').val(),
			endingHeartRate: $('#ending-heart-rate').val(),
			notes: $('#notes').val(),
			difficulty: $('#difficulty').val()// ($('#difficulty').val() === 'null') ? '' : $('#difficulty').val()
		});

		console.log('Workout', w);
		wom.user.get('workouts').add(w.toJSON());
		var view = new wom.HistoryRow({model: w}).render();

		// clear form
		$('#duration').val('');
		$('#ending-heart-rate').val('');
		$('#notes').val('');
		$('#difficulty').val('');

		return w;
	};
	window.saveWorkout = saveWorkout; // TODO remove

	var getRoutines = function() {
		wom.routines = new wom.RoutineList();
		wom.routines.firebase.once('value', function(snapshot){
			console.log('routines loaded', snapshot);
			dataLoaded();
		});
	};

	var getUserWorkouts = function() {
		var workouts = wom.user.get('workouts');
		workouts.firebase.once('value', function(snapshot){
			workouts.each(function(item, i){
				var view = new wom.HistoryRow({model: item});
				view.render();
			});
			dataLoaded();
		});
	};

	var dataLoaded = function() {
		console.log('in dataLoaded', NUM_LOOKUPS, 'wom.routines.length:', (wom.routines && wom.routines.length));
		NUM_LOOKUPS--;
		if (NUM_LOOKUPS === 0) { afterDataLoaded(); }
	};

	var afterDataLoaded = function() {
		var $sel = $('.wod-container select');
		wom.routines.each(function(rout){
			var $option = $('<option />').val(rout.get('id')).text(rout.get('title'));
			$sel.append($option);
		});

		wod = getWod();
		wom.wod = wod;
		console.log('WORKOUT:', (wod && wod.toJSON()));

		if (wod) {
			$sel.val(wod.get('id'));
			displayWod(wod);
		}

		$('.hide-on-data').hide();
		$('.show-on-data').removeClass('start-hidden');
	};

	var displayWod = function(wod) {
		if (typeof wod === 'string') {
			wod = wom.routines.get(wod);
		}
		if (wod) {
			$('#wod').html(workoutTplFn(wod.toJSON()));
		} else {
			console.warn('Unable to put workout in page.', wod);
		}
	};

	var getWod = function() {
		var filtered = wom.routines.filter(function(item){
			return !item.get('run') && item.get('type') !== 'Flexibility';
		});
		var index = Math.floor(Math.random()*filtered.length);
		var selected = filtered[index];
		return selected;
	};

	$(init);
})();

