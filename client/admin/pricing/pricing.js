Template.pricing.events({

    'click #create-pricing-element': function() {

        // Build box
        var pricing = {
            name: $('#element-name').val(),
            explainer: $('#element-explainer').val(),
            type: 'structure'
        }

        // Save
        Meteor.call('createPricing', pricing);

    },

    'click #create-pricing': function() {

        // Build box
        var pricing = {
            name: $('#option-name').val(),
            price: $('#option-price').val(),
            button: $('#option-button').val(),
            link: $('#option-link').val(),
            type: 'element'
        }

        // Get features
        var structures = Pricing.find({type: 'structure'}).fetch();
        var features = {};
        for (i in structures) {
            features[structures[i]._id] = $('#' + structures[i]._id).val();
        }

        pricing.features = features;

        // Save
        Meteor.call('createPricing', pricing);

    }

});

Template.pricing.helpers({

    pricingElements: function() {
        return Pricing.find({ type: 'element' }, { sort: { order: 1 } });
    },
    pricingStructures: function() {
        return Pricing.find({ type: 'structure' }, { sort: { order: 1 } });
    }

});
