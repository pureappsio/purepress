Template.stepListing.events({

    'change .step-order': function() {
        Meteor.call('editElement', this._id, 'order', parseInt($('#step-order-' + this._id).val()));
    },
    'click .step-delete': function() {
        Meteor.call('removeElement', this._id);
    }
});

Template.stepListing.onRendered(function() {

    if (this.data._id) {

        var elementId = this.data._id;

        // Init editors
        $('#step-description-' + elementId).summernote({
            callbacks: {
                onChange: function() {
                    Meteor.call('editElement', elementId, 'description', $('#step-description-' + elementId).summernote('code'));
                }
            }
        });
    }

    // Init data
    if (this.data.description) {
        $('#step-description-' + this.data._id).summernote('code', this.data.description);
    }

});
