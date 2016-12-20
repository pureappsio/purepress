Template.networkListing.events({

    'click .network-edit': function(event, template) {
        Meteor.call('editNetwork', this._id);
    },
    'click .network-delete': function() {

        Meteor.call('removeNetwork', this._id);

    }

});
