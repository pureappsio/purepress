Meteor.methods({

    getAffVisits: function() {

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return Stats.find({ type: 'affiliateClick', date: { $gte: limitDate } }).count();

    },
    getAllVisits: function() {

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return Stats.find({ type: 'visit', date: { $gte: limitDate } }).count();

    },
    getMobileVisits: function() {

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return Stats.find({ type: 'visit', date: { $gte: limitDate }, browser: 'mobile' }).count();

    },
    getSubscribed: function() {

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return Stats.find({ type: 'subscribe', date: { $gte: limitDate } }).count();

    },
    harmonizeDates: function() {

        console.log('Harmozing dates... ')

        // Get all affiliate clicks
        var affiliateClicks = Stats.find({ type: 'affiliateClick' }).fetch();
        for (i in affiliateClicks) {
            var newDate = new Date(affiliateClicks[i].date);
            Stats.update(affiliateClicks[i]._id, { $set: { date: newDate } });
        }
        console.log(affiliateClicks);

        // Get all subscribed
        var subscribed = Stats.find({ type: 'subscribe' }).fetch();
        for (i in subscribed) {
            var newDate = new Date(subscribed[i].date);
            Stats.update(subscribed[i]._id, { $set: { date: newDate } });
        }
        console.log(subscribed);

        console.log(' done');

    },
    getPostsGraphData: function() {

        // Get posts
        var bestPosts = Meteor.call('getBestVisitedPosts');

        var postsName = [];
        var postsVisits = [];

        for (i in bestPosts) {
            postsName.push(bestPosts[i].title);
            postsVisits.push(bestPosts[i].visits);
        }

        var data = {
            labels: postsName,
            datasets: [{
                label: 'Most Visited Posts',
                data: postsVisits,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }]
        };

        return data;

    },
    removeInactiveVisitors: function() {

        console.log('Removing inactive visitors');
        Visitors.remove({ date: { $lte: new Date(new Date().getTime() - 60 * 1000) } });

    },
    insertVisitor: function(httpHeaders, query) {

        visitor = {};

        // console.log(httpHeaders);

        // Find IP & country
        if (httpHeaders['cf-connecting-ip']) {
            visitor.ip = httpHeaders['cf-connecting-ip'];
            visitor.country = httpHeaders['cf-ipcountry'];
        } else {
            visitor.ip = httpHeaders['x-forwarded-for'];
            visitor.country = 'US';
        }
        visitor.date = new Date();

        // Check for referer
        if (!query.origin) {
            if (httpHeaders.referer) {
                console.log('Referer: ' + httpHeaders.referer);
                query.origin = Meteor.call('getOrigin', httpHeaders.referer);
                query.medium = Meteor.call('getMedium', httpHeaders.referer);
            }
        }

        // Find mobile or not
        visitor.browser = Meteor.call('detectBrowser', httpHeaders);

        // Type
        // if (post.type) {
        //     stat.pageId = post._id;
        // } else {
        //     stat.postId = post._id;
        // }

        // Source
        if (query.origin) {
            visitor.origin = query.origin;
        } else {
            visitor.origin = 'organic';
        }
        visitor.active = true;

        // Type
        if (query.medium) {
            visitor.medium = query.medium;
        } else {
            visitor.medium = 'direct';
        }

        // Check if already logged
        if (Visitors.findOne({ ip: visitor.ip })) {

            console.log('Already existing visitor')
            Visitors.update({ ip: visitor.ip }, { $set: { date: new Date() } });
            console.log(Visitors.findOne({ ip: visitor.ip }));

        } else {

            // console.log(visitor);
            Visitors.insert(visitor);
        }

    },
    detectBrowser: function(httpHeaders) {

        var browser = 'desktop';

        if (httpHeaders['user-agent']) {
            var agent = httpHeaders['user-agent'];
        }
        if (agent.includes('Mobile')) {
            browser = 'mobile';
        }

        return browser;

    },
    removeVisitor: function(httpHeaders) {

        if (httpHeaders['cf-connecting-ip']) {
            var ip = httpHeaders['cf-connecting-ip'];
        } else {
            var ip = httpHeaders['x-forwarded-for'];
        }

        Visitors.update({ ip: ip }, { $set: { active: false } });

    },
    insertStat: function(stat) {

        // Insert
        console.log(stat);
        Stats.insert(stat);

    },
    insertSession: function(parameters) {

        var stat = {
            type: parameters.type,
            date: new Date()
        };

        // Page or post
        if (parameters.postId) {
            if (parameters.postType == 'page') {
                stat.pageId = parameters.postId;
            } else {
                stat.postId = parameters.postId;
            }
        }

        // Process if just URL
        if (parameters.url) {

            var appUrl = Meteor.absoluteUrl();
            var postUrl = (parameters.url).replace(appUrl, "");

            // Check if page or post
            if (Posts.findOne({ url: postUrl })) {
                var post = Posts.findOne({ url: postUrl });

                if (stat.type == 'subscribe') {
                    stat.boxId = post.signupBox;
                }
                stat.postId = post._id;
            }

        }

        // Find IP & country
        if (parameters.headers) {

            // IP
            if (parameters.headers['cf-connecting-ip']) {
                ip = parameters.headers['cf-connecting-ip'];
            } else {
                ip = parameters.headers['x-forwarded-for'];
            }

            if (Visitors.findOne({ ip: ip })) {
                var visitor = Visitors.findOne({ ip: ip });

                // Origin & medium
                if (visitor.origin) {
                    stat.origin = visitor.origin;
                }
                if (visitor.country) {
                    stat.country = visitor.country;
                }
                if (visitor.medium) {
                    stat.medium = visitor.medium;
                }
                if (visitor.browser) {
                    stat.browser = visitor.browser;
                }
            }

        }

        Meteor.call('insertStat', stat);


    },
    getBestVisitedPosts: function() {

        // Get posts
        var posts = Posts.find({}).fetch();

        // Calculate visits
        for (i in posts) {
            posts[i].visits = Stats.find({ type: 'visit', postId: posts[i]._id }).count();
        }

        goodPosts = [];
        for (i in posts) {

            if (posts[i].visits != 0) {
                goodPosts.push(posts[i]);
            }

        }

        // Sort
        goodPosts.sort(function(a, b) {
            return parseFloat(b.visits) - parseFloat(a.visits);
        });

        return goodPosts.slice(0, 5);

    },
    getBestConvertingPosts: function() {

        // Get posts
        var posts = Posts.find({ signupBox: { $exists: true } }).fetch();

        // Calculate conversions
        for (i in posts) {

            if (Stats.findOne({ type: 'subscribe', postId: posts[i]._id }) && Stats.findOne({ type: 'visit', postId: posts[i]._id })) {
                var subscriptions = Stats.find({ type: 'subscribe', postId: posts[i]._id }).count();
                var visits = Stats.find({ type: 'visit', postId: posts[i]._id }).count();

                if (visits > 10) {
                    posts[i].conversion = (subscriptions / visits * 100).toFixed(0);
                } else {
                    posts[i].conversion = 0;
                }
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

        return goodPosts.slice(0, 5);

    },
    getBestAffiliatePosts: function() {

        // Get posts
        var posts = Posts.find({}).fetch();

        // Calculate conversions
        for (i in posts) {

            if (Stats.findOne({ type: 'affiliateClick', postId: posts[i]._id }) && Stats.findOne({ type: 'visit', postId: posts[i]._id })) {
                var affiliateClicks = Stats.find({ type: 'affiliateClick', postId: posts[i]._id }).count();
                var visits = Stats.find({ type: 'visit', postId: posts[i]._id }).count();
                if (visits > 10) {
                    posts[i].conversion = (affiliateClicks / visits * 100).toFixed(0);
                } else {
                    posts[i].conversion = 0;
                }
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

        return goodPosts.slice(0, 5);

    },
    getOriginGraphData: function() {

        // Get sessions
        var social = Stats.find({ origin: 'social' }).count();
        var ads = Stats.find({ origin: 'ads' }).count();
        var organic = Stats.find({ origin: 'organic' }).count();

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
    sortArrays: function(refArray, otherArray) {

        var all = [];

        for (var i = 0; i < otherArray.length; i++) {
            all.push({ 'A': refArray[i], 'B': otherArray[i] });
        }

        all.sort(function(a, b) {
            return b.A - a.A;
        });

        A = [];
        B = [];

        for (var i = 0; i < all.length; i++) {
            A.push(all[i].A);
            B.push(all[i].B);
        }

        return [A, B];

    },
    getCountryGraph: function() {

        // Get sessions
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        var sessions = Stats.find({ country: { $exists: true }, date: { $gte: limitDate } }).fetch();

        var countries = [];
        for (i in sessions) {
            if (countries.indexOf(sessions[i].country) == -1) {
                countries.push(sessions[i].country);
            }
        }

        countriesSessions = [];
        for (c in countries) {
            countriesSessions.push(Stats.find({ country: countries[c], date: { $gte: limitDate } }).count());
        }

        // Slice
        var sortedArray = Meteor.call('sortArrays', countriesSessions, countries);
        countries = sortedArray[1].slice(0, 5);
        countriesSessions = sortedArray[0].slice(0, 5);

        var data = {
            labels: countries,
            datasets: [{
                label: 'Visits by Country',
                data: countriesSessions,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }]
        };

        return data;

    },
     getConvCountryData: function(type) {

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Countries
        var countries = [];
        for (i in sessions) {
            if (countries.indexOf(sessions[i].country) == -1) {
                countries.push(sessions[i].country);
            }
        }

        var socialColors = [
            "#27DE55",
            "#e52d27",
            "#3b5998",
            "#4099FF"
        ];

        var data = {
            labels: [
                "Organic",
                "Youtube",
                "Facebook",
                "Twitter"
            ],
            datasets: [{
                label: 'Conversions',
                data: [organic, youtube, facebook, twitter],
                backgroundColor: socialColors,
                hoverBackgroundColor: socialColors
            }]
        };
        console.log(data.datasets);

        return data;

    },
    getConvGraphData: function(type) {

        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get sessions
        var facebookVisits = Stats.find({ type: 'visit', medium: 'facebook', date: { $gte: limitDate } }).count();
        var youtubeVisits = Stats.find({ type: 'visit', medium: 'youtube', date: { $gte: limitDate } }).count();
        var twitterVisits = Stats.find({ type: 'visit', medium: 'twitter', date: { $gte: limitDate } }).count();
        var organicVisits = Stats.find({ type: 'visit', origin: 'organic', date: { $gte: limitDate } }).count();

        // Get clicks
        var facebookClicks = Stats.find({ type: type, medium: 'facebook', date: { $gte: limitDate } }).count();
        var youtubeClicks = Stats.find({ type: type, medium: 'youtube', date: { $gte: limitDate } }).count();
        var twitterClicks = Stats.find({ type: type, medium: 'twitter', date: { $gte: limitDate } }).count();
        var organicClicks = Stats.find({ type: type, origin: 'organic', date: { $gte: limitDate } }).count();

        // Get conversions
        var facebook = (facebookClicks / facebookVisits * 100).toFixed(2);
        var youtube = (youtubeClicks / youtubeVisits * 100).toFixed(2);
        var twitter = (twitterClicks / twitterVisits * 100).toFixed(2);
        var organic = (organicClicks / organicVisits * 100).toFixed(2);

        var socialColors = [
            "#27DE55",
            "#e52d27",
            "#3b5998",
            "#4099FF"
        ];

        var data = {
            labels: [
                "Organic",
                "Youtube",
                "Facebook",
                "Twitter"
            ],
            datasets: [{
                label: 'Conversions',
                data: [organic, youtube, facebook, twitter],
                backgroundColor: socialColors,
                hoverBackgroundColor: socialColors
            }]
        };
        console.log(data.datasets);

        return data;

    },
    getSocialGraphData: function() {

        // Get sessions
        var facebook = Stats.find({ medium: 'facebook' }).count();
        var youtube = Stats.find({ medium: 'youtube' }).count();
        var twitter = Stats.find({ medium: 'twitter' }).count();

        var socialColors = [
            "#e52d27",
            "#3b5998",
            "#4099FF"
        ];

        var data = {
            labels: [
                "Youtube",
                "Facebook",
                "Twitter"
            ],
            datasets: [{
                label: 'Social Visits',
                data: [youtube, facebook, twitter],
                backgroundColor: socialColors,
                hoverBackgroundColor: socialColors
            }]
        };
        // console.log(data.datasets);

        return data;


    },
    getSessions: function(type) {

        // console.log(Stats.find({}).fetch());

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

        // console.log(sessions);

        for (i in sessions) {

            dataPoint = {}

            dataPoint.y = parseInt(sessions[i].count);
            var date = sessions[i]._id.year + '-' + sessions[i]._id.month + '-' + sessions[i]._id.day;
            // console.log(date);
            dataPoint.x = new Date(date);

            data.push(dataPoint);

        }

        // Sort
        data.sort(date_sort);
        console.log(data);

        return data;

    },
    getGraphData: function(type) {

        var sessions = Meteor.call('getGraphSessions', type);

        if (type == 'visit') {

            var data = {
                datasets: [{
                    label: 'Views',
                    fill: false,
                    data: sessions,
                    pointHoverBackgroundColor: "darkblue",
                    pointHoverBorderColor: "darkblue",
                    pointBorderColor: "darkblue",
                    backgroundColor: "darkblue",
                    borderColor: "darkblue"
                }]
            };
        }

        if (type == 'subscribe') {

            var data = {
                datasets: [{
                    label: 'List Subscriptions',
                    fill: false,
                    data: sessions,
                    pointHoverBackgroundColor: "red",
                    pointHoverBorderColor: "red",
                    pointBorderColor: "red",
                    backgroundColor: "red",
                    borderColor: "red"
                }]
            };
        }

        if (type == 'affiliateClick') {

            var data = {
                datasets: [{
                    label: 'Affiliate Clicks',
                    fill: false,
                    data: sessions,
                    pointHoverBackgroundColor: "orange",
                    pointHoverBorderColor: "orange",
                    pointBorderColor: "orange",
                    backgroundColor: "orange",
                    borderColor: "orange"
                }]
            };
        }

        return data;

    },
    resetStats: function() {

        Stats.remove({});

    }

})

function date_sort(a, b) {
    return new Date(a.x).getTime() - new Date(b.x).getTime();
}
