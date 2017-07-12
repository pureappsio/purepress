Template.recording.helpers({

    audioUrl: function() {
        return this.recordingUrl;
    }

});

Template.recording.events({

    'click .delete-recording': function() {
        Meteor.call('deleteRecording', this._id);
    }

});
