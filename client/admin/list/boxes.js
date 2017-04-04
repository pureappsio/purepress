Template.boxes.onRendered(function() {

});

Template.boxes.events({

	'click #create-box': function() {

        // Build box
        var box = {
            title: $('#box-title').val(),
            sequence: $('#box-sequence :selected').val(),
            boxContent: $('#box-content').summernote('code'),
            popupContent: $('#popup-content').summernote('code'),
            tags: $('#tags-id').val(),
            displayTitle: $('#box-display-title').val()
        }

        // Save
        Meteor.call('createBox', box);

    }

});

Template.boxes.helpers({

    boxesElements: function() {
        return Boxes.find({});
    }

});
