Meteor.startup(function() {

    // Flush cashe
    Meteor.call('flushCache');

    // Remove all visitors
    Visitors.remove({});

    // Create users if needed
    Meteor.call('createUsers');

});
