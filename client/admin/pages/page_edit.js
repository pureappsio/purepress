Template.pageEdit.onRendered(function() {

    // Init editor
    $('#page-content').summernote({
        height: 400 // set editor height
    });

    // Init post content
    if (this.data.content) {
        $('#page-content').summernote('code', this.data.content);
    }

});

Template.pageEdit.helpers({

    elements: function() {
        return Elements.find({ pageId: this._id }, { sort: { order: 1 } });
    }

});

Template.pageEdit.events({

    'click #edit-page': function() {

        var page = {
            title: $('#page-title').val(),
            url: $('#page-url').val(),
            cached: false,
            content: $('#page-content').summernote('code'),
            userId: Meteor.user()._id,
            _id: this._id,
            type: this.type
        }

        Meteor.call('editPage', page, function(err, data) {

            // Fade out saved message
            $("#saved").show();
            $("#saved").fadeOut("slow", function() {
                // Animation complete.
            });
            
        });

    }

});
