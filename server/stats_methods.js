Meteor.methods({

    getAllVisits: function() {

        return Stats.find({ type: 'visit' }).fetch().length;

    },
    getBestConvertingPosts: function() {

        // Get posts
        var posts = Posts.find({ signupBox: { $exists: true } }).fetch();

        // Calculate conversions
        for (i in posts) {

            if (Stats.findOne({ type: 'subscribe', postId: posts[i]._id }) && Stats.findOne({ type: 'visit', postId: posts[i]._id })) {
                posts[i].conversion = (Stats.find({ type: 'subscribe', postId: posts[i]._id }).fetch().length / Stats.find({ type: 'visit', postId: posts[i]._id }).fetch().length * 100).toFixed(0);
            } else {
                posts[i].conversion = 0;
            }

        }

        goodPosts = [];
        for (i in posts) {

            if (posts[i].conversion != 0) {
                goodPosts.push(posts[i]);
            }


        }

        // Sort
        goodPosts.sort(function(a, b) {
            return parseFloat(b.conversion) - parseFloat(a.conversion);
        });

        return goodPosts;

    },
    getBestAffiliatePosts: function() {

        // Get posts
        var posts = Posts.find({}).fetch();

        // Calculate conversions
        for (i in posts) {

            if (Stats.findOne({ type: 'affiliateClick', postId: posts[i]._id }) && Stats.findOne({ type: 'visit', postId: posts[i]._id })) {
                posts[i].conversion = (Stats.find({ type: 'affiliateClick', postId: posts[i]._id }).fetch().length / Stats.find({ type: 'visit', postId: posts[i]._id }).fetch().length * 100).toFixed(0);
            } else {
                posts[i].conversion = 0;
            }

        }

        goodPosts = [];
        for (i in posts) {

            if (posts[i].conversion != 0) {
                goodPosts.push(posts[i]);
            }


        }

        // Sort
        goodPosts.sort(function(a, b) {
            return parseFloat(b.conversion) - parseFloat(a.conversion);
        });

        return goodPosts;

    },
    getOriginGraphData: function() {

        // Get sessions
        var social = Stats.find({ origin: 'social' }).fetch().length;
        var ads = Stats.find({ origin: 'ads' }).fetch().length;
        var organic = Stats.find({ origin: 'organic' }).fetch().length;

        console.log(organic);

        var data = {
            labels: [
                "Organic",
                "Social",
                "Ads"
            ],
            datasets: [{
                data: [organic, social, ads],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }]
        };

        return data;

    },
    getSessions: function(type) {

        console.log(Stats.find({}).fetch());

        return Stats.aggregate(
            [
                { $match: { type: type } }, {
                    $group: {
                        _id: {
                            "year": {
                                "$substr": ["$date", 0, 4]
                            },
                            "month": {
                                "$substr": ["$date", 5, 2]
                            },
                            "day": {
                                "$substr": ["$date", 8, 2]
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);
    },
    getGraphSessions: function(type) {

        var sessions = Meteor.call('getSessions', type);

        data = [];

        console.log(sessions);

        for (i in sessions) {

            dataPoint = {}

            dataPoint.y = parseInt(sessions[i].count);
            var date = sessions[i]._id.year + '-' + sessions[i]._id.month + '-' + sessions[i]._id.day;
            console.log(date);
            dataPoint.x = new Date(date);

            data.push(dataPoint);

        }

        // Sort
        data.sort(date_sort);

        return data;

    },
    getGraphData: function(type) {

        var visits = Meteor.call('getGraphSessions', 'visit');

        console.log(visits);

        if (type == 'views') {

            var data = {
                datasets: [{
                    label: 'Views',
                    fill: false,
                    data: visits,
                    pointHoverBackgroundColor: "darkblue",
                    pointHoverBorderColor: "darkblue",
                    pointBorderColor: "darkblue",
                    backgroundColor: "darkblue",
                    borderColor: "darkblue"
                }]
            };
        }

        return data;

    },

    insertStat: function(stat) {

        // Process if just URL
        if (stat.url) {

            var appUrl = Meteor.absoluteUrl();
            var postUrl = (stat.url).replace(appUrl, "");

            // Check if page or post
            if (Posts.findOne({ url: postUrl })) {
                var post = Posts.findOne({ url: postUrl });

                if (stat.type == 'subscribe') {
                    stat.boxId = post.signupBox;
                }
                stat.postId = post._id;
            }
            // else {
            //     var page = Pages.findOne({url: postUrl});
            //     stat.boxId = page.boxId;
            //     stat.pageId = page._id;
            // }

            delete stat.url;

        }

        console.log(stat);
        Stats.insert(stat);

    },
    resetStats: function() {

        Stats.remove({});

    }

})

function date_sort(a, b) {
    return new Date(a.x).getTime() - new Date(b.x).getTime();
}
