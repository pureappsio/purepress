Template.podcast.events({

    'click #save-podcast': function() {

        Meteor.call('insertMeta', {
            value: $('#podcast-title').val(),
            type: 'podcastTitle'
        });

        Meteor.call('insertMeta', {
            value: $('#podcast-description').val(),
            type: 'podcastDescription'
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-summary').val(),
            type: 'itunesSummary'
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-author').val(),
            type: 'itunesAuthor'
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-image').val(),
            type: 'itunesImage'
        });

        Meteor.call('insertMeta', {
            value: $('#itunes-subtitle').val(),
            type: 'itunesSubtitle'
        });

    }

});
