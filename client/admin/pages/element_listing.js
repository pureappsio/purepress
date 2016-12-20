Template.elementListing.events({

  'click .element-delete': function() {
  	Meteor.call('removeElement', this._id);
  },
  'click .page-plus': function() {
  	Meteor.call('changeOrderPage', this._id, 1);
  },
  'click .page-minus': function() {
  	Meteor.call('changeOrderPage', this._id, -1);
  }

});
