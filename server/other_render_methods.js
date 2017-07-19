var cheerio = Npm.require("cheerio");
var minify = Npm.require('html-minifier').minify;

import Images from '../imports/api/files';

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

                if (Metas.findOne({ userId: post.userId, type: 'language' })) {

                    if (Metas.findOne({ userId: post.userId, type: 'language' }).value == 'fr') {
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
    renderExitModal: function(parameters) {

        console.log('Rendering modal');

        // Compile navbar
        SSR.compileTemplate('modal', Assets.getText('modals/exit_modal_template.html'));

        // Helpers
        Template.modal.helpers({

            listId: function() {
                return Integrations.findOne({ type: 'puremail' }).list;
            },
            integrationUrl: function() {
                return Integrations.findOne({ type: 'puremail' }).url;
            },
            origin: function() {

                if (parameters.query.origin) {
                    return parameters.query.origin;
                } else {
                    return 'blog';
                }

            },
            buttonText: function() {
                if (Metas.findOne({ userId: parameters.userId, type: 'exitButton' })) {
                    return Metas.findOne({ userId: parameters.userId, type: 'exitButton' }).value;
                }
            },
            langEN: function() {

                if (Metas.findOne({ userId: parameters.userId, type: 'language' })) {

                    if (Metas.findOne({ userId: parameters.userId, type: 'language' }).value == 'fr') {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }

            },
            boxContent: function() {
                if (Metas.findOne({ userId: parameters.userId, type: 'exitContent' })) {
                    return Metas.findOne({ userId: parameters.userId, type: 'exitContent' }).value;
                }
            },
            sequenceId: function() {
                if (Metas.findOne({ userId: parameters.userId, type: 'exitSequence' })) {
                    return Metas.findOne({ userId: parameters.userId, type: 'exitSequence' }).value;
                }
            },
            displayTitle: function() {
                if (Metas.findOne({ userId: parameters.userId, type: 'exitTitle' })) {
                    return Metas.findOne({ userId: parameters.userId, type: 'exitTitle' }).value;
                }
            }

        });

        // Render
        var html = SSR.render('modal');
        html = html.replace("inferior", "<");

        return html;

    },
    renderSocialShare: function(parameters) {

        // Compile header
        SSR.compileTemplate('social', Assets.getText('posts/share_template.html'));

        // Helpers
        Template.social.helpers({

            shareNumber: function() {

                if (parameters.post.socialShare) {
                    return parameters.post.socialShare;
                } else {
                    return 0;
                }

            },
            title: function() {
                return parameters.post.title;
            },
            description: function() {
                var html = cheerio.load(parameters.post.excerpt);
                return html.text();
            },
            imageUrl: function() {
                return Images.findOne(parameters.post.featuredPicture).link();
            },
            postUrl: function() {
                return parameters.postUrl;
            },
            twitterUsername: function() {

                if (Networks.findOne({ userId: parameters.userId, type: 'twitter' })) {

                    var link = Networks.findOne({ userId: parameters.userId, type: 'twitter' }).link;

                    var handleIndex = link.indexOf('twitter.com/') + 'twitter.com/'.length;

                    handle = link.substr(handleIndex);

                    return handle;

                } else {
                    return false;
                }

            },
            email: function() {
                if (Networks.findOne({ userId: parameters.userId, type: 'envelope-o' })) {
                    return Networks.findOne({ userId: parameters.userId, type: 'envelope-o' }).link;
                }
            }
        });

        var outputHTML = SSR.render('social');

        return outputHTML;

    },
    renderDisqus: function(parameters) {

        // Compile header
        SSR.compileTemplate('comments', Assets.getText('posts/disqus_template.html'));

        // Helpers
        Template.comments.helpers({

            disqusId: function() {
                if (Metas.findOne({ userId: parameters.userId, type: 'disqus' })) {
                    return Metas.findOne({ userId: parameters.userId, type: 'disqus' }).value;
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
