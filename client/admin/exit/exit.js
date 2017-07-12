Template.exit.onRendered(function() {

    Meteor.call('getListSequences', function(err, sequences) {

        $('#exit-sequence').empty();

        for (l = 0; l < sequences.length; l++) {
            $('#exit-sequence').append($('<option>', {
                value: sequences[l]._id,
                text: sequences[l].name
            }));
        }

        if (Metas.findOne({ type: 'exitSequence' })) {
            var value = Metas.findOne({ type: 'exitSequence' }).value;
            $('#exit-sequence').val(value);
        }

    });

    $('#exit-content').summernote({
        minHeight: 100
    });

    if (Metas.findOne({ type: 'exitContent' })) {
        var value = Metas.findOne({ type: 'exitContent', userId: Meteor.user()._id }).value;
        $('#exit-content').summernote('code', value);
    }

    if (Metas.findOne({ type: 'exitStatus' })) {
        var value = Metas.findOne({ type: 'exitStatus', userId: Meteor.user()._id }).value;
        $('#activate-intent').val(value);
    }

});

Template.exit.events({

    'click #activate-intent': function() {

        // Insert Metas
        Meteor.call('insertMeta', {
            value: $('#intent-status :selected').val(),
            type: 'exitStatus',
            userId: Meteor.user()._id
        });

    },
    'click #save-intent': function() {

        // Insert Metas
        Meteor.call('insertMeta', {
            value: $('#exit-title').val(),
            type: 'exitTitle',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#exit-button').val(),
            type: 'exitButton',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#exit-content').summernote('code'),
            type: 'exitContent',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#exit-sequence :selected').val(),
            type: 'exitSequence',
            userId: Meteor.user()._id
        });

    }

});
