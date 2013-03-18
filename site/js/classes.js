(function(){
	"use strict";
	// PRIMITIVE NAMESPACE
	var wom = window.wom || {};
	var dbUrl = wom.dbUrl;

	// ROUTINE
	wom.Routine = Backbone.Model.extend({
		defaults: {
			run: false,
			title: '',
			description: '',
			source: ''
		},
		validate: function(attributes, options) {
			var result;
			if (!attributes.title) result = 'Title is required';
			if (result) return result;
		}
	});
	wom.RoutineList = Backbone.Firebase.Collection.extend({
		model: wom.Routine,
		firebase: dbUrl + 'routines'
	});


	// USER
	wom.User = Backbone.Model.extend({
		initialize: function(attributes, options){
			if (!attributes.workouts && !this.get('workouts')) {
				var WorkoutList = wom.WorkoutListFactory(attributes.id);
				var wl = new WorkoutList();
				this.set('workouts', wl);
				console.log('user workouts', this, this.get('workouts'));
			}
		},
		logout: function(){ authClient.logout(); },
		addWorkout: function(workout) {
			this.get('workouts').add(workout);
		}
	});
	wom.UserList = Backbone.Firebase.Collection.extend({
		model: wom.User,
		firebase: dbUrl + 'users'
	});


	// WORKOUT
	// a routine done by a user
	wom.Workout = Backbone.Model.extend({
		defaults: {
			routineId: null,
			duration: null,
			endingHeartRate: null,
			notes: null,
			datetime: null,
			difficulty: null
		},
		initialize: function(attributes, options) {
			if (!attributes.datetime) this.set('datetime', new Date().toUTCString());
		},
		validate: function(attributes, options) {
			var result;
			if (!attributes.routineId) result = 'RoutineId is required';
			if (result) return result;
		}
	}); 
	wom.WorkoutListFactory = function(userId) {
		if (!userId) throw new Error('userId is required to create a WorkoutList class.');
		var WorkoutList = Backbone.Firebase.Collection.extend({
			model: wom.Workout,
			firebase: dbUrl + 'users/' + userId + '/workouts'
		});
		return WorkoutList;
	};


	wom.HistoryRow = Backbone.View.extend({
		tagName: 'tr',
		template: _.template($('#history-item-tpl').text()),
		render: function(){
			// lookup the associated routine via model.routineId
			var routine = wom.routines.get(this.model.get('routineId'));

			// data adjustments
			var date = Date.parse(this.model.get('datetime')).toString('M/d H:mm');

			// populate a object for our template
			var viewObj = this.model.attributes; // this.model should be a wom.Workout object

			// add other values
			viewObj.date = date;
			viewObj.title = routine.get('title');
			viewObj.description = routine.get('description');
			$('.history-table tbody').prepend(this.template(viewObj));
		}
	});

})();

