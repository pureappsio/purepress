Meteor.methods({

    insertProduct: function(product) {
        console.log(product);
        Products.insert(product);
    },
    deleteProduct: function(productId) {
        Products.remove(productId);
    }

});
