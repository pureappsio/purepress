Meteor.methods({

    insertProduct: function(product) {
        console.log(product);
        Products.insert(product);
    },
    deleteProduct: function(productId) {
        Products.remove(productId);
    },
    getSalesSummary: function(limitDate) {

        // Get integration
        if (Integrations.findOne({ type: 'purecart' })) {

            var integration = Integrations.findOne({ type: 'purecart' });

            // Get lists
            var url = "https://" + integration.url + "/api/earnings?key=" + integration.key;
            url += '&from=' + limitDate + '&to=' + new Date();

            console.log(url);

            try {
                var answer = HTTP.get(url);
                return answer.data.earnings;
            } catch (error) {
                return 0;
            }


        } else {
            return [];
        }

    },

});
