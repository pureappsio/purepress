Template.affiliateElementListing.events({

    'click .affiliate-pic-save': function() {

        Meteor.call('editElement', this._id, 'picture', Session.get('affiliatePictureNew'));
    },
    'click .affiliate-delete': function() {
        Meteor.call('removeElement', this._id);
    },

    'change .rank': function() {
        Meteor.call('editElement', this._id, 'rank', $('#rank-' + this._id).val());
    },
    'change .rating': function() {
        Meteor.call('editElement', this._id, 'rating', $('#rating-' + this._id).val());
    },
    'change .title': function() {
        Meteor.call('editElement', this._id, 'title', $('#title-' + this._id).val());
    },
    'change .link': function() {
        Meteor.call('editElement', this._id, 'link', $('#link-' + this._id).val());
    },
    'change .description': function() {
        console.log('Change');
        Meteor.call('editElement', this._id, 'description', $('#description-' + this._id).summernote('code'));
    },
    'change .short-description': function() {
        Meteor.call('editElement', this._id, 'shortDescription', $('#short-description-' + this._id).summernote('code'));
    }

});

Template.affiliateElementListing.onRendered(function() {

    if (this.data._id) {

        var elementId = this.data._id;

        // Init editors
        $('#description-' + elementId).summernote({
            callbacks: {
                onChange: function() {
                    Meteor.call('editElement', elementId, 'description', $('#description-' + elementId).summernote('code'));
                }
            }
        });

        $('#short-description-' + elementId).summernote({
            callbacks: {
                onChange: function() {
                    Meteor.call('editElement', elementId, 'shortDescription', $('#short-description-' + elementId).summernote('code'));
                }
            }
        });
    }

    // Init data
    if (this.data.description) {
        $('#description-' + this.data._id).summernote('code', this.data.description);
    }

    if (this.data.shortDescription) {
        $('#short-description-' + this.data._id).summernote('code', this.data.shortDescription);
    }

});
