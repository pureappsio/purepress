var cheerio = Npm.require("cheerio");
var minify = Npm.require('html-minifier').minify;

Meteor.methods({

    renderPosts: function() {

        var countryCodes = Meteor.call('getCountryCodes');
        // console.log(countryCodes);
        var posts = Posts.find({}).fetch();

        for (p in posts) {
            // console.log('Render post ' + p);

            for (c in countryCodes) {
                Meteor.call('renderPost', posts[p].url, countryCodes[c], {});
            }

        }

    },
    flushCache: function() {

        // Flush
        console.log('Flushing cache');
        Caches.update({}, { $set: { cached: false } }, { multi: true });
        Pages.update({}, { $set: { cached: false } }, { multi: true });

        // Posts
        Posts.update({}, { $set: { cached: false } }, { multi: true });


    },
    returnFooter: function() {

        if (Meteor.settings.useCache == true) {

            if (Caches.findOne({ element: 'footer' })) {

                // Check status of cache
                var cache = Caches.findOne({ element: 'footer' });

                if (cache.cached == true) {

                    // console.log('Returning cached footer');
                    return cache.html;
                } else {

                    // Render
                    // console.log('Updating footer cache');
                    html = Meteor.call('renderFooter');

                    // Update cache
                    Caches.update({ element: 'footer' }, { $set: { html: html, cached: true } });

                    return html;

                }

            } else {

                // Render
                // console.log('Creating footer cache');
                html = Meteor.call('renderFooter');

                // Create cache
                Caches.insert({ element: 'footer', html: html, cached: true });

                return html;

            }

        } else {
            // console.log('Rendering footer without caching');
            return Meteor.call('renderFooter');
        }

    },
    renderFooter: function() {

        // Compile header
        SSR.compileTemplate('footer', Assets.getText('footer/footer_template.html'));

        var footerHtml = SSR.render('footer');

        return footerHtml;

    },
    returnHeader: function(parameters) {

        // Compile header
        SSR.compileTemplate('header', Assets.getText('header/header_template.html'));

        // Load css
        var css = Assets.getText('main.css');

        if (Metas.findOne({ type: 'theme' })) {

            var value = Metas.findOne({ type: 'theme' }).value;

            if (value == 'black') {
                var navStyle = Assets.getText('nav_dark.css');

            } else {
                var navStyle = Assets.getText('nav_light.css');

            }

        } else {
            var navStyle = Assets.getText('nav_light.css');
        }

        // Load GA tracking code
        if (Metas.findOne({ type: 'analytics' })) {
            var trackingCode = Metas.findOne({ type: 'analytics' }).value;
        } else {
            trackingCode = "";
        }

        // Load FB tracking pixel
        if (Metas.findOne({ type: 'pixelId' })) {
            var pixelId = Metas.findOne({ type: 'pixelId' }).value;
        } else {
            pixelId = "";
        }

        // Helpers
        Template.header.helpers({

            appUrl: function() {

                return Meteor.absoluteUrl();

            },
            twitterLinked: function() {

                if (Networks.findOne({ type: 'twitter' })) {

                    return true;

                } else {
                    return false;
                }

            },
            twitterHandle: function() {

                if (Networks.findOne({ type: 'twitter' })) {

                    var link = Networks.findOne({ type: 'twitter' }).link;

                    var handleIndex = link.indexOf('twitter.com/') + 'twitter.com/'.length;

                    handle = '@' + link.substr(handleIndex);

                    return handle;

                }

            },
            description: function() {

                if (parameters.description) {

                    $ = cheerio.load(parameters.description);

                    return $.text();
                }

            },
            url: function() {

                if (parameters.url) {

                    return parameters.url;
                }

            },
            creationDate: function() {

                if (parameters.creationDate) {

                    return parameters.creationDate
                }

            },
            updatedTime: function() {
                return new Date();
            },
            useChat: function() {

                if (parameters) {
                    if (parameters.useChat) {
                        if (parameters.useChat == true) {
                            return true;
                        }
                    }
                }

            },
            title: function() {

                var brandName = Metas.findOne({ type: "brandName" }).value;

                if (parameters.title) {
                    title = parameters.title + ' - ' + brandName;
                } else {
                    title = brandName;
                }

                return title;

            },
            brandName: function() {

                return Metas.findOne({ type: "brandName" }).value;

            },
            favicon: function() {
                var faviconId = Metas.findOne({ type: "favicon" }).value;
                var image = Images.findOne(faviconId);
                return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
            }
        });

        var headerHtml = SSR.render('header', {
            css: css,
            navStyle: navStyle,
            trackingCode: trackingCode,
            pixelId: pixelId
        });

        // Minify
        headerHtml = minify(headerHtml, { minifyCSS: true, minifyJS: true })

        return headerHtml;

    },
    returnNavbar: function() {

        if (Meteor.settings.useCache == true) {

            if (Caches.findOne({ element: 'navbar' })) {

                // Check status of cache
                var navCache = Caches.findOne({ element: 'navbar' });

                if (navCache.cached == true) {

                    // console.log('Returning cached navbar');
                    return navCache.html;
                } else {

                    // Render
                    // console.log('Updating navbar cache');
                    html = Meteor.call('renderNavbar');

                    // Update cache
                    Caches.update({ element: 'navbar' }, { $set: { html: html, cached: true } });

                    return html;

                }

            } else {

                // Render
                // console.log('Creating navbar cache');
                html = Meteor.call('renderNavbar');

                // Create cache
                Caches.insert({ element: 'navbar', html: html, cached: true });

                return html;

            }

        } else {
            // console.log('Rendering navbar without caching');
            return Meteor.call('renderNavbar');
        }

    },
    renderNavbar: function() {

        // Compile navbar
        SSR.compileTemplate('navbar', Assets.getText('header/navbar_template.html'));

        // Helpers
        Template.navbar.helpers({

            areButtons: function(menuElements) {

                var areButtons = false;

                for (i in menuElements) {
                    if (menuElements[i].style) {
                        if (menuElements[i].style == 'secondary') {
                            areButtons = true;
                        }
                    }
                }

                return areButtons;

            },
            isTextLink: function(menuElement) {

                if (menuElement.style) {

                    if (menuElement.style == 'text') {
                        return true;
                    } else {
                        return false;
                    }

                } else {
                    return true;
                }

            },
            menuElements: function() {
                return Menus.find({ parent: { $exists: false } }, { sort: { order: 1 } });
            },
            isDropdown: function(menuElement) {
                if (Menus.findOne({ parent: menuElement._id })) {
                    return true;
                } else {
                    return false;
                }
            },
            subMenuElements: function(menuElement) {
                return Menus.find({ parent: menuElement._id });
            },
            logoLink: function() {
                var logoId = Metas.findOne({ type: "logo" }).value;
                var image = Images.findOne(logoId);
                return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
            },
            networks: function() {
                return Networks.find({}, { sort: { order: 1 } });
            },
            backgroundColor: function() {

                // Check style
                if (Metas.findOne({ type: 'theme' })) {
                    var theme = Metas.findOne({ type: 'theme' }).value;

                    if (theme == 'black') {
                        return 'background-color: #000000;';
                    } else {
                        return 'background-color: #FFFFFF;';
                    }
                } else {
                    return 'background-color: #FFFFFF;';
                }

            },
            navbarStyle: function() {

                // Check style
                if (Metas.findOne({ type: 'theme' })) {
                    var theme = Metas.findOne({ type: 'theme' }).value;

                    if (theme == 'black') {
                        return 'navbar-light navbar-inverse';
                    } else {
                        return 'navbar-light';
                    }
                } else {
                    return 'navbar-light';
                }
            }
        });

        // Render
        var navbarHtml = SSR.render('navbar');

        return navbarHtml;

    },
    renderExitModal: function(boxId) {

        // Compile navbar
        SSR.compileTemplate('modal', Assets.getText('modals/exit_modal_template.html'));

        // Find box 
        var box = Boxes.findOne(boxId);

        // Helpers
        Template.modal.helpers({

            listId: function() {
                return Integrations.findOne({ type: 'puremail' }).list;
            },
            integrationUrl: function() {
                return Integrations.findOne({ type: 'puremail' }).url;
            }

        });

        // Render
        var html = SSR.render('modal', box);

        return html;

    },
    renderAllPosts: function(pageNumber, categoryId, url) {

        // Render header & navbar
        if (categoryId !== undefined) {

            var categoryName = Categories.findOne(categoryId).name;

            headerHtml = Meteor.call('returnHeader', { title: categoryName });

        } else {

            headerHtml = Meteor.call('returnHeader', { title: 'Blog' });

        }

        navbarHtml = Meteor.call('returnNavbar');
        footerHtml = Meteor.call('returnFooter');

        // Get theme
        if (Metas.findOne({ type: 'blogTheme' })) {
            var theme = Metas.findOne({ type: 'blogTheme' }).value;

            if (theme == 'square') {
                var nbPosts = 9;
                SSR.compileTemplate('allPosts', Assets.getText('posts/all_posts_square.html'));

            }
            if (theme == 'big') {
                var nbPosts = 3;
                SSR.compileTemplate('allPosts', Assets.getText('posts/all_posts.html'));

            }
        } else {

            var theme = 'big';
            var nbPosts = 3;
            SSR.compileTemplate('allPosts', Assets.getText('posts/all_posts.html'));
        }

        // Build pages
        pages = [];
        var pagesLimit = 8;
        if (categoryId !== undefined) {
            nbPages = Math.ceil(Posts.find({ postCategory: categoryId, status: 'published' }).fetch().length / nbPosts);
        } else {
            nbPages = Math.ceil(Posts.find({ status: 'published' }).fetch().length / nbPosts);
        }

        if (nbPages > pagesLimit) {
            nbPages = pagesLimit;
        }

        for (i = 1; i < nbPages + 1; i++) {
            pages.push({ number: i });
        }

        // Get posts
        var currentDate = new Date();
        var postQuery = { status: 'published', creationDate: { $lte: currentDate } };

        if (categoryId !== undefined) {
            postQuery.postCategory = categoryId;
        }

        var posts = Posts.find(postQuery, { sort: { creationDate: -1 }, skip: (pageNumber - 1) * nbPosts, limit: nbPosts }).fetch();

        // Make groups
        var groups = [];
        var groupIndex = 0;
        if (theme == 'square') {
            for (i = 0; i < posts.length; i + 3) {

                groups[groupIndex] = posts.splice(i, i + 3);

                groupIndex++;

            }
        }
        // console.log(groups);

        // Helpers
        Template.allPosts.helpers({

            groups: function() {
                return groups;
            },
            blogPage: function() {

                if (categoryId !== undefined) {

                    return url;

                } else {

                    // Get Meta
                    var meta = Metas.findOne({ type: 'blogPage' });

                    // Get blog page
                    var blogPage = Pages.findOne(meta.value);

                    return blogPage.url;

                }

            },
            pages: function() {
                return pages;
            },
            isExcerpt: function(post) {
                if (post.excerpt == '<p><br></p>' || post.excerpt == '') {
                    return false;
                } else {
                    return true;
                }
            },
            isActive: function(page) {
                if (page.number == pageNumber) {
                    return true;
                }
            },
            posts: function() {
                return posts;
            },
            isFeaturedPicture(post) {
                if (post.featuredPicture) {
                    return true;
                } else {
                    return false;
                }
            },
            postImage: function(featuredPicture) {
                var image = Images.findOne(featuredPicture);
                return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
            },
            formatDate: function(date) {
                var localLocale = moment(date);
                localLocale.locale('en');
                return localLocale.format('LL');
            },
            formatDateFR: function(date) {
                var localLocale = moment(date);
                localLocale.locale('fr');
                return localLocale.format('LL');
            },
            userName: function() {
                return Metas.findOne({ type: 'userName' }).value;
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

            }
        });

        // Render
        var postHtml = SSR.render('allPosts');

        if (theme == 'big') {
            return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";
        }
        if (theme == 'square') {
            return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";
        }


    },


    renderPost: function(postUrl, location, query) {

        // Find post or page
        if (Posts.findOne({ url: postUrl }) || Pages.findOne({ url: postUrl })) {

            // Get Meteor URL
            var websiteUrl = Meteor.absoluteUrl();

            // Look for posts
            if (query.preview) {

                if (Posts.findOne({ url: postUrl })) {
                    var post = Posts.findOne({ url: postUrl });
                }

            } else {
                if (Posts.findOne({ url: postUrl, status: 'published' })) {
                    var post = Posts.findOne({ url: postUrl });
                }
            }

            // Look for pages
            if (Pages.findOne({ url: postUrl })) {
                var post = Pages.findOne({ url: postUrl });
            }

            // Insert stat
            var stat = {

                type: 'visit',
                date: new Date()

            };

            // Type
            if (post.type) {
                stat.pageId = post._id;
            } else {
                stat.postId = post._id;
            }

            // Source
            if (query.origin) {
                stat.origin = query.origin;
            } else {
                stat.origin = 'organic';
            }

            // Type
            if (query.medium) {
                stat.medium = query.medium;
            }

            Meteor.call('insertStat', stat);

            // Calling another page?
            if (post.type == 'purepages') {

                // Grab page
                // console.log('Returning external page');

                // Get page
                query.location = location;
                var page = Meteor.call('getPurePage', post.purePageId, query);

                // Choose header
                if (page.model == 'saas') {

                    // Render header & navbar
                    var headerParameters = { title: page.title, url: Meteor.absoluteUrl() + postUrl };
                    if (Meteor.settings.useChat == true) {
                        headerParameters.useChat = true;
                    }

                    headerHtml = Meteor.call('returnHeader', headerParameters);

                    navbarHtml = Meteor.call('returnNavbar');
                    footerHtml = Meteor.call('returnFooter');

                    return headerHtml + "<body>" + navbarHtml + "<div>" + page.html + "</div>" + footerHtml + "</body>";

                } else {

                    // Get header
                    var header = Meteor.call('getPurePageHeader', post.purePageId);
                    return header.html + "<body><div class='container-fluid main-container'>" + page.html + "</div></body>";

                }

            } else if (post.type == 'category') {

                if (query.page) {
                    return Meteor.call('renderAllPosts', query.page, post.categoryId, post.url);
                } else {
                    return Meteor.call('renderAllPosts', 1, post.categoryId, post.url);
                }

            } else {

                // Render header & navbar
                var headerParameters = { title: post.title, url: Meteor.absoluteUrl() + postUrl };
                if (Meteor.settings.useChat == true && post.type) {
                    headerParameters.useChat = true;
                }
                if (post.excerpt) {
                    headerParameters.description = post.excerpt;
                }
                if (post.creationDate) {
                    headerParameters.creationDate = post.creationDate;
                }

                headerHtml = Meteor.call('returnHeader', headerParameters);

                navbarHtml = Meteor.call('returnNavbar');
                footerHtml = Meteor.call('returnFooter');

                // Check if cached
                // var countryCode = Meteor.call('getCountryCodeLocation', location);
                // console.log(post.cached);

                if (post.cached == true && !(query.origin)) {

                    // Get render
                    if (post.type) {
                        // console.log('Page cached, returning cached version');

                        // Return cached HTML
                        var postHtml = post.html;

                    } else {

                        // console.log('Post cached, returning cached version');

                        // Return cached HTML
                        var postHtml = Meteor.call('getLocalisedHtml', post, location);

                        // Add email box?
                        if (post.signupBox) {

                            if (post.signupBox != 'none') {
                                console.log('Adding signup');
                                var boxHtml = Meteor.call('renderEmailBox', post, query);
                                postHtml += boxHtml;
                            }
                        }

                        // Add disqus?
                        if (Metas.findOne({ type: 'disqus' })) {
                            console.log('Adding disqus');
                            parameters = {
                                url: post.url,
                                websiteUrl: websiteUrl
                            };
                            var commentHtml = Meteor.call('renderDisqus', parameters);
                            console.log(commentHtml);
                            postHtml += commentHtml;
                        }

                    }

                    return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";

                } else {

                    // Compile
                    if (post.type) {

                        // console.log('Page not cached, rendering');

                        // Compile
                        SSR.compileTemplate('postTemplate',
                            Assets.getText('pages/page_template.html'));


                        // Build products for store
                        var products = [];
                        if (Products.find({}).fetch().length > 0) {

                            var allProducts = Products.find({}).fetch();

                            for (i = 0; i < allProducts.length; i++) {

                                // Get product from store
                                var storeProduct = Meteor.call('getProductData', allProducts[i].productId);

                                if (storeProduct) {

                                    // Get sales page
                                    var salesPageUrl = Pages.findOne(allProducts[i].pageId).url;
                                    storeProduct.salesPageUrl = salesPageUrl;

                                    // Add
                                    products.push(storeProduct);
                                }

                            }

                        }

                        // Build portfolio
                        if (Meteor.call('hasElement', post._id, 'portfolio')) {

                            if (Integrations.findOne({ type: 'pureportfolio' })) {

                                // Get integration
                                // console.log('Grabing portfolio');
                                var integration = Integrations.findOne({ type: 'pureportfolio' });

                                // Get portfolio
                                var portfolio = HTTP.get('https://' + integration.url + '/api/portfolio?option=array').data;

                                // Sort
                                portfolio.sort(function(a, b) {
                                    if (a.value > b.value)
                                        return -1;
                                    if (a.value < b.value)
                                        return 1;
                                    // a doit être égale à b
                                    return 0;
                                });

                                // Format
                                var translation = {
                                    'p2p': 'Peer-to-Peer Lending',
                                    'stock': 'Dividend Paying Stocks',
                                    'realestate': 'Real Estate Crowdfunding',
                                    'website': 'Profitable Websites',
                                    'cash': 'Cash',
                                    'equity': 'Private Equity'
                                };
                                for (s in portfolio) {
                                    portfolio[s].type = translation[portfolio[s].type];
                                    portfolio[s].value = portfolio[s].value.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                                    portfolio[s].yield = portfolio[s].yield.toFixed(2);
                                    portfolio[s].income = (portfolio[s].income / 12).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                                }

                                // Get total
                                var total = HTTP.get('https://' + integration.url + '/api/total').data;

                                // Format
                                total.value = (total.value).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                                total.yield = (total.yield).toFixed(2);
                                total.monthlyIncome = (total.income / 12).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");;



                            }

                        } else {
                            portfolio = {};
                            total = {};
                        }

                        if (Meteor.call('hasElement', post._id, 'portfoliodetail')) {

                            if (Integrations.findOne({ type: 'pureportfolio' })) {

                                var integration = Integrations.findOne({ type: 'pureportfolio' });

                                // Build individual positions
                                var p2p = HTTP.get('https://' + integration.url + '/api/positions?type=p2p').data;
                                var stock = HTTP.get('https://' + integration.url + '/api/positions?type=stock').data;
                                var realestate = HTTP.get('https://' + integration.url + '/api/positions?type=realestate').data;

                                var positions = {
                                    p2p: p2p,
                                    stock: stock,
                                    realestate: realestate
                                }
                            }


                        } else {
                            var positions = {};
                        }

                        // Pricing
                        if (Meteor.call('hasElement', post._id, 'pricing')) {

                            // Get all elements
                            var pricingElements = Pricing.find({ type: 'element' }, { sort: { order: 1 } }).fetch();
                            var pricingStructures = Pricing.find({ type: 'structure' }, { sort: { order: 1 } }).fetch();

                            // Combine
                            pricingData = [];
                            for (i in pricingStructures) {
                                var pricingLine = pricingStructures[i];

                                var data = [];
                                for (j in pricingElements) {
                                    data.push(pricingElements[j].features[pricingLine._id]);
                                }
                                pricingLine.data = data;
                                pricingData.push(pricingLine);
                            }

                            console.log(pricingData);


                        } else {
                            var pricingElements = [];
                            var pricingStructures = [];
                            var pricingData = [];
                        }

                        // Exit intent
                        // if (Meteor.call('hasElement', post._id, 'signupbox')) {

                        //     var element = Meteor.call('getElement', post._id, 'signupbox');
                        //     var exitIntentHtml = Meteor.call('renderExitModal', element.boxId);

                        // }

                        // if (Meteor.call('hasElement', post._id, 'emailsignup')) {

                        //     var element = Meteor.call('getElement', post._id, 'emailsignup');
                        //     var exitIntentHtml = Meteor.call('renderExitModal', element.boxId);

                        // }

                        // Latest posts
                        var posts = Posts.find({}, { sort: { creationDate: -1 }, limit: 2 });

                        // Helpers
                        Template.postTemplate.helpers({

                            integrationUrl: function() {

                                if (Integrations.findOne({ type: 'puremail' })) {
                                    return Integrations.findOne({ type: 'puremail' }).url;
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
                            elements: function() {
                                return Elements.find({ pageId: post._id }, { sort: { order: 1 } });
                            },
                            isElementType: function(element, elementType) {

                                if (element.type == elementType) {
                                    return true;
                                }
                            },
                            elementImage: function(element) {
                                var image = Images.findOne(element.image);
                                if (image) {
                                    return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                                } else {
                                    return "";
                                }

                            },
                            isImage: function(element) {

                                var image = Images.findOne(element.image);
                                if (image) {
                                    return true;
                                } else {
                                    return false;
                                }

                            },
                            userName: function() {
                                return Metas.findOne({ type: 'userName' }).value;
                            },
                            signupBoxContent: function(element) {
                                if (element.type == 'emailsignup' || element.type == 'signupbox') {
                                    if (Boxes.findOne(element.boxId)) {
                                        return Boxes.findOne(element.boxId).boxContent;
                                    }

                                }
                            },
                            signupPopupContent: function(element) {
                                if (element.type == 'emailsignup' || element.type == 'signupbox') {
                                    if (Boxes.findOne(element.boxId)) {
                                        return Boxes.findOne(element.boxId).popupContent;
                                    }

                                }
                            },
                            tags: function(element) {
                                if (Boxes.findOne(element.boxId)) {
                                    return Boxes.findOne(element.boxId).tags;
                                }

                            },
                            listId: function(element) {
                                if (element.type == 'emailsignup' || element.type == 'signupbox') {
                                    return Integrations.findOne({ type: 'puremail' }).list;
                                }
                            },
                            sequenceId: function(element) {
                                if (element.type == 'emailsignup' || element.type == 'signupbox') {
                                    if (Boxes.findOne(element.boxId)) {
                                        return Boxes.findOne(element.boxId).sequence;
                                    }

                                }
                            },
                            products: function() {
                                return products;
                            },
                            pricingElements: function() {
                                return pricingElements;
                            },
                            pricingStructures: function() {
                                return pricingStructures;
                            },
                            pricingData: function() {
                                return pricingData;
                            },
                            isPictureTwo: function(element) {
                                if (element.pictureTwo != "") {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                            portfolio: function() {
                                return portfolio;
                            },
                            positions: function(type) {
                                return positions[type];
                            },
                            isStock: function(type) {
                                if (type == 'stock') {
                                    return true;
                                }
                            },
                            total: function() {
                                return total;
                            },
                            formatMoney: function(number) {
                                return parseFloat(number).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                            },
                            posts: function() {
                                return posts;
                            },
                            postImage: function(featuredPicture) {
                                var image = Images.findOne(featuredPicture);
                                if (image) {
                                    return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                                }
                            },
                            formatDate: function(date) {
                                return moment(date).format('MMMM Do YYYY');
                            }

                        });


                    } else {

                        if (post.category == 'recipe') {

                            // Compile
                            SSR.compileTemplate('postTemplate', Assets.getText('posts/recipe_template.html'));

                            // Helpers
                            Template.postTemplate.helpers({

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

                                postImage: function(featuredPicture) {

                                    var image = Images.findOne(featuredPicture);
                                    if (image) {
                                        return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                                    }
                                },
                                formatDate: function(date) {
                                    return moment(date).format('MMMM Do YYYY');
                                },
                                userName: function() {
                                    return Metas.findOne({ type: 'userName' }).value;
                                },
                                isEmailBox: function() {
                                    if (this.signupBox) {
                                        if (this.signupBox != 'none') {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                },
                                steps: function() {
                                    return Elements.find({ postId: this._id, type: 'step' }, { sort: { order: 1 } });
                                },
                                ingredients: function() {
                                    return Elements.find({ postId: this._id, type: 'ingredient' }, { sort: { order: 1 } });
                                }
                            });

                        } else if (post.category == 'affiliate') {

                            // Get theme
                            if (Metas.findOne({ type: 'affiliateTheme' })) {
                                var selectedTheme = Metas.findOne({ type: 'affiliateTheme' }).value;
                            } else {
                                var selectedTheme = 'default';
                            }

                            // Compile
                            SSR.compileTemplate('postTemplate', Assets.getText('posts/affiliate_post_template.html'));

                            // Helpers
                            Template.postTemplate.helpers({

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

                                postImage: function(featuredPicture) {

                                    var image = Images.findOne(featuredPicture);
                                    if (image) {
                                        return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                                    }
                                },
                                formatDate: function(date) {
                                    return moment(date).format('MMMM Do YYYY');
                                },
                                userName: function() {
                                    return Metas.findOne({ type: 'userName' }).value;
                                },

                                elements: function() {
                                    return Elements.find({ $or: [{ postId: this._id, type: 'affiliate' }, { postId: this._id, type: { $exists: false } }] }, { sort: { rank: 1 } });
                                },
                                elementImage: function(element) {
                                    if (element.picture) {
                                        var image = Images.findOne(element.picture);
                                        return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                                    }
                                },
                                isAffiliateTheme: function(theme) {
                                    if (selectedTheme == theme) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                hasDescription: function(element) {
                                    if (element.description != "" && element.description != '<p><br></p>') {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                hasMiddleContent: function() {
                                    if (this.middle != "" && this.middle != '<p><br></p>') {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },

                                rating: function(element) {
                                    var answer = "";
                                    var fullStars = Math.trunc(element.rating);
                                    var decimalPart = element.rating - Math.trunc(element.rating);
                                    for (i = 0; i < fullStars; i++) {
                                        answer += '<i class="fa fa-star" aria-hidden="true"></i>';
                                    }
                                    if (decimalPart == 0) {
                                        var emptyStars = 5 - fullStars;
                                    } else {
                                        answer += '<i class="fa fa-star-half-o" aria-hidden="true"></i>';
                                        var emptyStars = 4 - fullStars;
                                    }
                                    for (i = 0; i < emptyStars; i++) {
                                        answer += '<i class="fa fa-star-o" aria-hidden="true"></i>';
                                    }

                                    return answer;
                                },
                                siteUrl: function() {
                                    return websiteUrl;
                                }
                            });

                        } else {

                            // Compile
                            SSR.compileTemplate('postTemplate', Assets.getText('posts/post_template.html'));

                            // Helpers
                            Template.postTemplate.helpers({
                                postImage: function(featuredPicture) {
                                    var image = Images.findOne(featuredPicture);
                                    if (image) {
                                        return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                                    }
                                },
                                isPodcast: function() {
                                    if (this.podcastUrl || this.podcastFileId) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                podcastLink: function() {
                                    if (this.podcastUrl) {
                                        return this.podcastUrl;
                                    }
                                    if (this.podcastFileId) {
                                        var file = Images.findOne(this.podcastFileId);
                                        return '/cdn/storage/Images/' + file._id + '/original/' + file._id + '.' + file.ext;
                                    }
                                },
                                integrationUrl: function() {

                                    if (Integrations.findOne({ type: 'puremail' })) {
                                        return Integrations.findOne({ type: 'puremail' }).url;
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
                                formatDate: function(date) {
                                    var localLocale = moment(date);
                                    localLocale.locale('en');
                                    return localLocale.format('LL');
                                },
                                formatDateFR: function(date) {
                                    var localLocale = moment(date);
                                    localLocale.locale('fr');
                                    return localLocale.format('LL');
                                },
                                userName: function() {
                                    return Metas.findOne({ type: 'userName' }).value;
                                },
                                tags: function() {
                                    if (Boxes.findOne(this.signupBox)) {
                                        return Boxes.findOne(this.signupBox).tags;

                                    }
                                },
                                siteUrl: function() {
                                    return websiteUrl;
                                }
                            });

                        }
                    }

                    // Render
                    var rawHtml = SSR.render('postTemplate', post);

                    // Highlight
                    $ = cheerio.load(rawHtml);
                    $('pre').each(function(i, elem) {

                        $(elem).removeClass('EnlighterJSRAW');

                    });

                    rawHtml = $.html();

                    // Save
                    if (post.type) {

                        // Add modal?
                        // if (exitIntentHtml) {
                        //     rawHtml += exitIntentHtml;
                        // }

                        if (query.origin) {
                            Pages.update({ url: postUrl }, { $set: { cached: false, html: rawHtml } })
                        } else {
                            Pages.update({ url: postUrl }, { $set: { cached: true, html: rawHtml } })
                        }

                        postHtml = rawHtml;

                    } else {

                        // Process for affiliate links
                        var renderedHtml = Meteor.call('rawProcessHTMLAmazon', rawHtml);

                        // Get cache & html
                        if (post.html) {
                            var html = post.html;
                        } else {
                            html = {};
                        }

                        // Update
                        // cache[countryCode] = true;
                        html['US'] = renderedHtml;
                        Posts.update({ url: postUrl }, { $set: { cached: true, html: html } })
                            // }

                        // Get localised HTML
                        var postHtml = Meteor.call('getLocalisedHtml', { html: html }, location);

                        // Add email box?
                        if (post.signupBox) {

                            if (post.signupBox != 'none') {
                                console.log('Adding signup');
                                var boxHtml = Meteor.call('renderEmailBox', post, query);
                                postHtml += boxHtml;
                            }
                        }

                        // Add disqus?
                        if (Metas.findOne({ type: 'disqus' })) {
                            console.log('Adding disqus');
                            parameters = {
                                url: post.url,
                                websiteUrl: websiteUrl
                            };
                            var commentHtml = Meteor.call('renderDisqus', parameters);
                            postHtml += commentHtml;
                        }


                    }

                }

                return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";

            }

        } else {

            // Render header & navbar
            headerHtml = Meteor.call('returnHeader', {});
            navbarHtml = Meteor.call('returnNavbar');
            footerHtml = Meteor.call('returnFooter');

            return headerHtml + "<body>" + navbarHtml + footerHtml + "</body>";
        }

    }

});
