// // MP3 length
// mp3Duration = Npm.require('mp3-duration');
// Future = Npm.require('fibers/future');

Meteor.methods({

    renderRSS: function() {

        // Get Metas
        var websiteTitle = Metas.findOne({ type: 'brandName' }).value;
        if (Metas.findOne({ type: 'description' })) {
            var websiteDescription = Metas.findOne({ type: 'description' }).value;

        } else {
            var websiteDescription = "Just a PurePress site";
        }

        // Build xml start
        var xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/">';

        // Channel
        xml += '<channel>'
        xml += '<title>' + websiteTitle + '</title>';
        xml += '<atom:link href="' + Meteor.absoluteUrl() + 'feed/" rel="self" type="application/rss+xml" />'
        xml += '<link>' + Meteor.absoluteUrl() + '</link>';
        xml += '<description>' + websiteDescription + '</description>';
        xml += '<lastBuildDate>' + moment(new Date()).format('ddd, DD MMM YYYY hh:mm:ss') + ' GMT' + '</lastBuildDate>';
        xml += '<language>en-US</language>';
        xml += '<sy:updatePeriod>hourly</sy:updatePeriod>';
        xml += '<sy:updateFrequency>1</sy:updateFrequency>';
        xml += '<generator>PurePress</generator>';

        // Items
        var posts = Posts.find({});

        posts.forEach(function(post) {

            // Form XML
            xml += '<item>';
            xml += '<title><![CDATA[' + post.title + ']]></title>';
            xml += '<description><![CDATA[' + post.excerpt + ']]></description>';
            xml += '<link>' + Meteor.absoluteUrl() + post.url + '</link>';
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

    renderPodcastRSS: function() {

        // Get Metas
        var podcastTitle = Metas.findOne({ type: 'podcastTitle' }).value;
        var podcastDescription = Metas.findOne({ type: 'podcastDescription' }).value;

        var itunesSummary = Metas.findOne({ type: 'itunesSummary' }).value;
        var itunesAuthor = Metas.findOne({ type: 'itunesAuthor' }).value;
        var itunesImage = Metas.findOne({ type: 'itunesImage' }).value;
        var itunesSubtitle = Metas.findOne({ type: 'itunesSubtitle' }).value;

        // Build xml start
        var xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">';

        // Channel
        xml += '<channel>'
        xml += '<title>' + podcastTitle + '</title>';
        xml += '<atom:link href="' + Meteor.absoluteUrl() + 'feed/podcast/" rel="self" type="application/rss+xml" />'
        xml += '<link>' + Meteor.absoluteUrl() + 'feed/podcast/</link>';
        xml += '<description>' + podcastDescription + '</description>';
        xml += '<lastBuildDate>' + moment(new Date()).format('ddd, DD MMM YYYY hh:mm:ss') + ' GMT' + '</lastBuildDate>';
        xml += '<language>en-US</language>';
        xml += '<sy:updatePeriod>hourly</sy:updatePeriod>';
        xml += '<sy:updateFrequency>1</sy:updateFrequency>';
        xml += '<generator>PurePress</generator>';
        xml += '<itunes:summary>' + itunesSummary + '</itunes:summary>';

        xml += '<itunes:author><![CDATA[' + itunesAuthor + ']]></itunes:author>';
        xml += '<itunes:explicit>clean</itunes:explicit>';
        xml += '<itunes:image href="http://marcoschwartz.com/wp-content/uploads/powerpress/itunes_logo.jpg" />';
        xml += '<itunes:owner>';
        xml += '<itunes:name><![CDATA[' + itunesAuthor + ']]></itunes:name>';
        xml += '<itunes:email>marcolivier.schwartz@gmail.com</itunes:email>';
        xml += '</itunes:owner>';
        xml += '<managingEditor>marcolivier.schwartz@gmail.com</managingEditor>';
        xml += '<itunes:subtitle><![CDATA[' + itunesSubtitle + ']]></itunes:subtitle>';
        xml += '<image>';
        xml += '<title>' + podcastTitle + '</title>';
        xml += '<link>' + Meteor.absoluteUrl() + '</link>';
        xml += '<url>https://marcoschwartz.com/wp-content/uploads/powerpress/itunes_logo.jpg</url>';
        xml += '</image>';
        xml += '<itunes:category text="Business">';
        xml += '<itunes:category text="Management &amp; Marketing" />';
        xml += '</itunes:category>';

        // Items
        var posts = Posts.find({ category: 'podcast' });

        posts.forEach(function(post) {

            // Form XML
            xml += '<item>';
            xml += '<title><![CDATA[' + post.title + ']]></title>';
            xml += '<description><![CDATA[' + post.content + ']]></description>';
            xml += '<link>' + Meteor.absoluteUrl() + post.url + '</link>';
            xml += '<pubDate>' + moment(post.creationDate).format('ddd, DD MMM YYYY hh:mm:ss') + ' GMT' + '</pubDate>';
            xml += '<category><![CDATA[Podcast]]></category>';
            xml += '<enclosure url="' + post.podcastUrl + '" length="' + post.podcastSize + '" type="audio/mpeg" />'
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

        return xml;

    }

});
