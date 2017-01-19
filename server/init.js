// var myJobs = JobCollection('myJobQueue');
// myJobs.allow({
//     // Grant full permission to any authenticated user
//     admin: function(userId, method, params) {
//         return (userId ? true : false);
//     }
// });


// Meteor.publish('allJobs', function() {
//     return myJobs.find({});
// });

Meteor.startup(function() {

    // Flush cashe
    Meteor.call('flushCache');

    // Render all posts
    // Meteor.call('renderPosts');

    // Create users if needed
    Meteor.call('createUsers');

    // Start jobs
    // myJobs.startJobServer();

});
