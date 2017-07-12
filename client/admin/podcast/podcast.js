Template.podcast.events({

    'click #save-podcast': function() {

        Meteor.call('insertMeta', {
            value: $('#podcast-title').val(),
            type: 'podcastTitle',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#podcast-description').val(),
            type: 'podcastDescription',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-summary').val(),
            type: 'itunesSummary',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-author').val(),
            type: 'itunesAuthor',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-image').val(),
            type: 'itunesImage',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-subtitle').val(),
            type: 'itunesSubtitle',
            userId: Meteor.user()._id
        });

    }

});

Template.podcast.helpers({

    recordings: function() {
        return Recordings.find({userId: Meteor.user()._id});
    }

});
