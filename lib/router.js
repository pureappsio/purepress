import Images from '../imports/api/files';

Router.configure({
    layoutTemplate: 'layout'
});

// Admin route
Router.route('/admin/panel', {
    name: 'admin',
    data: function() {

        if (!Meteor.userId()) {

            this.render('login');

        } else {
            this.render('admin');
        }

    }
});

Router.route('/admin/login', {
    name: 'login',
    data: function() {
        if (!Meteor.userId()) {

            this.render('login');

        } else {
            this.render('admin');
        }
    }
});

Router.route('/admin/signup', {
    name: 'signup',
    data: function() {
        this.render('signup');
    }
});

Router.route('/admin/domain', {
    name: 'domainSelect',
    data: function() {
        this.render('domainSelect');
    }
});

// Post edit route
Router.route('/posts/:post_id', {
    name: 'postEdit',
    waitOn: function() {
        return Meteor.subscribe('userPosts');
    },
    data: function() {

        if (this.ready()) {

            // Get page
            var post = Posts.findOne(this.params.post_id);

            return post;

        } else {
            this.render('loading');
        }

    }
});

// Page edit route
Router.route('/pages/:page_id', {
    name: 'pageEdit',
    waitOn: function() {
        return Meteor.subscribe('userPages');
    },
    data: function() {

        if (this.ready()) {

            // Get page
            var page = Pages.findOne(this.params.page_id);

            return page;

        } else {
            this.render('loading');
        }

    }
});

// Box edit route
Router.route('/boxes/:_id', {
    name: 'boxEdit',
    waitOn: function() {
        return Meteor.subscribe('userBoxes');
    },
    data: function() {

        if (this.ready()) {

            // Get page
            var box = Boxes.findOne(this.params._id);

            return box;

        } else {
            this.render('loading');
        }

    }
});

// SSR post/page route
Router.map(function() {
    this.route('postserver', {
        where: 'server',
        path: '/:post_url',

        action: function() {

            // Get user ID
            var pressUserId = Meteor.call('getUserId', this.request.headers);

            // Render time
            var startRender = new Date();

            // Get user location
            var location = Meteor.call('getUserLocation', this.request.headers);

            // Visitor
            Meteor.call('insertVisitor', {
                headers: this.request.headers,
                query: this.params.query,
                userId: pressUserId
            });

            // Check for links
            if (Pages.findOne({ userId: pressUserId, url: this.params.post_url, link: { $exists: true } })) {

                var page = Pages.findOne({ userId: pressUserId, url: this.params.post_url, link: { $exists: true } });

                // Response
                this.response.writeHead(302, { 'Location': page.link });
                this.response.end();

            } else {

                // Get meta for homePage
                if (Metas.findOne({ userId: pressUserId, type: 'blogPage' })) {

                    // Get Meta
                    var meta = Metas.findOne({ userId: pressUserId, type: 'blogPage' });

                    // Get blog page
                    var blogPage = Pages.findOne(meta.value);

                    // Check for blog page
                    if (blogPage.url == this.params.post_url) {

                        // Check for query param
                        if (this.params.query.page) {

                            // Render all posts
                            var html = Meteor.call('renderAllPosts', {
                                pageNumber: this.params.query.page,
                                url: this.params.post_url,
                                query: this.params.query,
                                headers: this.request.headers,
                                userId: pressUserId
                            });

                        } else {

                            // Render all posts
                            var html = Meteor.call('renderAllPosts', {
                                pageNumber: 1,
                                url: this.params.post_url,
                                query: this.params.query,
                                headers: this.request.headers,
                                userId: pressUserId
                            });
                        }

                    } else {

                        // Render HTML
                        var html = Meteor.call('renderPost', {
                            url: this.params.post_url,
                            location: location,
                            query: this.params.query,
                            headers: this.request.headers,
                            userId: pressUserId
                        });

                    }

                } else {

                    // Render HTML
                    var html = Meteor.call('renderPost', {
                        url: this.params.post_url,
                        location: location,
                        query: this.params.query,
                        headers: this.request.headers,
                        userId: pressUserId
                    });

                }

                // Render time
                var endRender = new Date();

                console.log('Render time: ' + (endRender.getTime() - startRender.getTime()) + ' ms');

                // console.log('Res: ');
                // console.log(this.response);

                // Response
                this.response.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Location': 'somecustom.com',
                    'Vary': 'accept-encoding'
                });
                this.response.write(html);
                this.response.end();

            }


        }

    });
});

// SSR main route
Router.map(function() {
    this.route('main', {
        where: 'server',
        path: '/',
        action: function() {

            // console.log(this.request);

            var location = Meteor.call('getUserLocation', this.request.headers);

            // User Id
            var pressUserId = Meteor.call('getUserId', this.request.headers);

            // Visitor
            Meteor.call('insertVisitor', {
                headers: this.request.headers,
                query: this.params.query,
                userId: pressUserId
            });

            // Get meta for homePage
            if (Metas.findOne({ userId: pressUserId, type: 'homePage' })) {

                // Get Meta
                var meta = Metas.findOne({ userId: pressUserId, type: 'homePage' });

                if (Metas.findOne({ userId: pressUserId, type: 'blogPage' })) {

                    var metaBlog = Metas.findOne({ userId: pressUserId, type: 'blogPage' });

                    // Get home page
                    var homePage = Pages.findOne(meta.value);

                    if (metaBlog.value == meta.value) {

                        // Render HTML
                        var html = Meteor.call('renderAllPosts', {
                            pageNumber: 1,
                            url: homePage.url,
                            query: this.params.query,
                            headers: this.request.headers,
                            userId: pressUserId
                        });

                    } else {

                        // Render home page
                        var html = Meteor.call('renderPost', {
                            url: homePage.url,
                            location: location,
                            query: this.params.query,
                            headers: this.request.headers,
                            userId: pressUserId
                        });
                    }

                } else {

                    // Get home page
                    var homePage = Pages.findOne(meta.value);

                    // Render home page
                    var html = Meteor.call('renderPost', {
                        url: homePage.url,
                        location: location,
                        query: this.params.query,
                        headers: this.request.headers,
                        userId: pressUserId
                    });

                }

            } else {

                // Render HTML
                var html = Meteor.call('renderAllPosts', {
                    userId: pressUserId,
                    pageNumber: 1,
                    headers: this.request.headers
                });

            }

    
            this.response.writeHead(200, { 'Content-Type': 'text/html', 'Vary': 'Accept-Encoding' });
            this.response.write(html);
            this.response.end();
        }

    });
});

// XML podcast route
Router.map(function() {
    this.route('podcastxml', {
        where: 'server',
        path: '/feed/podcast',
        action: function() {

            // Get XML feed
            var xml = Meteor.call('renderPodcastRSS');

            // Response
            this.response.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=UTF-8' });
            this.response.write(xml);
            this.response.end();
        }

    });
});

// XML main route
Router.map(function() {
    this.route('xml', {
        where: 'server',
        path: '/feed/rss',
        action: function() {

            // Get XML feed
            var xml = Meteor.call('renderRSS');

            // Response
            this.response.writeHead(200, { 'Content-Type': 'application/rss+xml; charset=UTF-8' });
            this.response.write(xml);
            this.response.end();
        }

    });
});
