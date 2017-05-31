Router.route("/api/metas", { where: "server" }).post(function() {

    // Get data
    var key = this.params.query.key;
    var data = this.request.body;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        if (data.value && data.type) {
            // Insert meta
            Meteor.call('insertMeta', data);

            this.response.end(JSON.stringify({ message: "Meta modified" }));
        } else {
            this.response.end(JSON.stringify({ message: "Invalid data" }));
        }

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

}).get(function() {

    // Get data
    var key = this.params.query.key;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        var metas = Metas.find({}).fetch();
        this.response.end(JSON.stringify({ metas: metas }));

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/metas/:type", { where: "server" }).get(function() {

    // Get data
    var type = this.params.type;
    var key = this.params.query.key;

    var meta = Metas.findOne({ type: type });

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {
        this.response.end(JSON.stringify(meta));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/statistics/:type", { where: "server" }).get(function() {

    // Get data
    var type = this.params.type;
    var key = this.params.query.key;

    var statistic = Statistics.findOne({ type: type });

    if (statistic) {
        answer = statistic;
    } else {
        answer = {};
    }

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {
        this.response.end(JSON.stringify(answer));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/posts", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;

    var query = {};

    if (this.params.query.category) {
        query.category = this.params.query.category;
    }

    var posts = Posts.find(query).fetch();

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {
        this.response.end(JSON.stringify({ posts: posts }));
    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/pages", { where: "server" }).post(function() {

    // Get data
    var key = this.params.query.key;
    var data = this.request.body;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        if (data.title && data.url) {

            // Create page
            var page = {
                title: data.title,
                url: data.url,
                cached: false,
                type: 'generic'
            }
            var pageId = Meteor.call('createPage', page);

            this.response.end(JSON.stringify({ message: "Page created", pageId: pageId }));
        } else {
            this.response.end(JSON.stringify({ message: "Invalid data" }));
        }

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

}).get(function() {

    // Get data
    var key = this.params.query.key;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        var query = {};

        if (this.params.query.type) {
            query.type = this.params.query.type;
        }

        var pages = Pages.find(query).fetch();
        this.response.end(JSON.stringify({ pages: pages }));

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/integrations", { where: "server" }).post(function() {

    // Get data
    var key = this.params.query.key;
    var data = this.request.body;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        if (data.type && data.url && data.key) {

            // Create page
            var integration = {
                type: data.type,
                url: data.url,
                key: data.key
            }
            var integrationId = Meteor.call('addIntegration', integration);

            this.response.end(JSON.stringify({ message: "Integration created", integrationId: integrationId }));
        } else {
            this.response.end(JSON.stringify({ message: "Invalid data" }));
        }

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

}).get(function() {

    // Get data
    var key = this.params.query.key;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        var integrations = Integrations.find({}).fetch();
        this.response.end(JSON.stringify({ integrations: integrations }));

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/products", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        // Get products
        var products = Products.find({}).fetch();

        // Get all page URL, names and product names
        for (i in products) {

            var pageData = Pages.findOne(products[i].pageId);
            products[i].url = Meteor.absoluteUrl() + pageData.url;

            var productData = Meteor.call('getProductData', products[i].productId)
                // console.log(productData);
            products[i].name = productData.name;
            products[i].price = productData.price;

        }

        this.response.end(JSON.stringify({ products: products }));

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/visitors", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        // Get products
        var visitors = Visitors.find({}).fetch();

        this.response.end(JSON.stringify({ visitors: visitors }));

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/sessions", { where: "server" }).get(function() {

    // Get data
    var key = this.params.query.key;

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    if (Meteor.call('validateApiKey', key)) {

        var query = {};

        if (this.params.query.type) {
            query.type = this.params.query.type;
        }
        if (this.params.query.origin) {
            query.origin = this.params.query.origin;
        }
        if (this.params.query.medium) {
            query.medium = this.params.query.medium;
        }

        if (this.params.query.from && this.params.query.to) {

            // Parameters
            from = new Date(this.params.query.from)
            to = new Date(this.params.query.to)

            console.log(to);

            // Set to date to end of day
            to.setHours(23);
            to.setMinutes(59);
            to.setSeconds(59);

            // Query
            query.date = { $gte: from, $lte: to };

        }

        // Get sessions
        var sessions = Stats.find(query).fetch();

        if (this.params.query.summary) {
            sessions = sessions.length;
        }

        this.response.end(JSON.stringify({ sessions: sessions }));

    } else {
        this.response.end(JSON.stringify({ message: "API key invalid" }));
    }

});

Router.route("/api/leaving", { where: "server" }).get(function() {

    Meteor.call('removeVisitor', this.request.headers);

    // Send response
    console.log('Visitor left site');
    this.response.setHeader('Content-Type', 'application/json');
    this.response.end(JSON.stringify({ message: "Left" }));

});

Router.route("/api/stats", { where: "server" }).post(function() {

    // Get data
    var data = this.request.body;

    if (data.type) {

        params = {
            url: data.url,
            type: data.type,
            query: this.params.query,
            headers: this.request.headers
        }

        if (data.link) {
            params.link = data.link
        }

        Meteor.call('insertSession', params);

        // Send response
        this.response.setHeader('Content-Type', 'application/json');
        this.response.end(JSON.stringify({ message: 'Stat added' }));

    }

});

Router.route("/api/modal", { where: "server" }).get(function() {

    // Check if modal has to be displayed
    var display = Meteor.call('checkDisplayModal', this.request.headers);

    // Send response
    this.response.setHeader('Content-Type', 'application/json');
    this.response.end(JSON.stringify({ displayModal: display }));

});
