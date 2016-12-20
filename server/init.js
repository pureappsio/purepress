Meteor.startup(function() {

	// Flush cashe
	Meteor.call('flushCache');

	// Create users if needed
	Meteor.call('createUsers');

});
