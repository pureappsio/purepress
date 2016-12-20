Template.boxEdit.onRendered(function() {

});

Template.boxEdit.events({

    'click #edit-box': function() {

        // Build box
        var box = {
            title: $('#box-title').val(),
            sequence: $('#box-sequence :selected').val(),
            boxContent: $('#box-content').summernote('code'),
            popupContent: $('#popup-content').summernote('code'),
            tags: $('#tags-id').val(),
            _id: this._id
        }

        // Save
        Meteor.call('editBox', box);

    }

});

// Template.boxEdit.helpers({

//     boxesElements: function() {
//         return Boxes.find({});
//     }

// });
