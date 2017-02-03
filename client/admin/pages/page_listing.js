Template.pageListing.events({

    // 'click .delete-page': function() {
    //     // Meteor.call('removePost', this._id);
    //     $('#deleteConfirm-' + this._id).modal('show');
    // },
    'click .delete-page-modal': function() {
        Meteor.call('removePage', this._id, function(err, data) {
            $('#deleteConfirm-' + this._id).modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });

    }

});
