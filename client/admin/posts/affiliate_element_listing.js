Template.affiliateElementListing.events({

  'click .affiliate-delete': function() {
  	Meteor.call('removeElement', this._id);
  }

});
