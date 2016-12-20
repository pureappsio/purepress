Template.boxElement.events({

	'click .box-delete': function() {

		// Save
		Meteor.call('deleteBox', this._id);

	}

});
