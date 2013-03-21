(function(){
	"use strict";
	// PRIMITIVE NAMESPACE
	var wom = window.wom || {};

	// LOCAL GLOBALS
	var wod = wom.wod;
	console.log('WOM', wom);

	var NUM_LOOKUPS = 2;
	var workoutTpl = $('#wod-tpl').text();
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
		$('#start-btn').click(startWorkout);
		$('#end-btn').click(endWorkout);
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

		reset();
		return w;
	};

	var startTime, timerInterval;
	var startWorkout = function() {
		startTime = new Date();
		timerInterval = setInterval(function(){
			var time = new Date() - startTime;
			$('#timer').text(formatTime(time));
		}, 1000);
		$('#start-btn').hide();
		$('#in-progress').show();
	};

	var reset = function() {
		// clear form
		$('#duration').val('');
		$('#ending-heart-rate').val('');
		$('#notes').val('');
		$('#difficulty').val('');

		$('#controls').show();
		$('#workout-notes').hide();
		$('#start-btn').show();
		$('#in-progress').hide();
	};

	var endWorkout = function() {
		clearInterval(timerInterval);
		var duration = new Date() - startTime;
		$('#duration').val(formatTime(duration));
		$('#controls').hide();
		$('#workout-notes').show();
	};

	var formatTime = function(ms) {
		var s = Math.floor(ms/1000)%60;
		var m = Math.floor(ms/1000/60)%60;
		var h = Math.floor(ms/1000/60/60)%60;
		return h + 'h ' + m + 'm ' + s + 's';
	};


	var getRoutines = function() {
		wom.routines = new wom.RoutineList();
		wom.routines.firebase.once('value', function(snapshot){
			console.log('routines loaded', snapshot);
			dataLoaded();
		});
	};

	var getUserWorkouts = function() {
		if (!wom.user) {
			dataLoaded();
		} else {
			var workouts = wom.user.get('workouts');
			workouts.firebase.once('value', function(snapshot){
				workouts.each(function(item, i){
					var view = new wom.HistoryRow({model: item});
					view.render();
				});
				dataLoaded();
			});
		}
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

	window.addHistory = function() {
		var workouts = wom.user.get('workouts');
		_(dataHist).each(function(item, i) {
			var title = item.activity;
			var description = '';
			if (title.indexOf('Yoga Journal: ') !== 0) {
				var parts = item.activity.split(': ');
				title = parts[0];
				description = parts[1];
			}

			console.log(i, title);

			var exclude = ['--'];
			if (_(exclude).indexOf(title) === -1) {
				var searchResult = wom.routines.where({title : title});
				if (searchResult.length) {
					// console.log(searchResult[0].id, searchResult.length);
					var r = searchResult[0];
					var obj = {
						routineId: r.id,
						datetime: Date.parse(item.date).toUTCString(),
						notes: item.notes
					};
					console.log(obj)
					workouts.add(obj);

				} else {
					console.warn('no routine found');
				}
			}
		});
	}

	$(init);
})();

