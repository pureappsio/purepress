import Images from '../imports/api/files';

Meteor.publish("userPosts", function() {
    return Posts.find({});
});

Meteor.publish("userPages", function() {
    return Pages.find({});
});

Meteor.publish("userElements", function() {
    return Elements.find({});
});

Meteor.publish("userRecordings", function() {
    return Recordings.find({});
});

Meteor.publish("userNetworks", function() {
    return Networks.find({});
});

Meteor.publish("userMetas", function() {
    return Metas.find({});
});

Meteor.publish("userMenus", function() {
    return Menus.find({});
});

Meteor.publish("userCaches", function() {
    return Caches.find({});
});

Meteor.publish("userBoxes", function() {
    return Boxes.find({});
});

Meteor.publish("userProducts", function() {
    return Products.find({});
});

Meteor.publish("userCategories", function() {
    return Categories.find({});
});

Meteor.publish("userTags", function() {
    return Tags.find({});
});

Meteor.publish("userPricing", function() {
    return Pricing.find({});
});

Meteor.publish("userIntegrations", function() {
    return Integrations.find({});
});

Meteor.publish("userVisitors", function() {
    return Visitors.find({});
});

Meteor.publish("userStatistics", function() {
    return Statistics.find({});
});

// Meteor.publish("userStats", function() {
//     return Stats.find({});
// });

Meteor.publish("allUsers", function() {
    return Meteor.users.find({});
});

Meteor.publish('files.images.all', function() {
    return Images.find().cursor;
});
