Template.categoryDisplay.events({

    'click .category-delete': function() {
        Meteor.call('removeCategory', this._id);
    }
});