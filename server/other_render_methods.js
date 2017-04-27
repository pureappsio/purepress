var cheerio = Npm.require("cheerio");
var minify = Npm.require('html-minifier').minify;

Meteor.methods({

    renderEmailBox: function(post, query) {

        // Compile header
        SSR.compileTemplate('box', Assets.getText('posts/email_box_template.html'));

        // Helpers
        Template.box.helpers({

            origin: function() {

                if (query.origin) {
                    return query.origin;
                } else {
                    return 'blog';
                }

            },
            langEN: function() {

                if (Metas.findOne({ type: 'language' })) {

                    if (Metas.findOne({ type: 'language' }).value == 'fr') {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }

            },
            integrationUrl: function() {

                if (Integrations.findOne({ type: 'puremail' })) {
                    return Integrations.findOne({ type: 'puremail' }).url;
                }

            },
            signupBoxTitle: function() {
                if (Boxes.findOne(post.signupBox)) {
                    if (Boxes.findOne(post.signupBox).displayTitle) {
                        return Boxes.findOne(post.signupBox).displayTitle;
                    }
                }
            },
            signupBoxContent: function() {
                if (Boxes.findOne(post.signupBox)) {
                    return Boxes.findOne(post.signupBox).boxContent;
                }
            },
            signupPopupContent: function() {
                if (Boxes.findOne(post.signupBox)) {
                    return Boxes.findOne(post.signupBox).popupContent;
                }
            },
            tags: function() {
                if (Boxes.findOne(post.signupBox)) {
                    return Boxes.findOne(post.signupBox).tags;

                }
            },
            listId: function() {
                return Integrations.findOne({ type: 'puremail' }).list;
            },
            sequenceId: function(element) {
                if (Boxes.findOne(post.signupBox)) {
                    return Boxes.findOne(post.signupBox).sequence;
                }
            }

        });

        var boxHtml = SSR.render('box');

        // Minify
        boxHtml = minify(boxHtml, { minifyCSS: true, minifyJS: true })

        return boxHtml;

    },
    renderDisqus: function(parameters) {

        // Compile header
        SSR.compileTemplate('comments', Assets.getText('posts/disqus_template.html'));

        // Helpers
        Template.comments.helpers({

            disqusId: function() {
                if (Metas.findOne({ type: 'disqus' })) {
                    return Metas.findOne({ type: 'disqus' }).value;
                }

            },
            siteUrl: function() {
                return parameters.websiteUrl;
            },
            url: function() {
                return parameters.url;
            }

        });

        var outputHTML = SSR.render('comments');

        return outputHTML;

    }
});
