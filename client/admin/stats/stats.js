Template.stats.events({

    'click #harmonize': function() {
        Meteor.call('harmonizeDates');
    }

});

Template.stats.helpers({

    liveVisitors: function() {

        return Visitors.find({ date: { $gte: Session.get("limitDate") } }).count();

    },
    podcastEpisodes: function() {
        return Posts.find({ podcastFileId: { $exists: true } })
    },
    arePodcasts: function() {
        if (Posts.findOne({ podcastFileId: { $exists: true } })) {
            return true;
        } else {
            return false;
        }
    },
    visitors: function() {
        return Session.get('visits');
    },
    mobile: function() {
        return (Session.get('mobileVisits') / Session.get('visits') * 100).toFixed(1) + '%';
    },
    affConversions: function() {

        return (Session.get('affVisits') / Session.get('visits') * 100).toFixed(1) + '%';

    },
    listConversions: function() {

        return (Session.get('subscribed') / Session.get('visits') * 100).toFixed(1) + '%';

    },
    postsWithBox: function() {

        return Session.get('posts');

    },
    areConversions: function() {

        if (Session.get('posts')) {

            if (Session.get('posts').length > 0) {
                return true;
            }

        }

    },
    areAffiliates: function() {

        if (Session.get('affiliatePosts')) {

            if (Session.get('affiliatePosts').length > 0) {
                return true;
            }

        }

    },
    affiliatePosts: function() {

        return Session.get('affiliatePosts');

    },
    posts: function() {

        return Session.get('bestPosts');

    }

});

Template.stats.onRendered(function() {

    Meteor.call('getBestConvertingPosts', function(err, data) {
        Session.set('posts', data);
    });

    Meteor.call('getBestVisitedPosts', function(err, data) {
        Session.set('bestPosts', data);
    });

    Meteor.call('getBestAffiliatePosts', function(err, data) {
        Session.set('affiliatePosts', data);
    });

    Session.set("limitDate", new Date(new Date().getTime() - 60 * 1000));
    Meteor.setInterval(function() {
        Session.set("limitDate", new Date(new Date().getTime() - 60 * 1000));
    }, 10000);

    Meteor.call('getAllVisits', function(err, data) {
        Session.set('visits', data);
    });

    Meteor.call('getMobileVisits', function(err, data) {
        Session.set('mobileVisits', data);
    });

    Meteor.call('getAffVisits', function(err, data) {
        Session.set('affVisits', data);
    });

    Meteor.call('getSubscribed', function(err, data) {
        Session.set('subscribed', data);
    });

    Meteor.call('getGraphData', 'visit', function(err, graphData) {

        var ctx = document.getElementById("views-chart");

        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: graphData,
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }]
                }
            }
        });

    });

    Meteor.call('getGraphData', 'affiliateClick', function(err, graphData) {

        var affChart = document.getElementById("affiliate-chart");
        console.log(graphData);

        var myAffChart = new Chart(affChart, {
            type: 'line',
            data: graphData,
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }]
                }
            }
        });

    });

    Meteor.call('getGraphData', 'subscribe', function(err, graphData) {

        var subChart = document.getElementById("subscribed-chart");

        var myLineChart = new Chart(subChart, {
            type: 'line',
            data: graphData,
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }]
                }
            }
        });

    });

    Meteor.call('getOriginGraphData', function(err, graphData) {

        var ctx = document.getElementById("origin-chart");

        var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'Visits by Origin'
                }
            }
        });

    });

    Meteor.call('getSocialGraphData', function(err, graphData) {

        var socialChart = document.getElementById("social-chart");

        var myPieChart = new Chart(socialChart, {
            type: 'bar',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'Social Visits'
                }
            }
        });

    });

    Meteor.call('getCountryGraph', function(err, graphData) {

        var countriesChart = document.getElementById("countries-chart");

        var myPieChart = new Chart(countriesChart, {
            type: 'bar',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'Visits by Countries'
                }
            }
        });

    });

    Meteor.call('getConvGraphData', 'affiliateClick', function(err, graphData) {

        var affConvChart = document.getElementById("affiliate-conversions");

        var myPieChart = new Chart(affConvChart, {
            type: 'bar',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'Affiliate Conversions'
                }
            }
        });

    });

    Meteor.call('getConvGraphData', 'subscribe', function(err, graphData) {

        var listConvChart = document.getElementById("list-conversions");

        var myPieChart = new Chart(listConvChart, {
            type: 'bar',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'List Conversions'
                }
            }
        });

    });

    // Meteor.call('getPostsGraphData', function(err, graphData) {

    //     var postChart = document.getElementById("best-posts-chart");

    //     var myPieChart = new Chart(postChart, {
    //         type: 'bar',
    //         data: graphData,
    //         options: {
    //             title: {
    //                 display: true,
    //                 text: 'Most Visited Posts'
    //             },
    //             scales: {
    //                 xAxes: [{
    //                     display: false
    //                 }]
    //             }
    //         }
    //     });

    // });

});
