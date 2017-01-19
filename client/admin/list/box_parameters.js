Template.boxParameters.onRendered(function() {

    // Init lists
    if (this.data) {
        if (this.data.sequence) {
            sequence = this.data.sequence;
        }
    }

    Meteor.call('getListSequences', function(err, sequences) {

        $('#box-sequence').empty();

        for (l = 0; l < sequences.length; l++) {
            $('#box-sequence').append($('<option>', {
                value: sequences[l]._id,
                text: sequences[l].name
            }));
        }

        // Init data
        if (typeof sequence !== 'undefined') {

            // Set sequence
            $('#box-sequence').val(sequence);
        }

    });

    // Init picker
    $('#tags-id').empty();
    $('#tags-id').selectpicker();

    if (this.data) {
        if (this.data.tags) {
            tagsData = this.data.tags;
        }
    }

    Meteor.call('getListTags', function(err, tags) {

        for (i = 0; i < tags.length; i++) {
            $('#tags-id').append($('<option>', {
                value: tags[i]._id,
                text: tags[i].name
            }));
        }

        if (typeof tagsData !== 'undefined') {
            $('#tags-id').val(tagsData);
        }

        // Refresh picker
        $('#tags-id').selectpicker('refresh');

    });

    // Init editor
    $('#box-content').summernote({
        height: 150 // set editor height
    });

    // Init editor
    $('#popup-content').summernote({
        height: 150 // set editor height
    });

    // Init data
    if (this.data) {
        if (this.data.boxContent) {
            $('#box-content').summernote('code', this.data.boxContent);
        }

        if (this.data.popupContent) {
            $('#popup-content').summernote('code', this.data.popupContent);
        }
    }

});
