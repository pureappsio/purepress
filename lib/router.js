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

            // Visitor
            // Meteor.call('insertVisitor', this.request.headers);

            // Check for links
            if (Pages.findOne({ url: this.params.post_url, link: { $exists: true } })) {

                var page = Pages.findOne({ url: this.params.post_url, link: { $exists: true } });

                // Response
                this.response.writeHead(302, { 'Location': page.link });
                this.response.end();

            } else {

                // Get user location
                var location = Meteor.call('getUserLocation', this.request.headers);

                // Get meta for homePage
                if (Metas.findOne({ type: 'blogPage' })) {

                    // Get Meta
                    var meta = Metas.findOne({ type: 'blogPage' });

                    // Get blog page
                    var blogPage = Pages.findOne(meta.value);

                    // Check for blog page
                    if (blogPage.url == this.params.post_url) {

                        // Check for query param
                        if (this.params.query.page) {

                            // Render all posts
                            var html = Meteor.call('renderAllPosts', this.params.query.page);
                        } else {
                            // Render all posts
                            var html = Meteor.call('renderAllPosts', 1);
                        }

                    } else {

                        // Render HTML
                        var html = Meteor.call('renderPost', this.params.post_url, location, this.params.query);


                    }

                } else {

                    // Render HTML
                    var html = Meteor.call('renderPost', this.params.post_url, location, this.params.query);

                }

                // Response
                this.response.writeHead(200, { 
                    'Content-Type': 'text/html', 
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

            // Get user location
            // Meteor.call('insertVisitor', this.request.headers);
            var location = Meteor.call('getUserLocation', this.request.headers);

            // Get meta for homePage
            if (Metas.findOne({ type: 'homePage' })) {

                // Get Meta
                var meta = Metas.findOne({ type: 'homePage' });

                if (Metas.findOne({ type: 'blogPage' })) {

                    var metaBlog = Metas.findOne({ type: 'blogPage' });

                    if (metaBlog.value == meta.value) {

                        // Render HTML
                        var html = Meteor.call('renderAllPosts', 1);

                    } else {
                        // Get home page
                        var homePage = Pages.findOne(meta.value);

                        // Render home page
                        var html = Meteor.call('renderPost', homePage.url, location, this.params.query);
                    }

                } else {

                    // Get home page
                    var homePage = Pages.findOne(meta.value);

                    // Render home page
                    var html = Meteor.call('renderPost', homePage.url, location, this.params.query);

                }

            } else {

                // Render HTML
                var html = Meteor.call('renderAllPosts', 1);

            }

            // Response
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
