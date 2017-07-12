Template.tagDisplay.events({

    'click .tag-delete': function() {
        Meteor.call('removeTag', this._id);
    }
});