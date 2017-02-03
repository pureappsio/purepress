Template.productListing.helpers({

    pageName: function() {

        return Pages.findOne(this.pageId).title;

    }

});

Template.productListing.events({

    'click .delete-product': function() {

        Meteor.call('deleteProduct', this._id);

    }

});
