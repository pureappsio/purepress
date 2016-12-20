Template.pricing.events({

    'click #create-pricing': function() {

        // Build box
        var pricing = {
            name: $('#option-name').val(),
            price: $('#option-price').val(),
            button: $('#option-button').val(),
            link: $('#option-link').val(),
            features: [$('#feature-1').val(),
                $('#feature-2').val(),
                $('#feature-3').val(),
                $('#feature-4').val(),
                $('#feature-5').val(),
                $('#feature-6').val()
            ]
        }

        // Save
        Meteor.call('createPricing', pricing);

    }

});

Template.pricing.helpers({

    pricingElements: function() {
        return Pricing.find({});
    }

});
