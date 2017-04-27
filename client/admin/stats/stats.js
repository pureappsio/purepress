Template.stats.helpers({

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
    postsWithBox: function() {

        return Session.get('posts');

    },
    affiliatePosts: function() {

        return Session.get('affiliatePosts');

    }

});

Template.stats.onRendered(function() {

    Meteor.call('getAllVisits', function(err, data) {
        Session.set('visits', data);
    });

    Meteor.call('getBestConvertingPosts', function(err, data) {
        Session.set('posts', data);
    });

    Meteor.call('getBestAffiliatePosts', function(err, data) {
        Session.set('affiliatePosts', data);
    });

    Meteor.call('getGraphData', 'views', function(err, graphData) {

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

    Meteor.call('getOriginGraphData', function(err, graphData) {

        var ctx = document.getElementById("origin-chart");

        var myPieChart = new Chart(ctx, {
            type: 'pie',
            data: graphData
        });

    });

});
