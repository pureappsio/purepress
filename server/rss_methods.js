// // MP3 length
// mp3Duration = Npm.require('mp3-duration');
// Future = Npm.require('fibers/future');

import Images from '../imports/api/files';

Meteor.methods({

    renderRSS: function(userId) {

        // Get Metas
        var websiteTitle = Metas.findOne({ type: 'brandName', userId: userId }).value;
        if (Metas.findOne({ type: 'description', userId: userId })) {
            var websiteDescription = Metas.findOne({ type: 'description', userId: userId }).value;

        } else {
            var websiteDescription = "Just a PurePress site";
        }

        if (Metas.findOne({ type: 'siteUrl', userId: userId })) {
            console.log(Metas.findOne({ type: 'siteUrl', userId: userId }).value);
            var siteUrl = 'https://' + Metas.findOne({ type: 'siteUrl', userId: userId }).value + '/';

        } else {
            var siteUrl = Meteor.absoluteUrl();
        }

        // Build xml start
        var xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/">';

        // Channel
        xml += '<channel>'
        xml += '<title>' + websiteTitle + '</title>';
        xml += '<atom:link href="' + siteUrl + 'feed/" rel="self" type="application/rss+xml" />'
        xml += '<link>' + siteUrl + '</link>';
        xml += '<description>' + websiteDescription + '</description>';
        xml += '<lastBuildDate>' + moment(new Date()).format('ddd, DD MMM YYYY hh:mm:ss') + ' GMT' + '</lastBuildDate>';
        xml += '<language>en-US</language>';
        xml += '<sy:updatePeriod>hourly</sy:updatePeriod>';
        xml += '<sy:updateFrequency>1</sy:updateFrequency>';
        xml += '<generator>PurePress</generator>';

        // Items
        var currentDate = new Date();
        var postQuery = { status: 'published', userId: userId, creationDate: { $lte: currentDate } };

        var posts = Posts.find(postQuery);

        posts.forEach(function(post) {

            // Form XML
            xml += '<item>';
            xml += '<title><![CDATA[' + post.title + ']]></title>';
            xml += '<description><![CDATA[' + post.excerpt + ']]></description>';
            xml += '<link>' + siteUrl + post.url + '</link>';
            xml += '<pubDate>' + moment(post.creationDate).format('ddd, DD MMM YYYY hh:mm:ss') + ' GMT' + '</pubDate>';
            xml += '<category><![CDATA[' + post.postCategory + ']]></category>';
            xml += '<content:encoded><![CDATA[' + post.content + ']]></content:encoded>';
            xml += '</item>';
        });

        // End
        xml += '</channel>'
        xml += '</rss>'

        return xml;

    },

    renderPodcastRSS: function(userId) {

        // Check if podcast exist
        if (Metas.findOne({ type: 'podcastTitle', userId: userId })) {

            // Get Metas
            var podcastTitle = Metas.findOne({ type: 'podcastTitle', userId: userId }).value;
            var podcastDescription = Metas.findOne({ type: 'podcastDescription', userId: userId }).value;

            var itunesSummary = Metas.findOne({ type: 'itunesSummary', userId: userId }).value;
            var itunesAuthor = Metas.findOne({ type: 'itunesAuthor', userId: userId }).value;
            var itunesImage = Metas.findOne({ type: 'itunesImage', userId: userId }).value;
            var itunesSubtitle = Metas.findOne({ type: 'itunesSubtitle', userId: userId }).value;

            if (Metas.findOne({ type: 'siteUrl', userId: userId })) {
                var siteUrl = 'https://' + Metas.findOne({ type: 'siteUrl', userId: userId }).value + '/';

            } else {
                var siteUrl = Meteor.absoluteUrl();
            }

            // Build xml start
            var xml = '<?xml version="1.0" encoding="UTF-8"?>';
            xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">';

            // Channel
            xml += '<channel>'
            xml += '<title>' + podcastTitle + '</title>';
            xml += '<atom:link href="' + siteUrl + 'feed/podcast/" rel="self" type="application/rss+xml" />'
            xml += '<link>' + siteUrl + 'feed/podcast/</link>';
            xml += '<description>' + podcastDescription + '</description>';
            xml += '<lastBuildDate>' + moment(new Date()).format('ddd, DD MMM YYYY hh:mm:ss') + ' GMT' + '</lastBuildDate>';
            xml += '<language>en-US</language>';
            xml += '<sy:updatePeriod>hourly</sy:updatePeriod>';
            xml += '<sy:updateFrequency>1</sy:updateFrequency>';
            xml += '<generator>PurePress</generator>';
            xml += '<itunes:summary>' + itunesSummary + '</itunes:summary>';

            xml += '<itunes:author><![CDATA[' + itunesAuthor + ']]></itunes:author>';
            xml += '<itunes:explicit>clean</itunes:explicit>';
            xml += '<itunes:image href="' + itunesImage + '" />';
            xml += '<itunes:owner>';
            xml += '<itunes:name><![CDATA[' + itunesAuthor + ']]></itunes:name>';
            xml += '<itunes:email>marcolivier.schwartz@gmail.com</itunes:email>';
            xml += '</itunes:owner>';
            xml += '<managingEditor>marcolivier.schwartz@gmail.com</managingEditor>';
            xml += '<itunes:subtitle><![CDATA[' + itunesSubtitle + ']]></itunes:subtitle>';
            xml += '<image>';
            xml += '<title>' + podcastTitle + '</title>';
            xml += '<link>' + siteUrl + '</link>';
            xml += '<url>' + itunesImage + '</url>';
            xml += '</image>';
            xml += '<itunes:category text="Business">';
            xml += '<itunes:category text="Management &amp; Marketing" />';
            xml += '</itunes:category>';

            // Items
            var posts = Posts.find({ status: 'published', category: 'podcast', userId: userId });

            posts.forEach(function(post) {

                // Build URL
                if (post.podcastUrl) {
                    podcastUrl = post.podcastUrl;
                }
                if (post.podcastFileId) {
                    var file = Images.findOne(post.podcastFileId);
                    podcastUrl = siteUrl + 'cdn/storage/Images/' + file._id + '/original/' + file._id + '.' + file.ext;
                }

                // Form XML
                xml += '<item>';
                xml += '<title><![CDATA[' + post.title + ']]></title>';
                xml += '<description><![CDATA[' + post.content + ']]></description>';
                xml += '<link>' + siteUrl + post.url + '</link>';
                xml += '<pubDate>' + moment(post.creationDate).format('ddd, DD MMM YYYY hh:mm:ss') + ' GMT' + '</pubDate>';
                xml += '<category><![CDATA[Podcast]]></category>';
                xml += '<enclosure url="' + podcastUrl + '" length="' + post.podcastSize + '" type="audio/mpeg" />'
                xml += '<itunes:subtitle><![CDATA[' + itunesSubtitle + ']]></itunes:subtitle>';
                xml += '<itunes:summary><![CDATA[' + post.content + ']]></itunes:summary>';
                xml += '<itunes:author><![CDATA[' + itunesAuthor + ']]></itunes:author>';
                xml += '<itunes:explicit>clean</itunes:explicit>';
                xml += '<itunes:duration>' + post.podcastDuration + '</itunes:duration>';
                xml += '</item>';
            });

            // End
            xml += '</channel>'
            xml += '</rss>'

        } else {
            var xml = "";
        }

        return xml;

    }

});
