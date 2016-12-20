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

            this.response.end(JSON.stringify({ message: "Page created" , pageId: pageId}));
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

        var pages = Pages.find({}).fetch();
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

            this.response.end(JSON.stringify({ message: "Integration created" , integrationId: integrationId}));
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

