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

    tagsName: function() {

        var tags = this.tags;
        tagsName = [];
        for (i in tags) {
            tagsName.push(Tags.findOne(tags[i]));
        }

        return tagsName;

    },

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

                var currentDate = new Date();
                if ((this.creationDate).getTime() < currentDate.getTime()) {
                    return 'primary';
                } else {
                    return 'success';
                }

            }
        }

    },
    statusMessage: function() {
        if (this.status) {

            if (this.status == 'draft') {
                return 'DRAFT';
            }
            if (this.status == 'published') {

                var currentDate = new Date();
                if ((this.creationDate).getTime() < currentDate.getTime()) {
                    return 'PUBLISHED';
                } else {
                    return 'SCHEDULED';
                }

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
