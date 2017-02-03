Template.postListing.events({

    // 'click .delete-post': function() {
    //     // Meteor.call('removePost', this._id);
    //     $('#deleteConfirm-' + this._id).modal('show');
    // },
    'click .delete-post-modal': function() {
        Meteor.call('removePost', this._id, function(err, data) {
            $('#deleteConfirm-' + this._id).modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });

    }

});

Template.postListing.helpers({

    isLocalised: function() {

        var localised = true;

        if (this.html) {

            if (this.html['FR'] && this.html['CA'] && this.html['GB']) {
                localised = true;
            } else {
                localised = false;
            }

        } else {
            localised = false;
        }

        return localised;

    },
    statusLabel: function() {
        if (this.status) {
            if (this.status == 'draft') {
                return 'warning';
            }
            if (this.status == 'published') {
                return 'primary';
            }
        }

    },
    postCategoryDisplay: function() {
        return Categories.findOne(this.postCategory).name;
    },
    statusBadLinks: function() {
        if (this.badLinks) {
            if (this.badLinks == 0) {
                return 'success';
            } else {
                return 'danger';
            }
        } else {
            return 'success';
        }
    },
    areBadLinks: function() {
        if (this.badLinks) {

            if (this.badLinks > 0) {
                return true;
            }

        }

    }

});
