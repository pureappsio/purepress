SyncedCron.config({
    log: false
});

SyncedCron.add({
    name: 'Remove inactive visitors',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 7 days');
    },
    job: function() {
        Meteor.call('removeInactiveVisitors');
    }
});

SyncedCron.add({
    name: 'Update statistics',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 hour');
    },
    job: function() {
        Meteor.call('updateStatistics');
    }
});

SyncedCron.add({
    name: 'Spot dead Amazon links',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 day');
    },
    job: function() {
        Meteor.call('spotDeadAmazonLinks');
    }
});
