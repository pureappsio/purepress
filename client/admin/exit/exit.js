Template.exit.onRendered(function() {

    Meteor.call('getListSequences', function(err, sequences) {

        $('#exit-sequence').empty();

        for (l = 0; l < sequences.length; l++) {
            $('#exit-sequence').append($('<option>', {
                value: sequences[l]._id,
                text: sequences[l].name
            }));
        }

    });

    $('#exit-content').summernote({
        minHeight: 100
    });

    if (Metas.findOne({ type: 'exitContent' })) {
        var value = Metas.findOne({ type: 'exitContent' }).value;
        $('#exit-content').summernote('code', value);
    }

});

Template.exit.events({

    'click #activate-intent': function() {

         // Insert Metas
        Meteor.call('insertMeta', {
            value: $('#intent-status :selected').val(),
            type: 'exitStatus'
        });

    },
    'click #save-intent': function() {

        // Insert Metas
        Meteor.call('insertMeta', {
            value: $('#exit-title').val(),
            type: 'exitTitle'
        });

        Meteor.call('insertMeta', {
            value: $('#exit-button').val(),
            type: 'exitButton'
        });

        Meteor.call('insertMeta', {
            value: $('#exit-content').summernote('code'),
            type: 'exitContent'
        });

        Meteor.call('insertMeta', {
            value: $('#exit-sequence :selected').val(),
            type: 'exitSequence'
        });

    }

});
