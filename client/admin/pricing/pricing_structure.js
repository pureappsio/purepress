Template.pricingStructure.events({

    'click .pricing-structure-delete': function() {

        // Save
        Meteor.call('deletePricing', this._id);

    },
    'click .pricing-plus': function() {
        Meteor.call('changeOrderPricing', this._id, 1);
    },
    'click .pricing-minus': function() {
        Meteor.call('changeOrderPricing', this._id, -1);
    }

});
