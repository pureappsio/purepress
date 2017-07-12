Template.admin.onRendered(function() {

    // Init lists
    Meteor.call('getEmailLists', function(err, lists) {

        for (l = 0; l < lists.length; l++) {
            $('#email-lists').append($('<option>', {
                value: lists[l]._id,
                text: lists[l].name
            }));
        }

    });

    // Init brands
    Meteor.call('getPurePagesBrands', function(err, brands) {

        for (l = 0; l < brands.length; l++) {
            $('#pages-brand').append($('<option>', {
                value: brands[l]._id,
                text: brands[l].name
            }));
        }

    });

    // Init products
    Meteor.call('getAllProducts', function(err, products) {

        for (l = 0; l < products.length; l++) {
            $('#product-id').append($('<option>', {
                value: products[l]._id,
                text: products[l].name
            }));
        }

    });

    // Init picker
    $('#selected-posts').selectpicker();

    Meteor.call('getAllPosts', function(err, posts) {

        for (l = 0; l < posts.length; l++) {
            $('#selected-posts').append($('<option>', {
                value: posts[l]._id,
                text: posts[l].title
            }));
        }

        // Refresh picker
        $('#selected-posts').selectpicker('refresh');

    });

    Meteor.call('getBoxes', function(err, boxes) {

        for (l = 0; l < boxes.length; l++) {
            $('#assigned-box').append($('<option>', {
                value: boxes[l]._id,
                text: boxes[l].title
            }));
        }

    });

});

Template.admin.events({

    'click #log-out': function() {

        Meteor.logout();

    },
    'click #set-user': function() {

        Meteor.call('setUser');

    },

    'click #create-tag': function() {

        var tag = {
            name: $('#tag-name').val(),
            userId: Meteor.user()._id
        }

        Meteor.call('createTag', tag);

    },
    'click #spot-dead-links': function() {

        Meteor.call('spotDeadAmazonLinks');

    },
    'click #localise-all-posts': function() {

        Meteor.call('localiseAllPosts', function(err, data) {
            alert("All posts localised!");
        });

    },
    'click #set-dates-posts': function() {

        Meteor.call('setDatesPosts');

    },
    'click #assign-box': function() {

        Meteor.call('assignBox', $('#assigned-box :selected').val(), $('#selected-posts').val());

    },
    'click #copy-page': function() {

        // Insert Metas
        Meteor.call('copyPage', {
            originPageId: $('#origin-page').val(),
            targetTitle: $('#target-page-title').val(),
            targetUrl: $('#target-page-url').val()
        });

    },

    'click #save-disqus': function() {

        // Insert Metas
        Meteor.call('insertMeta', {
            value: $('#disqus-id').val(),
            type: 'disqus',
            userId: Meteor.user()._id
        });

    },
    'click #set-language': function() {

        // Insert Metas
        Meteor.call('insertMeta', {
            value: $('#language').val(),
            type: 'language',
            userId: Meteor.user()._id
        });

    },
    'keyup #post-title': function() {

        // Title
        var title = $('#post-title').val();

        title = title.replace(/ /g, "-");
        title = title.replace(/:/g, "");

        // Fill URL
        $('#post-url').val(title.toLowerCase());

    },
    'click #publish-posts': function() {

        // Publish
        Meteor.call('publishAllPosts');

    },
    'click #save-conversion': function() {

        // Insert Metas
        Meteor.call('insertMeta', {
            value: parseFloat($('#affiliate-conversion').val()),
            type: 'affiliateConversion',
            userId: Meteor.user()._id
        });
    },
    'click #save-affiliate': function() {

        // Insert Metas
        Meteor.call('insertMeta', {
            value: $('#affiliate-us').val(),
            type: 'affiliateUS',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#affiliate-ca').val(),
            type: 'affiliateCA',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#affiliate-de').val(),
            type: 'affiliateDE',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#affiliate-uk').val(),
            type: 'affiliateUK',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#affiliate-it').val(),
            type: 'affiliateIT',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#affiliate-fr').val(),
            type: 'affiliateFR',
            userId: Meteor.user()._id
        });

        Meteor.call('insertMeta', {
            value: $('#affiliate-es').val(),
            type: 'affiliateES',
            userId: Meteor.user()._id
        });

    },
    'click #add-product': function() {

        var product = {
            productId: $('#product-id :selected').val(),
            pageId: $('#page-id :selected').val(),
            userId: Meteor.user()._id
        }

        Meteor.call('insertProduct', product);

    },
    'click #page-type, change #page-type': function() {

        // Get type
        var type = $('#page-type :selected').val();
        $('#page-option-container').empty();

        // Fill
        if (type == 'purepages') {

            $('#page-option-container').append("<select class='form-control' id='page-option'></select>");

            Meteor.call('getPurePages', function(err, pages) {

                for (i = 0; i < pages.length; i++) {
                    $('#page-option').append($('<option>', {
                        value: pages[i]._id,
                        text: pages[i].name
                    }));
                }

            });

        }
        if (type == 'category') {

            $('#page-option-container').append("<select class='form-control' id='page-option'></select>");

            Meteor.call('getCategories', function(err, categories) {

                for (i = 0; i < categories.length; i++) {
                    $('#page-option').append($('<option>', {
                        value: categories[i]._id,
                        text: categories[i].name
                    }));
                }

            });

        }

        if (type == 'link') {
            $('#page-option-container').append('<input type="text" class="form-control" id="page-option">');
        }

    },

    'click #save-analytics': function() {

        // Insert Meta
        meta = {
            value: $('#analytics-id').val(),
            type: 'analytics',
            userId: Meteor.user()._id
        }
        Meteor.call('insertMeta', meta);

    },
    'click #save-pages': function() {

        // Home
        meta = {
            value: $('#home-page :selected').val(),
            type: 'homePage',
            userId: Meteor.user()._id
        }
        Meteor.call('insertMeta', meta);

        // Blog
        meta = {
            value: $('#blog-page :selected').val(),
            type: 'blogPage',
            userId: Meteor.user()._id
        }
        Meteor.call('insertMeta', meta);

    },
    'click #add-submenu-element': function() {

        // Element
        var menuElement = {
            userId: Meteor.user()._id,
            name: $(' #submenu-name').val(),
            type: $(' #submenu-type :selected').val(),
            parent: $('#submenu-top :selected').val()
        }

        // Get type
        var type = $(' #submenu-type :selected').val();

        if (type == 'link') {
            menuElement.link = $(' #submenu-link').val();

            // Save
            Meteor.call('createMenuElement', menuElement);
        }
        if (type == 'page') {
            Meteor.call('getPageDetails', $(' #submenu-link :selected').val(), function(err, data) {
                menuElement.link = '/' + data.url;

                // Save
                Meteor.call('createMenuElement', menuElement);
            });

        }

    },
    'click #add-menu-element': function() {

        // Element
        var menuElement = {
            userId: Meteor.user()._id,
            name: $('#menu-name').val(),
            type: $('#menu-type :selected').val(),
            style: $('#menu-style :selected').val()
        }

        // Get type
        var type = $(' #menu-type :selected').val();

        if (type == 'link') {
            menuElement.link = $(' #menu-link').val();

            // Save
            Meteor.call('createMenuElement', menuElement);
        }
        if (type == 'page') {
            Meteor.call('getPageDetails', $(' #menu-link :selected').val(), function(err, data) {
                console.log(data);
                menuElement.link = '/' + data.url;

                // Save
                Meteor.call('createMenuElement', menuElement);
            });

        }

    },
    'click #menu-link, change #menu-link': function() {

        // Get selection
        var type = $(' #menu-type :selected').val();

        // Set if type is page
        if (type == 'page') {
            Meteor.call('getPageDetails', $(' #menu-link :selected').val(), function(err, data) {
                $(' #menu-name').val(data.title);
            });

        }

    },
    'click #submenu-link, change #submenu-link': function() {

        // Get selection
        var type = $(' #submenu-type :selected').val();

        // Set if type is page
        if (type == 'page') {
            Meteor.call('getPageDetails', $(' #submenu-link :selected').val(), function(err, data) {
                $(' #submenu-name').val(data.title);
            });

        }

    },
    'click #menu-type, change #menu-type': function() {

        // Get selection
        var type = $(' #menu-type :selected').val();
        $('#menu-content').empty();

        // Set menu element type
        if (type == 'page') {

            // Add contents
            $('#menu-content').append("<select class='form-control' id='menu-link'></select>");

            // Add pages
            Meteor.call('getAllPages', function(err, pages) {

                for (i = 0; i < pages.length; i++) {
                    $('#menu-link').append($('<option>', {
                        value: pages[i]._id,
                        text: pages[i].url
                    }));
                }

            });

        }
        if (type == 'link') {

            // Add input
            $('#menu-content').append("<input type='text' class='form-control' id='menu-link'>");

        }

    },
    'click #submenu-type, change #submenu-type': function() {

        // Get selection
        var type = $(' #submenu-type :selected').val();
        $('#submenu-content').empty();

        // Set menu element type
        if (type == 'page') {

            // Add contents
            $('#submenu-content').append("<select class='form-control' id='submenu-link'></select>");

            // Add pages
            Meteor.call('getAllPages', function(err, pages) {

                for (i = 0; i < pages.length; i++) {
                    $('#submenu-link').append($('<option>', {
                        value: pages[i]._id,
                        text: pages[i].url
                    }));
                }

            });

        }
        if (type == 'link') {

            // Add input
            $('#submenu-content').append("<input type='text' class='form-control' id='submenu-link'>");

        }

        // Load parents
        $('#submenu-top').empty();
        Meteor.call('getAllMenus', function(err, menus) {

            for (j = 0; j < menus.length; j++) {
                console.log(menus[j]);
                $('#submenu-top').append($('<option>', {
                    value: menus[j]._id,
                    text: menus[j].name
                }));
            }

        });

    },
    'click #set-theme': function() {

        meta = {
            value: $('#theme-value :selected').val(),
            type: 'theme',
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    },
    'click #set-affiliate-theme': function() {

        meta = {
            value: $('#affiliate-theme-value :selected').val(),
            type: 'affiliateTheme',
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    },
    'click #set-blog-theme': function() {

        meta = {
            value: $('#blog-theme-value :selected').val(),
            type: 'blogTheme',
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    },
    'click #flush-cache': function() {

        Meteor.call('flushCache');

    },
    'click #save-logo': function() {

        meta = {
            type: 'logo',
            value: Session.get('websiteLogo'),
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    },
    'click #import-pure': function() {

        Meteor.call('importPurePress');

    },
    'click #save-fav': function() {

        meta = {
            type: 'favicon',
            value: Session.get('favicon'),
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    },
    'click #set-name': function() {

        meta = {
            type: 'userName',
            value: $('#user-name').val(),
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    },
    'click #save-social': function() {

        Meteor.call('saveSocial', {
            userId: Meteor.user()._id,
            type: $('#social-type :selected').val(),
            link: $('#social-link').val()
        });

    },
    'click #create-post': function() {

        var post = {
            title: $('#post-title').val(),
            url: $('#post-url').val(),
            cached: false,
            userId: Meteor.user()._id,
            creationDate: new Date(),
            status: 'draft'
        }

        Meteor.call('createPost', post);

    },
    'click #create-brand': function() {

        meta = {
            type: 'brandName',
            value: $('#brand-name').val(),
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    },
    'click #create-page': function() {

        var page = {
            title: $('#page-title').val(),
            url: $('#page-url').val(),
            cached: false,
            userId: Meteor.user()._id,
            type: $('#page-type :selected').val()
        }

        var type = $('#page-type :selected').val();
        if (type == 'purepages') {
            page.purePageId = $('#page-option :selected').val();
        }
        if (type == 'category') {
            page.categoryId = $('#page-option :selected').val();
        }
        if (type == 'link') {
            page.link = $('#page-option').val();
        }

        Meteor.call('createPage', page);

    },
    'click .section-selector': function(event) {

        Session.set('view', event.target.id);

    },
    'click #generate-key': function() {

        Meteor.call('generateApiKey');
    },
    'click #import-posts': function() {

        Meteor.call('importPosts');

    },
    'click #add-integration': function() {

        var accountData = {
            type: $('#integration-type :selected').val(),
            key: $('#integration-key').val(),
            url: $('#integration-url').val(),
            userId: Meteor.user()._id
        };
        Meteor.call('addIntegration', accountData);

    },
    'click #set-list': function() {

        // Set list
        Meteor.call('setList', $('#email-lists :selected').val());

    },
    'click #set-brand': function() {

        // Set list
        Meteor.call('setBrand', $('#pages-brand :selected').val());

    },
    'click #set-pixel': function() {

        meta = {
            type: 'pixelId',
            value: $('#pixel-id').val(),
            userId: Meteor.user()._id
        }

        Meteor.call('insertMeta', meta);

    }

});

Template.admin.helpers({

    showSection: function(section) {
        if (Session.get('view') == section) {
            return 'block';
        } else {
            return 'none';
        }
    },
    integrations: function() {
        return Integrations.find({ userId: Meteor.user()._id });
    },
    posts: function() {
        return Posts.find({ userId: Meteor.user()._id }, { sort: { creationDate: -1 } });
    },
    tags: function() {
        return Tags.find({ userId: Meteor.user()._id });
    },
    categories: function() {
        return Categories.find({ userId: Meteor.user()._id });
    },
    pages: function() {
        return Pages.find({ userId: Meteor.user()._id });
    },
    key: function() {
        return Meteor.user().apiKey;
    },
    networks: function() {
        return Networks.find({ userId: Meteor.user()._id });
    },
    menus: function() {
        return Menus.find({ userId: Meteor.user()._id, parent: { $exists: false } }, { sort: { order: 1 } });
    },
    submenus: function() {
        return Menus.find({ userId: Meteor.user()._id, parent: { $exists: true } });
    },
    products: function() {
        return Products.find({ userId: Meteor.user()._id });
    }

});
