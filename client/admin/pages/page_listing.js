Template.pageListing.events({

  'click .delete-page': function() {
  	Meteor.call('removePage', this._id);
  }

});