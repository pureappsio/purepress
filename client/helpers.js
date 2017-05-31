Template.registerHelper("truncate", function(number) {
    return number.toFixed(0);
});

Template.registerHelper("truncateTwo", function(number) {
    return number.toFixed(2);
});

Template.registerHelper("variationColor", function(variation) {
    variation = parseInt(variation);
    if (variation > 0) {
        return 'green';
    } else {
        return 'red';
    }
});

Template.registerHelper("variationDirection", function(variation) {
    variation = parseInt(variation);
    if (variation > 0) {
        return 'up';
    } else {
        return 'down';
    }
});

Template.registerHelper("getMeta", function(meta) {
    return Metas.findOne({ type: meta }).value;
});

Template.registerHelper("getStatistic", function(meta) {
    return Statistics.findOne({ type: meta }).value;
});

Template.registerHelper("isAdmin", function() {
    console.log(Meteor.user());
    if (Meteor.user()) {
        if (Meteor.user().role == 'admin') {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }

});
