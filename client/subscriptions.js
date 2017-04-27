// Tracker
Tracker.autorun(function() {
    Meteor.subscribe('userPosts');
    Meteor.subscribe('userPages');
    Meteor.subscribe('userElements');
    Meteor.subscribe('userMetas');
    Meteor.subscribe('userMenus');
    Meteor.subscribe('userNetworks');
    Meteor.subscribe('userCaches');
    Meteor.subscribe('userBoxes');
    Meteor.subscribe('userProducts');
    Meteor.subscribe('userCategories');
    Meteor.subscribe('userPricing');
    Meteor.subscribe('allUsers');
    Meteor.subscribe('userStats');
    Meteor.subscribe('userIntegrations');
    Meteor.subscribe('files.images.all');
    // Meteor.subscribe('allJobs');
});
