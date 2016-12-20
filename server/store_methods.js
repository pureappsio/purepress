Meteor.methods({

    insertProduct: function(product) {
        console.log(product);
        Products.insert(product);
    }

});
