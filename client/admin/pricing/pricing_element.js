Template.pricingElement.events({

    'click .pricing-delete': function() {

        // Save
        Meteor.call('deletePricing', this._id);

    }

});
