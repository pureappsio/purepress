SyncedCron.config({
    log: false
});

SyncedCron.add({
    name: 'Remove inactive visitors',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 hour');
    },
    job: function() {
        Meteor.call('removeInactiveVisitors');
    }
});
