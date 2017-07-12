import Images from '../imports/api/files';

var cheerio = Npm.require("cheerio");
var minify = Npm.require('html-minifier').minify;

Meteor.methods({

    getOrigin: function(referer) {

        var origin = 'organic';

        if (referer.includes('instagram') || referer.includes('pinterest') || referer.includes('youtube') || referer.includes('facebook') || referer.includes('twitter')) {
            origin = 'social';
        }

        return origin;

    },
    getMedium: function(referer) {

        var medium = 'google';

        if (referer.includes('youtube')) {
            medium = 'youtube';
        }
        if (referer.includes('facebook')) {
            medium = 'facebook';
        }
        if (referer.includes('pinterest')) {
            medium = 'pinterest';
        }
        if (referer.includes('instagram')) {
            medium = 'instagram';
        }
        if (referer.includes('twitter')) {
            medium = 'twitter';
        }

        return medium;

    },
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
    renderFooter: function(userId, ) {

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

        if (Metas.findOne({ userId: parameters.userId, type: 'theme' })) {

            var value = Metas.findOne({ userId: parameters.userId, type: 'theme' }).value;

            if (value == 'black') {
                var navStyle = Assets.getText('nav_dark.css');

            } else {
                var navStyle = Assets.getText('nav_light.css');

            }

        } else {
            var navStyle = Assets.getText('nav_light.css');
        }

        // Load GA tracking code
        if (Metas.findOne({ userId: parameters.userId, type: 'analytics' })) {
            var trackingCode = Metas.findOne({ userId: parameters.userId, type: 'analytics' }).value;
        } else {
            trackingCode = "";
        }

        // Load FB tracking pixel
        if (Metas.findOne({ userId: parameters.userId, type: 'pixelId' })) {
            var pixelId = Metas.findOne({ userId: parameters.userId, type: 'pixelId' }).value;
        } else {
            pixelId = "";
        }

        // Helpers
        Template.header.helpers({

            recorder: function() {

                if (parameters.recorder) {
                    return true;
                }

            },
            appUrl: function() {

                return Meteor.absoluteUrl();

            },
            twitterLinked: function() {

                if (Networks.findOne({ userId: parameters.userId, type: 'twitter' })) {

                    return true;

                } else {
                    return false;
                }

            },
            twitterHandle: function() {

                if (Networks.findOne({ userId: parameters.userId, type: 'twitter' })) {

                    var link = Networks.findOne({ userId: parameters.userId, type: 'twitter' }).link;

                    var handleIndex = link.indexOf('twitter.com/') + 'twitter.com/'.length;

                    handle = '@' + link.substr(handleIndex);

                    return handle;

                }

            },
            description: function() {

                if (parameters.description) {

                    $ = cheerio.load(parameters.description);
                    var text = $.text();

                    if (text.length >= 155) {
                        text = text.substring(0, 150) + ' ...';
                    }

                    return text;
                }

            },
            featuredPicture: function() {

                if (parameters.featuredPicture) {

                    // console.log(Images.findOne(parameters.featuredPicture));

                    var pictureUrl = Images.findOne(parameters.featuredPicture).link();

                    return pictureUrl;
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

                var title = 'PurePress';

                if (Metas.findOne({ userId: parameters.userId, type: "brandName" })) {
                    var brandName = Metas.findOne({ userId: parameters.userId, type: "brandName" }).value;

                    if (parameters.title) {
                        title = parameters.title;
                    } else {
                        title = brandName;
                    }
                }

                return title;

            },
            brandName: function() {

                var brandName = 'PurePress';

                if (Metas.findOne({ userId: parameters.userId, type: "brandName" })) {
                    brandName = Metas.findOne({ userId: parameters.userId, type: "brandName" }).value;
                }

                return brandName;

            },
            favicon: function() {
                if (Metas.findOne({ userId: parameters.userId, type: "favicon" })) {
                    var faviconId = Metas.findOne({ userId: parameters.userId, type: "favicon" }).value;
                    var image = Images.findOne(faviconId);
                    return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                } else {
                    return '';
                }

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
    returnNavbar: function(userId) {

        if (Meteor.settings.useCache == true) {

            if (Caches.findOne({ element: 'navbar', userId: userId })) {

                // Check status of cache
                var navCache = Caches.findOne({ userId: userId, element: 'navbar' });

                if (navCache.cached == true) {

                    // console.log('Returning cached navbar');
                    return navCache.html;
                    
                } else {

                    // Render
                    // console.log('Updating navbar cache');
                    html = Meteor.call('renderNavbar', userId);

                    // Update cache
                    Caches.update({ userId: userId, element: 'navbar' }, { $set: { html: html, cached: true } });

                    return html;

                }

            } else {

                // Render
                // console.log('Creating navbar cache');
                html = Meteor.call('renderNavbar', userId);

                // Create cache
                Caches.insert({ userId: userId, element: 'navbar', html: html, cached: true });

                return html;

            }

        } else {
            // console.log('Rendering navbar without caching');
            return Meteor.call('renderNavbar', userId);
        }

    },
    renderNavbar: function(userId) {

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
                return Menus.find({ userId: userId, parent: { $exists: false } }, { sort: { order: 1 } });
            },
            isDropdown: function(menuElement) {

                if (Menus.findOne({ userId: userId, parent: menuElement._id })) {
                    return true;
                } else {
                    return false;
                }
            },
            subMenuElements: function(menuElement) {
                return Menus.find({ userId: userId, parent: menuElement._id });
            },
            logoLink: function() {

                if (Metas.findOne({ userId: userId, type: "logo" })) {
                    var logoId = Metas.findOne({ userId: userId, type: "logo" }).value;
                    var image = Images.findOne(logoId);
                    return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;

                } else {
                    return '';
                }

            },
            networks: function() {
                return Networks.find({ userId: userId }, { sort: { order: 1 } });
            },
            backgroundColor: function() {

                // Check style
                if (Metas.findOne({ userId: userId, type: 'theme' })) {
                    var theme = Metas.findOne({ userId: userId, type: 'theme' }).value;

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
                if (Metas.findOne({ userId: userId, type: 'theme' })) {
                    var theme = Metas.findOne({ userId: userId, type: 'theme' }).value;

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
    renderAllPosts: function(parameters) {

        console.log(parameters);

        // Render header & navbar
        if (parameters.categoryId !== undefined) {

            var categoryName = Categories.findOne(parameters.categoryId).name;

            headerHtml = Meteor.call('returnHeader', { title: categoryName, userId: parameters.userId });

        } else {

            headerHtml = Meteor.call('returnHeader', { title: 'Blog', userId: parameters.userId });

        }

        // Footer
        navbarHtml = Meteor.call('returnNavbar', parameters.userId);
        footerHtml = Meteor.call('returnFooter', parameters.userId);

        // Insert stat
        if (parameters.url) {
            var page = Pages.findOne({ url: parameters.url });
            Meteor.call('insertSession', {
                type: 'visit',
                postId: page._id,
                postType: 'page',
                query: parameters.query,
                headers: parameters.headers,
                userId: parameters.userId
            });
        }

        // Get theme
        if (Metas.findOne({ type: 'blogTheme', userId: parameters.userId })) {
            var theme = Metas.findOne({ type: 'blogTheme', userId: parameters.userId }).value;

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
        if (parameters.categoryId !== undefined) {
            nbPages = Math.ceil(Posts.find({ userId: parameters.userId, postCategory: parameters.categoryId, status: 'published' }).count() / nbPosts);
        } else {
            nbPages = Math.ceil(Posts.find({ userId: parameters.userId, status: 'published' }).count() / nbPosts);
        }

        if (nbPages > pagesLimit) {
            nbPages = pagesLimit;
        }

        for (i = 1; i < nbPages + 1; i++) {
            pages.push({ number: i });
        }

        // Get posts
        var currentDate = new Date();
        var postQuery = { userId: parameters.userId, status: 'published', creationDate: { $lte: currentDate } };

        if (parameters.categoryId !== undefined) {
            postQuery.postCategory = parameters.categoryId;
        }

        var posts = Posts.find(postQuery, { sort: { creationDate: -1 }, skip: (parameters.pageNumber - 1) * nbPosts, limit: nbPosts }).fetch();

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

                if (parameters.categoryId !== undefined) {

                    return url;

                } else {

                    // Get Meta
                    var meta = Metas.findOne({ type: 'blogPage', userId: parameters.userId });

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
                if (page.number == parameters.pageNumber) {
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
                return Metas.findOne({ type: 'userName', userId: parameters.userId }).value;
            },
            langEN: function() {

                if (Metas.findOne({ type: 'language', userId: parameters.userId })) {

                    if (Metas.findOne({ type: 'language', userId: parameters.userId }).value == 'fr') {
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

        // Add exit intent?
        if (Metas.findOne({ type: 'exitStatus' })) {

            // Check value
            var exitStatus = Metas.findOne({ type: 'exitStatus', userId: parameters.userId }).value;

            if (exitStatus == 'on') {
                var exitHtml = Meteor.call('renderExitModal', {
                    query: parameters.query
                });
                postHtml += exitHtml;
            }

        }

        if (theme == 'big') {
            return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";
        }
        if (theme == 'square') {
            return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";
        }


    },
    renderPost: function(parameters) {

        console.log(parameters);

        // Parameters
        var postUrl = parameters.url;
        var location = parameters.location;
        var query = parameters.query;
        var headers = parameters.headers;

        // Find post or page
        if (Posts.findOne({ url: postUrl, userId: parameters.userId }) || Pages.findOne({ url: postUrl, userId: parameters.userId })) {

            // Get Meteor URL
            var websiteUrl = Meteor.absoluteUrl();

            // Look for posts
            if (query.preview) {

                if (Posts.findOne({ url: postUrl, userId: parameters.userId })) {
                    var post = Posts.findOne({ url: postUrl, userId: parameters.userId });
                }

            } else {
                if (Posts.findOne({ url: postUrl, status: 'published', userId: parameters.userId })) {
                    var post = Posts.findOne({ url: postUrl, userId: parameters.userId });
                }
            }

            // Look for pages
            if (Pages.findOne({ url: postUrl, userId: parameters.userId })) {
                var post = Pages.findOne({ url: postUrl, userId: parameters.userId });
            }

            // Insert stat
            if (post.type) {
                postType = 'page';
            } else {
                postType = 'post';
            }

            Meteor.call('insertSession', {
                type: 'visit',
                postId: post._id,
                postType: postType,
                query: query,
                headers: headers,
                userId: parameters.userId
            });

            // Calling another page?
            if (post.type == 'purepages') {

                // Get page
                query.location = location;

                var startGetPage = new Date();
                var page = Meteor.call('getPurePage', post.purePageId, query);
                var endGetPage = new Date();
                console.log('Time to grab purepage: ', (endGetPage.getTime() - startGetPage.getTime()) + ' ms');

                // Choose header
                if (page.model == 'saas') {

                    // Render header & navbar
                    var headerParameters = { userId: parameters.userId, title: page.title, url: Meteor.absoluteUrl() + postUrl };
                    if (Meteor.settings.useChat == true) {
                        headerParameters.useChat = true;
                    }

                    headerHtml = Meteor.call('returnHeader', headerParameters);

                    navbarHtml = Meteor.call('returnNavbar', parameters.userId);
                    footerHtml = Meteor.call('returnFooter', parameters.userId);

                    return headerHtml + "<body>" + navbarHtml + "<div>" + page.html + "</div>" + footerHtml + "</body>";

                } else {

                    // Get header
                    var startGetPage = new Date();
                    var header = Meteor.call('getPurePageHeader', post.purePageId);
                    var endGetPage = new Date();
                    console.log('Time to grab header purepage: ', (endGetPage.getTime() - startGetPage.getTime()) + ' ms');
                    return header.html + "<body><div class='container-fluid main-container'>" + page.html + "</div></body>";

                }

            } else if (post.type == 'category') {

                if (query.page) {
                    return Meteor.call('renderAllPosts', {
                        userId: parameters.userId,
                        page: query.page,
                        categoryId: post.categoryId,
                        url: post.url
                    });
                } else {
                    return Meteor.call('renderAllPosts', {
                        userId: parameters.userId,
                        page: 1,
                        categoryId: post.categoryId,
                        url: post.url
                    });
                }

            } else {

                // Render header & navbar
                var headerParameters = {
                    userId: parameters.userId,
                    title: post.title,
                    url: Meteor.absoluteUrl() + postUrl
                };
                if (Meteor.settings.useChat == true && post.type) {
                    headerParameters.useChat = true;
                }
                if (post.excerpt) {
                    headerParameters.description = post.excerpt;
                }
                if (post.creationDate) {
                    headerParameters.creationDate = post.creationDate;
                }
                if (post.featuredPicture) {
                    headerParameters.featuredPicture = post.featuredPicture;
                }
                if (Meteor.call('hasElement', post._id, 'audiorecord')) {
                    headerParameters.recorder = true;
                }

                headerHtml = Meteor.call('returnHeader', headerParameters);

                navbarHtml = Meteor.call('returnNavbar', parameters.userId);
                footerHtml = Meteor.call('returnFooter', parameters.userId);

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

                        console.log('Post cached, returning cached version');

                        // Return cached HTML
                        var postHtml = Meteor.call('getLocalisedHtml', post, location);

                        // Add social sharing
                        if (post.type) {
                            console.log('No social share for pages');
                        } else {

                            var browser = Meteor.call('detectBrowser', headers);

                            if (browser == 'desktop') {
                                var socialShare = Meteor.call('renderSocialShare', {
                                    postUrl: websiteUrl + postUrl,
                                    post: post,
                                    userId: parameters.userId
                                });

                                postHtml = socialShare + postHtml;
                            }

                        }

                        // Add email box?
                        if (post.signupBox) {

                            if (post.signupBox != 'none') {
                                // console.log('Adding signup');
                                var boxHtml = Meteor.call('renderEmailBox', post, query);
                                postHtml += boxHtml;
                            }
                        }

                        // Add disqus?
                        if (Metas.findOne({ type: 'disqus', userId: parameters.userId })) {
                            if (Metas.findOne({ type: 'disqus', userId: parameters.userId }).value != "") {
                                parameters = {
                                    url: post.url,
                                    websiteUrl: websiteUrl
                                };
                                var commentHtml = Meteor.call('renderDisqus', parameters);
                                postHtml += commentHtml;
                            }
                        }

                    }

                    // Add exit intent?
                    if (Metas.findOne({ type: 'exitStatus', userId: parameters.userId })) {

                        // Check value
                        var exitStatus = Metas.findOne({ type: 'exitStatus', userId: parameters.userId }).value;

                        if (exitStatus == 'on') {
                            var exitHtml = Meteor.call('renderExitModal', {
                                query: query
                            });
                            postHtml += exitHtml;
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
                        if (Meteor.call('hasElement', post._id, 'store')) {
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
                        if (Meteor.call('hasElement', post._id, 'latestposts')) {
                            var posts = Posts.find({ userId: parameters.userId }, { sort: { creationDate: -1 }, limit: 3 });
                        }

                        // Best posts
                        if (Meteor.call('hasElement', post._id, 'bestposts')) {
                            if (Statistics.findOne({ type: 'visitedPosts', userId: parameters.userId })) {

                                // Get best posts
                                var bestPostsStats = Statistics.findOne({ type: 'visitedPosts', userId: parameters.userId }).value;
                                if (bestPostsStats.length > 6) {
                                    bestPostsStats = bestPostsStats.slice(0, 6);
                                } else {
                                    bestPostsStats = bestPostsStats.slice(0, 3);
                                }

                                var bestPosts = [];
                                for (i in bestPostsStats) {
                                    bestPosts.push(Posts.findOne(bestPostsStats[i]._id));
                                }

                            } else {
                                var bestPosts = [];
                            }
                        }

                        // Helpers
                        Template.postTemplate.helpers({

                            integrationUrl: function() {

                                if (Integrations.findOne({ type: 'puremail' })) {
                                    return Integrations.findOne({ type: 'puremail' }).url;
                                }

                            },
                            langEN: function() {

                                if (Metas.findOne({ type: 'language', userId: parameters.userId })) {

                                    if (Metas.findOne({ type: 'language', userId: parameters.userId }).value == 'fr') {
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
                                return Metas.findOne({ type: 'userName', userId: parameters.userId }).value;
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
                            bestPosts: function() {
                                return bestPosts;
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

                                    if (Metas.findOne({ type: 'language', userId: parameters.userId })) {

                                        if (Metas.findOne({ type: 'language', userId: parameters.userId }).value == 'fr') {
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
                                    return Metas.findOne({ type: 'userName', userId: parameters.userId }).value;
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
                            if (Metas.findOne({ type: 'affiliateTheme', userId: parameters.userId })) {
                                var selectedTheme = Metas.findOne({ type: 'affiliateTheme', userId: parameters.userId }).value;
                            } else {
                                var selectedTheme = 'default';
                            }

                            // Compile
                            SSR.compileTemplate('postTemplate', Assets.getText('posts/affiliate_post_template.html'));

                            // Helpers
                            Template.postTemplate.helpers({

                                langEN: function() {

                                    if (Metas.findOne({ type: 'language', userId: parameters.userId })) {

                                        if (Metas.findOne({ type: 'language', userId: parameters.userId }).value == 'fr') {
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
                                    return Metas.findOne({ type: 'userName', userId: parameters.userId }).value;
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

                        } else if (post.category == 'report') {

                            // Compile
                            SSR.compileTemplate('postTemplate', Assets.getText('posts/income_report_template.html'));

                            // Get business report
                            var businessReport = Meteor.call('getBusinessReport', post.month, post.year);

                            // Get investment report
                            var investmentReport = Meteor.call('getInvestmentReport', post.month, post.year);
                            console.log(investmentReport);

                            // Helpers
                            Template.postTemplate.helpers({

                                total: function() {

                                    var total = parseFloat(businessReport.profits.current) + parseFloat(investmentReport.global.current);
                                    var variation = parseFloat(businessReport.profits.variation) + parseFloat(investmentReport.global.variation);
                                    var past = parseFloat(businessReport.profits.current) - parseFloat(businessReport.profits.variation) + parseFloat(investmentReport.global.current) - parseFloat(investmentReport.global.variation);
                                    var percent = variation / past * 100;

                                    return {
                                        current: total.toFixed(2),
                                        variation: variation.toFixed(2),
                                        variation_percent: percent.toFixed(2)
                                    }

                                },
                                report: function() {

                                    return businessReport;

                                },
                                sign: function(amount) {

                                    if (amount == 'Infinity') {
                                        return 0;
                                    } else {
                                        if (amount >= 0) {
                                            return '+' + amount;
                                        } else {
                                            return amount;
                                        }
                                    }

                                },
                                variation: function(amount) {

                                    if (amount >= 0) {
                                        return 'text-success';
                                    } else {
                                        return 'text-danger';
                                    }

                                },
                                invest: function() {

                                    return investmentReport;

                                },
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

                                    if (Metas.findOne({ type: 'language', userId: parameters.userId })) {

                                        if (Metas.findOne({ type: 'language', userId: parameters.userId }).value == 'fr') {
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
                                    return Metas.findOne({ type: 'userName', userId: parameters.userId }).value;
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

                                    if (Metas.findOne({ type: 'language', userId: parameters.userId })) {

                                        if (Metas.findOne({ type: 'language', userId: parameters.userId }).value == 'fr') {
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
                                    return Metas.findOne({ type: 'userName', userId: parameters.userId }).value;
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
                            Pages.update({ url: postUrl, userId: parameters.userId }, { $set: { cached: false, html: rawHtml } })
                        } else {
                            Pages.update({ url: postUrl, userId: parameters.userId }, { $set: { cached: true, html: rawHtml } })
                        }

                        postHtml = rawHtml;

                    } else {

                        // Process for affiliate links
                        var renderedHtml = Meteor.call('rawProcessHTMLAmazon', rawHtml);

                        // Get cache & HTML
                        if (post.html) {
                            var html = post.html;
                        } else {
                            html = {};
                        }

                        // Update
                        html['US'] = renderedHtml;
                        Posts.update({ url: postUrl, userId: parameters.userId }, { $set: { cached: true, html: html } })

                        // Get localised HTML
                        var postHtml = Meteor.call('getLocalisedHtml', { html: html }, location);

                        // Add social sharing
                        if (post.type) {
                            console.log('No social share for pages');
                        } else {

                            var browser = Meteor.call('detectBrowser', headers);

                            if (browser == 'desktop') {
                                var socialShare = Meteor.call('renderSocialShare', {
                                    postUrl: websiteUrl + postUrl,
                                    post: post,
                                    userId: parameters.userId
                                });

                                postHtml = socialShare + postHtml;
                            }

                        }

                        // Add email box?
                        if (post.signupBox) {

                            if (post.signupBox != 'none') {
                                var boxHtml = Meteor.call('renderEmailBox', post, query);
                                postHtml += boxHtml;
                            }
                        }

                        // Add disqus?
                        if (Metas.findOne({ type: 'disqus', userId: parameters.userId })) {
                            if (Metas.findOne({ type: 'disqus', userId: parameters.userId }).value != "") {
                                parameters = {
                                    url: post.url,
                                    websiteUrl: websiteUrl
                                };
                                var commentHtml = Meteor.call('renderDisqus', parameters);
                                postHtml += commentHtml;
                            }
                        }

                    }

                }

                // Add exit intent?
                if (Metas.findOne({ type: 'exitStatus', userId: parameters.userId })) {

                    // Check value
                    var exitStatus = Metas.findOne({ type: 'exitStatus', userId: parameters.userId }).value;

                    if (exitStatus == 'on') {
                        var exitHtml = Meteor.call('renderExitModal', {
                            query: query
                        });
                        postHtml += exitHtml;
                    }

                }

                return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";

            }

        } else {

            // Render header & navbar
            headerHtml = Meteor.call('returnHeader', {});
            navbarHtml = Meteor.call('returnNavbar', parameters.userId);
            footerHtml = Meteor.call('returnFooter', parameters.userId);

            return headerHtml + "<body>" + navbarHtml + footerHtml + "</body>";
        }

    }

});
