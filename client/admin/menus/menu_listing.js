Template.menuListing.events({

  'click .menu-delete': function() {
  	Meteor.call('removeMenuElement', this._id);
  },
  'click .menu-plus': function() {
  	Meteor.call('changeOrderMenu', this._id, 1);
  },
  'click .menu-minus': function() {
  	Meteor.call('changeOrderMenu', this._id, -1);
  }

});
