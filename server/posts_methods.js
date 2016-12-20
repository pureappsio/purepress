var jsmediatags = Npm.require("jsmediatags");
var cheerio = Npm.require("cheerio");
Future = Npm.require('fibers/future');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

knox = Npm.require('knox');
Request = Npm.require('request');
bound = Meteor.bindEnvironment(function(callback) {
    return callback();
});
cfdomain = 'https://' + Meteor.settings.s3.cloudfront; // <-- Change to your Cloud Front Domain
client = knox.createClient({
    key: Meteor.settings.s3.key,
    secret: Meteor.settings.s3.secret,
    bucket: Meteor.settings.s3.bucket,
    region: Meteor.settings.s3.region
});

Meteor.methods({

    getListTags: function() {

        // Get integration
        if (Integrations.findOne({ type: 'puremail' })) {

            var integration = Integrations.findOne({ type: 'puremail' });

            // Get lists
            var url = "http://" + integration.url + "/api/tags?key=" + integration.key;
            url += '&list=' + integration.list;
            var answer = HTTP.get(url);
            return answer.data.tags;

        } else {
            return [];
        }

    },

    getAllPosts: function() {

        return Posts.find({}).fetch();

    },

    setPostStatus: function(postId, status) {

        Posts.update(postId, { $set: { status: status } });

    },
    publishAllPosts: function() {

        Posts.update({}, { $set: { status: 'published' } }, { multi: true });

    },
    importImage: function(url) {

        var myFuture = new Future();

        Images.load(url, function(err, fileRef) {

            console.log('File uploaded');

            if (err) {
                console.log(err);
                myFuture.return("");
            } else {

                _.each(fileRef.versions, function(vRef, version) {

                    var filePath = "files/" + (Random.id()) + "-" + version + "." + fileRef.extension;

                    client.putFile(vRef.path, filePath, function(error, res) {
                        bound(function() {
                            var upd;
                            if (error) {
                                console.error(error);
                            } else {
                                upd = {
                                    $set: {}
                                };
                                upd['$set']["versions." + version + ".meta.pipeFrom"] = cfdomain + '/' + filePath;
                                upd['$set']["versions." + version + ".meta.pipePath"] = filePath;
                                Images.collection.update({
                                    _id: fileRef._id
                                }, upd, function(error) {
                                    if (error) {
                                        console.error(error);
                                    } else {
                                        // Unlink original files from FS
                                        // after successful upload to AWS:S3
                                        console.log('Uploaded to S3');
                                        Images.unlink(Images.collection.findOne(fileRef._id), version);
                                        myFuture.return(Images.collection.findOne(fileRef._id));
                                    }
                                });
                            }
                        });
                    });

                });

            }

        });

        return myFuture.wait();

    },
    replaceImageLink: function(url) {

        var fileRef = Meteor.call('importImage', url);
        // console.log('/cdn/storage/Images/' + fileRef._id + '/original/' + fileRef._id + '.' + fileRef.extension);

        if (fileRef != "") {
            return '/cdn/storage/Images/' + fileRef._id + '/original/' + fileRef._id + '.' + fileRef.extension;
        } else {
            return "";
        }

    },
    importPosts: function() {

        if (Integrations.findOne({ type: 'wordpress' })) {

            console.log('Importing WordPress posts');

            var integration = Integrations.findOne({ type: 'wordpress' });

            var answer = HTTP.get('https://' + integration.url + '/wp-json/wp/v2/posts?per_page=100');
            var posts = answer.data;

            //console.log(posts[0]);

            for (i = 0; i < posts.length; i++) {

                console.log('Import post ' + i + ' over ' + posts.length);

                // Create post
                var post = {
                    url: answer.data[i].slug,
                    cached: false,
                    category: 'general',
                    postCategory: 'general',
                    creationDate: new Date(answer.data[i].date),
                    status: 'published'
                }

                // Insert
                if (Posts.findOne({ url: post.url })) {
                    Posts.update({ url: post.url }, { $set: { creationDate: post.creationDate } });
                } else {

                    // Load raw HTML for title
                    $ = cheerio.load(answer.data[i].title.rendered);
                    var title = $.text();
                    console.log(title);

                    // Load raw HTML for excerpt
                    $ = cheerio.load(answer.data[i].excerpt.rendered);
                    var excerpt = $.text();

                    // Load raw HTML for content
                    $ = cheerio.load(answer.data[i].content.rendered);

                    // Process links in content
                    $('img').each(function(i, elem) {
                        var link = Meteor.call('replaceImageLink', $(elem)[0].attribs.src);
                        $(elem)[0].attribs.src = link;
                        $(elem)[0].parent.attribs.href = link;
                        $(elem).removeAttr('srcset');
                    });

                    // Remove signup box
                    $('.email-signup').remove()

                    // Render
                    var content = $.html();

                    post.content = content;
                    post.title = title;
                    post.excerpt = excerpt;

                    // console.log(post);

                    // Load feature picture
                    if (posts[i].featured_media) {

                        var media = HTTP.get('https://' + integration.url + '/wp-json/wp/v2/media/' + posts[i].featured_media);

                        // Upload pic
                        var featuredRef = Meteor.call('importImage', media.data.source_url);

                        // Set
                        post.featuredPicture = featuredRef._id;
                    }

                    Posts.insert(post);
                }

            }

        }

        // Flush
        Meteor.call('flushCache');

    },
    createCategory: function(category) {

        console.log(category);

        Categories.insert(category);

    },
    getCategories: function() {

        return Categories.find({}).fetch();

    },
    createPostElement: function(element) {

        // Insert
        console.log(element);
        Elements.insert(element);

        // Set post as not cached anymore
        Posts.update(element.postId, { $set: { cached: false } });

    },
    getMP3Data: function(url) {

        // Get duration
        answer = HTTP.call('HEAD', url);

        // Get length
        // jsmediatags.read(url, {
        //     onSuccess: function(tag) {
        //         console.log(tag);
        //     },
        //     onError: function(error) {
        //         console.log(error);
        //     }
        // });

        return {
            duration: "",
            size: answer.headers['content-length']
        }

    },
    editPost: function(post) {

        console.log(post);

        Posts.update(post._id, post);

    },
    createPost: function(post) {

        Posts.insert(post);

    },
    removePost: function(postId) {

        Posts.remove(postId);

    },
    getIntegrations: function() {

        return Integrations.find({}).fetch();

    },
    addIntegration: function(data) {

        // Check if it doesn't exist
        if (Integrations.findOne({ url: data.url })) {

            // Update
            Integrations.update({ url: data.url }, data);

            // Return ID
            return Integrations.findOne({ url: data.url })._id;

        } else {

            // Insert
            var integrationId = Integrations.insert(data);
            return integrationId;

        }

    },
    removeIntegration: function(data) {

        // Insert
        Integrations.remove(data);

    },
    validateApiKey: function(key) {

        var adminUser = Meteor.users.findOne({ apiKey: { $exists: true } });

        if (adminUser.apiKey == key) {
            return true;
        } else {
            return false;
        }

    },
    generateApiKey: function() {

        // Check if key exist
        if (!Meteor.user().apiKey) {

            // Generate key
            var key = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 16; i++) {
                key += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            console.log(key);

            // Update user
            Meteor.users.update(Meteor.user()._id, { $set: { apiKey: key } });
        }

    }

});
