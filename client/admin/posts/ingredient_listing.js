Template.ingredientListing.events({

    'change .ingredient-order': function() {
        Meteor.call('editElement', this._id, 'order', parseInt($('#ingredient-order-' + this._id).val()) );
    },
    'change .ingredient-description': function() {
        Meteor.call('editElement', this._id, 'description', $('#ingredient-description-' + this._id).val());
    },

    'click .ingredient-delete': function() {
        Meteor.call('removeElement', this._id);
    }

});
