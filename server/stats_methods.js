var countriesList = ['US', 'FR', 'CA', 'UK', 'DE', 'IT', 'ES'];

Meteor.methods({

    areAffiliateClicks: function() {

        var clicks = Stats.find({ type: 'affiliateClick' }).count();
        console.log(clicks);

        if (clicks > 0) {
            return true;
        } else {
            return false;
        }

    },
    updateStatistics: function() {

        console.log('Updating site statistics');

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        var beforeDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Amazon earnings
        var amazonData = Meteor.call('getEstimatedAmazonEarnings');
        var amazonEarnings = amazonData[0];
        Meteor.call('updateStatistic', 'amazonEarnings', amazonEarnings);

        var totalAmazonEarnings = 0;
        for (i in amazonEarnings) {
            totalAmazonEarnings += parseFloat(amazonEarnings[i].y);
        }
        Meteor.call('updateStatistic', 'totalAmazonEarnings', totalAmazonEarnings);

        // Posts earnings
        var postsEarnings = amazonData[1];
        Meteor.call('updateStatistic', 'postsEarnings', postsEarnings);

        // Store ?
        if (Integrations.findOne({ type: 'purecart' })) {
            var sales = Meteor.call('getSalesSummary', limitDate);
            Meteor.call('updateStatistic', 'sales', sales);
        }

        // Summary stats
        var allVisits = Stats.find({ type: 'visit', date: { $gte: limitDate } }).count();
        Meteor.call('updateStatistic', 'allVisits', allVisits);
        var allVisitsPast = Stats.find({ type: 'visit', date: { $gte: beforeDate, $lte: limitDate } }).count();

        if (allVisitsPast != 0) {
            variation = ((allVisits - allVisitsPast) / allVisitsPast * 100).toFixed(2);
        } else {
            variation = 0;
        }

        Meteor.call('updateStatistic', 'visitsVariation', variation);

        var totalAffiliate = Stats.find({ type: 'affiliateClick', date: { $gte: limitDate } }).count();
        Meteor.call('updateStatistic', 'totalAffiliate', totalAffiliate);

        var totalMobile = Stats.find({ type: 'visit', date: { $gte: limitDate }, browser: 'mobile' }).count();
        Meteor.call('updateStatistic', 'totalMobile', totalMobile);

        var totalSubscribed = Stats.find({ type: 'subscribe', date: { $gte: limitDate } }).count();
        Meteor.call('updateStatistic', 'totalSubscribed', totalSubscribed);

        // Origin
        var social = Stats.find({ origin: 'social', date: { $gte: limitDate } }).count();
        Meteor.call('updateStatistic', 'social', social);
        var ads = Stats.find({ origin: 'ads', date: { $gte: limitDate } }).count();
        Meteor.call('updateStatistic', 'ads', ads);
        var organic = Stats.find({ origin: 'organic', date: { $gte: limitDate } }).count();
        Meteor.call('updateStatistic', 'organic', organic);

        // Social
        var socialNetworks = ['facebook', 'youtube', 'twitter', 'pinterest', 'instagram'];
        for (n in socialNetworks) {
            var facebook = Stats.find({ medium: socialNetworks[n] }).count();
            Meteor.call('updateStatistic', socialNetworks[n], facebook);
        }

        // Countries
        var countriesStats = Meteor.call('getCountryStats');
        Meteor.call('updateStatistic', 'countries', countriesStats[0]);
        Meteor.call('updateStatistic', 'countriesSessions', countriesStats[1]);

        // Best posts
        var convertingPosts = Meteor.call('getBestConvertingPosts');
        Meteor.call('updateStatistic', 'convertingPosts', convertingPosts);
        var visitedPosts = Meteor.call('getBestVisitedPosts');
        Meteor.call('updateStatistic', 'visitedPosts', visitedPosts);
        var affiliatePosts = Meteor.call('getBestAffiliatePosts');
        Meteor.call('updateStatistic', 'affiliatePosts', affiliatePosts);
        var bestBoxes = Meteor.call('getBestConvertingBoxes');
        Meteor.call('updateStatistic', 'bestBoxes', bestBoxes);

        // Categories & tags
        var bestCategories = Meteor.call('getBestCategories');
        Meteor.call('updateStatistic', 'bestCategories', bestCategories);

        var bestTags = Meteor.call('getBestTags');
        Meteor.call('updateStatistic', 'bestTags', bestTags);

        // Best pages
        var visitedPages = Meteor.call('getBestVisitedPages');
        Meteor.call('updateStatistic', 'visitedPages', visitedPages);

        // Conversions
        var affiliateClickConv = Meteor.call('getConvData', 'affiliateClick');
        Meteor.call('updateStatistic', 'affiliateClickConv', affiliateClickConv);
        var subscribeConv = Meteor.call('getConvData', 'subscribe');
        Meteor.call('updateStatistic', 'subscribeConv', subscribeConv);

        // Sessions graph
        var visits = Meteor.call('getGraphSessions', 'visit');
        Meteor.call('updateStatistic', 'visit', visits);

        var subscribed = Meteor.call('getGraphSessions', 'subscribe');
        Meteor.call('updateStatistic', 'subscribe', subscribed);

        var affiliateClicks = Meteor.call('getGraphSessions', 'affiliateClick');
        Meteor.call('updateStatistic', 'affiliateClick', affiliateClicks);

        var endDate = new Date();
        console.log('Time to update stats: ' + (endDate.getTime() - now.getTime()) + ' ms')

    },
    updateStatistic: function(statisticType, statisticValue) {

        if (Statistics.findOne({ type: statisticType })) {

            // Update
            console.log('Updating stastistic ' + statisticType);
            Statistics.update({ type: statisticType }, {
                $set: {
                    value: statisticValue,
                    date: new Date()
                }
            });


        } else {

            // Update
            console.log('New stastistic ' + statisticType);

            var statistic = {
                type: statisticType,
                value: statisticValue,
                date: new Date()
            }

            Statistics.insert(statistic);

        }

    },
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
        // console.log(affiliateClicks);

        // Get all subscribed
        var subscribed = Stats.find({ type: 'subscribe' }).fetch();
        for (i in subscribed) {
            var newDate = new Date(subscribed[i].date);
            Stats.update(subscribed[i]._id, { $set: { date: newDate } });
        }
        console.log(subscribed);

        console.log(' done');

    },
    getBoxGraphData: function() {

        var bestBoxes = Statistics.findOne({ type: 'bestBoxes' }).value;

        var boxesName = [];
        var boxesConversions = [];

        for (i in bestBoxes) {
            boxesName.push(bestBoxes[i].title);
            boxesConversions.push(bestBoxes[i].conversion);
        }

        var data = {
            labels: boxesName,
            datasets: [{
                label: 'Most Converting Boxes',
                data: boxesConversions,
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
    insertVisitor: function(parameters) {

        visitor = {};

        var httpHeaders = parameters.headers;
        var query = parameters.query;

        // Find IP & country
        if (httpHeaders['cf-connecting-ip']) {
            visitor.ip = httpHeaders['cf-connecting-ip'];
            visitor.country = httpHeaders['cf-ipcountry'];
        } else {
            visitor.ip = httpHeaders['x-forwarded-for'];
            visitor.country = 'US';
        }
        visitor.date = new Date();
        visitor.userId = parameters.userId;

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
        if (Visitors.findOne({ ip: visitor.ip, userId: parameters.userId })) {

            console.log('Already existing visitor')
            Visitors.update({ ip: visitor.ip, userId: parameters.userId }, { $set: { date: new Date() } });
            console.log(Visitors.findOne({ ip: visitor.ip, userId: parameters.userId }));

        } else {

            // console.log(visitor);
            Visitors.insert(visitor);
        }

    },
    detectBrowser: function(httpHeaders) {

        var browser = 'desktop';

        if (httpHeaders) {

            if (httpHeaders['user-agent']) {

                var agent = httpHeaders['user-agent'];

                if (agent.includes('Mobile')) {
                    browser = 'mobile';
                }
            }
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

        // Process Amazon link
        if (parameters.link && parameters.type == 'affiliateClick') {

            // Asin
            var asin = Meteor.call('extractAsinStats', parameters.link);
            if (asin != 'none') {
                stat.asin = asin;
                stat.locale = Meteor.call('extractLocale', parameters.link);
            }

        }

        // Social shares
        if (parameters.link && parameters.type == 'socialShare') {

            // Link
            var link = parameters.link;

            var network = 'facebook';

            if (link.indexOf('twitter') != -1) {
                network = 'twitter';
            }
            if (link.indexOf('facebook') != -1) {
                network = 'facebook';
            }
            if (link.indexOf('mailto') != -1) {
                network = 'email';
            }
            if (link.indexOf('linkedin') != -1) {
                network = 'linkedin';
            }
            if (link.indexOf('pinterest') != -1) {
                network = 'pinterest';
            }

            stat.network = network;

            if (post) {
                Posts.update(post._id, { $inc: { socialShare: 1 } });
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
                if (visitor.userId) {
                    stat.userId = visitor.userId;
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
    getBestCategories: function() {

        // Get best posts
        var bestPosts = Statistics.findOne({ type: 'visitedPosts' }).value;

        var categories = Categories.find({}).fetch();

        // Fill
        for (i in categories) {
            categories[i].visits = 0;
        }

        // Count
        for (i in categories) {

            for (p in bestPosts) {

                if (bestPosts[p].postCategory) {
                    if (bestPosts[p].postCategory == categories[i]._id) {
                        categories[i].visits += bestPosts[p].visits;
                    }
                }

            }

        }

        return categories;

    },
    getBestTags: function() {

        // Get best posts
        var bestPosts = Statistics.findOne({ type: 'visitedPosts' }).value;

        var tags = Tags.find({}).fetch();

        // Fill
        for (i in tags) {
            tags[i].visits = 0;
        }

        // Count
        for (i in tags) {

            for (p in bestPosts) {

                if (bestPosts[p].tags) {

                    console.log(bestPosts[p].tags)

                    if ((bestPosts[p].tags).indexOf(tags[i]._id) != -1) {
                        tags[i].visits += bestPosts[p].visits;
                    }
                }

            }

        }

        console.log(tags);

        return tags;

    },
    getBestVisitedPosts: function() {

        // Get posts
        var posts = Posts.find({}).fetch();

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate visits
        for (i in posts) {
            posts[i].visits = Stats.find({ date: { $gte: limitDate }, type: 'visit', postId: posts[i]._id }).count();
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

        return goodPosts;

    },
    getBestVisitedPages: function() {

        // Get pages
        var pages = Pages.find({}).fetch();

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate visits
        for (i in pages) {
            pages[i].visits = Stats.find({ date: { $gte: limitDate }, type: 'visit', pageId: pages[i]._id }).count();
        }

        goodPages = [];
        for (i in pages) {

            if (pages[i].visits != 0) {
                goodPages.push(pages[i]);
            }

        }

        // Sort
        goodPages.sort(function(a, b) {
            return parseFloat(b.visits) - parseFloat(a.visits);
        });

        return goodPages;

    },
    getBestConvertingBoxes: function() {

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get boxes
        var boxes = Boxes.find({}).fetch();

        // Calculate visits
        for (i in boxes) {

            var posts = Posts.find({ signupBox: boxes[i]._id }).fetch();
            postsIds = [];
            for (p in posts) {
                postsIds.push(posts[p]._id);
            }

            boxes[i].visits = Stats.find({ date: { $gte: limitDate }, type: 'visit', postId: { $in: postsIds } }).count();
        }

        goodBoxes = [];
        for (i in boxes) {

            if (boxes[i].visits != 0) {
                goodBoxes.push(boxes[i]);
            }

        }

        // Calculate conversions
        for (i in goodBoxes) {
            subscriptions = Stats.find({ date: { $gte: limitDate }, type: 'subscribe', boxId: goodBoxes[i]._id }).count();
            goodBoxes[i].conversion = Meteor.call('calculateConversion', subscriptions, goodBoxes[i].visits);
        }

        // Sort
        goodBoxes.sort(function(a, b) {
            return parseFloat(b.conversion) - parseFloat(a.conversion);
        });

        return goodBoxes.slice(0, 5);

    },
    getBestConvertingPosts: function() {

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get posts
        var posts = Posts.find({ signupBox: { $exists: true } }).fetch();

        // Calculate conversions
        for (i in posts) {

            if (Stats.findOne({ type: 'subscribe', postId: posts[i]._id }) && Stats.findOne({ type: 'visit', postId: posts[i]._id })) {
                var subscriptions = Stats.find({ date: { $gte: limitDate }, type: 'subscribe', postId: posts[i]._id }).count();
                var visits = Stats.find({ date: { $gte: limitDate }, type: 'visit', postId: posts[i]._id }).count();

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

        // Limit
        var now = new Date();
        var limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate conversions
        for (i in posts) {

            if (Stats.findOne({ date: { $gte: limitDate }, type: 'affiliateClick', postId: posts[i]._id }) && Stats.findOne({ type: 'visit', postId: posts[i]._id })) {
                var affiliateClicks = Stats.find({ type: 'affiliateClick', postId: posts[i]._id }).count();
                var visits = Stats.find({ date: { $gte: limitDate }, type: 'visit', postId: posts[i]._id }).count();
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

        return goodPosts.slice(0, 7);

    },
    getOriginGraphData: function() {

        // Get sessions
        var social = Statistics.findOne({ type: 'social' }).value;
        var ads = Statistics.findOne({ type: 'ads' }).value;
        var organic = Statistics.findOne({ type: 'organic' }).value;

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
    getCountryStats: function() {

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

        return [countries, countriesSessions];

    },
    getCountryGraph: function() {

        var countries = Statistics.findOne({ type: 'countries' }).value;
        var countriesSessions = Statistics.findOne({ type: 'countriesSessions' }).value;

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
    getConvData: function(type) {

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

        return [organic, youtube, facebook, twitter];

    },
    getConvGraphData: function(type) {

        var data = Statistics.findOne({ type: type + 'Conv' }).value;

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
                data: data,
                backgroundColor: socialColors,
                hoverBackgroundColor: socialColors
            }]
        };
        console.log(data.datasets);

        return data;

    },
    getTagsGraphData: function() {

        var tags = Statistics.findOne({ type: 'bestTags' }).value;

        var tagsNames = [];
        var tagsVisits = [];
        var colors = [];

        for (i in tags) {
            colors.push(Meteor.call('getRandomColor'));
            tagsNames.push(tags[i].name);
            tagsVisits.push(tags[i].visits);
        }

        var data = {
            labels: tagsNames,
            datasets: [{
                label: 'Visits',
                data: tagsVisits,
                backgroundColor: colors,
                hoverBackgroundColor: colors
            }]
        };

        return data;

    },
    getCategoryGraphData: function() {

        var categories = Statistics.findOne({ type: 'bestCategories' }).value;
        console.log(categories);

        var categoriesNames = [];
        var categoriesVisits = [];
        var colors = [];

        for (i in categories) {
            colors.push(Meteor.call('getRandomColor'));
            categoriesNames.push(categories[i].name);
            categoriesVisits.push(categories[i].visits);
        }

        var data = {
            labels: categoriesNames,
            datasets: [{
                label: 'Visits',
                data: categoriesVisits,
                backgroundColor: colors,
                hoverBackgroundColor: colors
            }]
        };

        console.log(categoriesNames);
        console.log(categoriesVisits);

        return data;

    },
    getSocialGraphData: function() {

        // Get sessions
        var facebook = Statistics.findOne({ type: 'facebook' }).value;
        var youtube = Statistics.findOne({ type: 'youtube' }).value;
        var twitter = Statistics.findOne({ type: 'twitter' }).value;
        var pinterest = Statistics.findOne({ type: 'pinterest' }).value;
        var instagram = Statistics.findOne({ type: 'instagram' }).value;

        var socialColors = [
            "#e52d27",
            "#3b5998",
            "#4099FF",
            "#bd081b",
            "#885a4d"
        ];

        var data = {
            labels: [
                "Youtube",
                "Facebook",
                "Twitter",
                "Pinterest",
                "Instagram"
            ],
            datasets: [{
                label: 'Social Visits',
                data: [youtube, facebook, twitter, pinterest, instagram],
                backgroundColor: socialColors,
                hoverBackgroundColor: socialColors
            }]
        };
        // console.log(data.datasets);

        return data;


    },
    getSessions: function(type) {

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
    getEstimatedAmazonEarnings: function() {

        // Get meta for conversion
        if (Metas.findOne({ type: 'affiliateConversion' })) {

            var conversion = Metas.findOne({ type: 'affiliateConversion' }).value;

            // Get all clicks
            var clicks = Stats.find({ type: 'affiliateClick', asin: { $exists: true }, locale: { $in: countriesList } }).fetch();
            console.log('Affiliate clicks:' + clicks.length);

            // Find all ASINs
            var asins = [];
            for (i in clicks) {
                if (asins.indexOf(clicks[i].asin) == -1) {
                    asins.push({ asin: clicks[i].asin, locale: clicks[i].locale });
                }
            }

            // Gather data
            asinData = {};

            asins = asins.sort(function(a, b) {
                if (a.locale > b.locale) return -1;
                if (a.locale < b.locale) return 1;
                return 0;
            });

            for (a in asins) {

                var productData = Meteor.call('getAmazonProductData', asins[a].asin, asins[a].locale);

                if (productData.message) {

                    console.log('Invalid ASIN: ' + asins[a].asin + ' for locale ' + asins[a].locale);

                } else {
                    asinData[asins[a].asin] = productData[asins[a].locale];
                }
            }

            // Add estimated earning per click
            var clickEarnings = [];
            clickedPosts = [];

            // Get rates
            var rates = Metas.findOne({ type: 'rates' }).value;

            for (c in clicks) {

                if (asinData[clicks[c].asin]) {

                    // Data
                    var asinClickData = asinData[clicks[c].asin];

                    // Estimate
                    if (asinClickData.price && asinClickData.commission) {

                        // Calculate earnings                        
                        earnings = asinClickData.price * asinClickData.commission / 100 * conversion / 100;

                        // Update currency
                        if (asinClickData.currency != 'EUR') {
                            earnings = earnings / rates[asinClickData.currency];
                        }

                        // Update stats
                        Stats.update(clicks[c]._id, { $set: { earnings: earnings } });

                        // Insert
                        clickEarnings.push({
                            date: clicks[c].date,
                            earnings: earnings,
                            postId: clicks[c].postId
                        });

                        // Posts
                        if (clickedPosts.indexOf(clicks[c].postId) == -1) {
                            clickedPosts.push(clicks[c].postId);
                        }

                    }

                }

            }

            // Generate revenue per posts
            var posts = Posts.find({ _id: { $in: clickedPosts } }).fetch();

            postsEarnings = [];
            for (i in posts) {

                postEarnings = {
                    _id: posts[i]._id,
                    title: posts[i].title
                };
                var earnings = 0;

                for (c in clickEarnings) {
                    if (clickEarnings[c].postId == posts[i]._id) {
                        earnings += clickEarnings[c].earnings;
                    }
                }

                postEarnings.earnings = earnings.toFixed(2);
                postsEarnings.push(postEarnings);

            }

            postsEarnings.sort(function(a, b) {
                return parseFloat(b.earnings) - parseFloat(a.earnings);
            });

            // Get all dates
            dates = [];
            for (i in clickEarnings) {

                var date = new Date(clickEarnings[i].date);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);

                if (dates.indexOf(date.getTime()) == -1) {
                    dates.push(date.getTime());
                }
            }

            var data = [];

            for (i in dates) {

                data.push({
                    x: new Date(dates[i]),
                    y: 0
                })

                for (c in clickEarnings) {

                    // Format date
                    var date = new Date(clickEarnings[c].date);
                    date.setHours(0);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    date.setMilliseconds(0);

                    if (date.getTime() == dates[i]) {
                        data[i].y += clickEarnings[c].earnings;
                    }

                }

                // Set precision
                data[i].y = (data[i].y).toFixed(2);

            }

            return [data, postsEarnings];

        } else {
            return [];
        }

    },
    getGraphSessions: function(type) {

        var sessions = Meteor.call('getSessions', type);

        data = [];

        for (i in sessions) {

            dataPoint = {}

            dataPoint.y = parseInt(sessions[i].count);
            var date = sessions[i]._id.year + '-' + sessions[i]._id.month + '-' + sessions[i]._id.day;
            dataPoint.x = new Date(date);

            data.push(dataPoint);

        }

        // Sort
        data.sort(date_sort);

        return data;

    },
    getGraphData: function(type) {

        var sessions = Statistics.findOne({ type: type }).value;

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

            var affiliateEarnings = Statistics.findOne({ type: 'amazonEarnings' }).value;

            var data = {
                datasets: [{
                    label: 'Affiliate Clicks',
                    fill: false,
                    data: sessions,
                    yAxisID: 'A',
                    pointHoverBackgroundColor: "orange",
                    pointHoverBorderColor: "orange",
                    pointBorderColor: "orange",
                    backgroundColor: "orange",
                    borderColor: "orange"
                }, {
                    label: 'Affiliate Earnings',
                    fill: false,
                    data: affiliateEarnings,
                    yAxisID: 'B',
                    pointHoverBackgroundColor: "red",
                    pointHoverBorderColor: "red",
                    pointBorderColor: "red",
                    backgroundColor: "red",
                    borderColor: "red"
                }]
            };
        }

        return data;

    },
    resetStats: function() {

        Stats.remove({});

    },
    calculateConversion: function(result, base) {

        if (base != 0) {
            return (result / base * 100).toFixed(2);
        } else {
            return 0;
        }

    },
    getRandomColor: function() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

})

function date_sort(a, b) {
    return new Date(a.x).getTime() - new Date(b.x).getTime();
}
