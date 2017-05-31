Template.stats.events({

    'click #harmonize': function() {
        Meteor.call('updateStatistics');
    }

});

Template.stats.helpers({

    visitsVariation: function() {

        var variation = Statistics.findOne({ type: 'visitsVariation' }).value;
        variation = parseInt(variation);
        if (variation > 999) {
            variation = 999;
        }
        return variation.toFixed(0) + '%';

    },
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
    areSales: function() {

        if (Integrations.findOne({ type: 'purecart' })) {
            return true;
        }

    },
    mobile: function() {
        return (Statistics.findOne({ type: 'totalMobile' }).value / Statistics.findOne({ type: 'allVisits' }).value * 100).toFixed(1) + '%';
    },
    affEarnings: function() {

        return '$' + (Statistics.findOne({ type: 'totalAmazonEarnings' }).value).toFixed(2);

    },
    sales: function() {

        return '$' + Statistics.findOne({ type: 'sales' }).value;

    },
    listConversions: function() {

        return (Statistics.findOne({ type: 'totalSubscribed' }).value / Statistics.findOne({ type: 'allVisits' }).value * 100).toFixed(1) + '%';

    },
    postsWithBox: function() {

        return Statistics.findOne({ type: 'convertingPosts' }).value;

    },
    areConversions: function() {

        return true;

    },
    areAffiliates: function() {

        return true;

    },
    allVisits: function() {

        var visits = Statistics.findOne({ type: 'allVisits' }).value;
        visits = parseInt(visits);

        if (visits > 1000 && visits < 100000) {
            visits = (visits / 1000).toFixed(1) + 'k'
        }
        if (visits > 100000) {
            visits = (visits / 1000).toFixed(0) + 'k'
        }

        return visits;
    },
    affiliatePosts: function() {

        return Statistics.findOne({ type: 'affiliatePosts' }).value;

    },
    postsEarnings: function() {

        var posts = Statistics.findOne({ type: 'postsEarnings' }).value;

        return posts.slice(0, 7);

    },
    posts: function() {

        return (Statistics.findOne({ type: 'visitedPosts' }).value).slice(0, 7);

    },
    pages: function() {

        return (Statistics.findOne({ type: 'visitedPages' }).value).slice(0, 7);

    },
    postsShared: function() {
        return Posts.find({ socialShare: { $exists: true } }, { sort: { socialShare: -1 } });
    }

});

Template.stats.onRendered(function() {

    Session.set("limitDate", new Date(new Date().getTime() - 60 * 1000));
    Meteor.setInterval(function() {
        Session.set("limitDate", new Date(new Date().getTime() - 60 * 1000));
    }, 10000);

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
                    }],
                    yAxes: [{
                        id: 'A',
                        type: 'linear',
                        position: 'left',
                    }, {
                        id: 'B',
                        type: 'linear',
                        position: 'right'
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

    Meteor.call('getCategoryGraphData', function(err, graphData) {

        var categoryChart = document.getElementById("category-chart");

        var myPieChart = new Chart(categoryChart, {
            type: 'bar',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'Visits by Categories'
                }
            }
        });

    });

    Meteor.call('getTagsGraphData', function(err, graphData) {

        var tagsChart = document.getElementById("tags-chart");

        var myPieChart = new Chart(tagsChart, {
            type: 'bar',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'Visits by Tags'
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

    Meteor.call('getBoxGraphData', function(err, graphData) {

        var boxConvChart = document.getElementById("box-conversions");

        var myPieChart = new Chart(boxConvChart, {
            type: 'bar',
            data: graphData,
            options: {
                title: {
                    display: true,
                    text: 'Box Conversions'
                }
            }
        });

    });

});
