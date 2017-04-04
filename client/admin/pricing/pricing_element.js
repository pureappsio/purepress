Template.pricingElement.events({

    'click .pricing-delete': function() {

        // Save
        Meteor.call('deletePricing', this._id);

    },
    'mouseup .modify-element, change .modify-element': function() {

        var pricing = this;

        // Update
        pricing.name = $("#name-" + this._id).val();
        pricing.price = $("#price-" + this._id).val();
        pricing.button = $("#button-" + this._id).val();
        pricing.link = $("#link-" + this._id).val();

        // Save
        Meteor.call('updatePricing', pricing);

    }

});
