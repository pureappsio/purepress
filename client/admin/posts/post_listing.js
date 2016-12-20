Template.postListing.events({

  'click .delete-post': function() {
  	Meteor.call('removePost', this._id);
  }

});

Template.postListing.helpers({

  statusLabel: function() {
  	if (this.status) {
  		if (this.status == 'draft') {
  			return 'warning';
  		}
  		if (this.status == 'published') {
  			return 'primary';
  		}
  	}

  }

});