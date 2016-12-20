Meteor.methods({

    flushCache: function() {

        // Flush
        console.log('Flushing cache');
        Caches.update({}, { $set: { cached: false } }, { multi: true });
        Pages.update({}, { $set: { cached: false } }, { multi: true });
        Posts.update({}, { $set: { cached: false } }, { multi: true });


    },
    returnFooter: function() {

        if (Meteor.settings.useCache == true) {

            if (Caches.findOne({ element: 'footer' })) {

                // Check status of cache
                var cache = Caches.findOne({ element: 'footer' });

                if (cache.cached == true) {

                    console.log('Returning cached footer');
                    return cache.html;
                } else {

                    // Render
                    console.log('Updating footer cache');
                    html = Meteor.call('renderFooter');

                    // Update cache
                    Caches.update({ element: 'footer' }, { $set: { html: html, cached: true } });

                    return html;

                }

            } else {

                // Render
                console.log('Creating footer cache');
                html = Meteor.call('renderFooter');

                // Create cache
                Caches.insert({ element: 'footer', html: html, cached: true });

                return html;

            }

        } else {
            console.log('Rendering footer without caching');
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

        if (Meteor.settings.useCache == true) {

            if (Caches.findOne({ element: 'header' })) {

                // Check status of cache
                var headerCache = Caches.findOne({ element: 'header' });

                if (headerCache.cached == true) {

                    console.log('Returning cached header');
                    return headerCache.html;

                } else {

                    // Render
                    console.log('Updating header cache');
                    html = Meteor.call('renderHeader');

                    // Update cache
                    Caches.update({ element: 'header' }, { $set: { html: html, cached: true } });

                    return html;

                }

            } else {

                // Render
                console.log('Creating header cache');
                html = Meteor.call('renderHeader');

                // Create cache
                Caches.insert({ element: 'header', html: html, cached: true });

                return html;

            }

        } else {
            console.log('Rendering header without caching');
            return Meteor.call('renderHeader');
        }

    },
    renderHeader: function(parameters) {

        // Compile header
        SSR.compileTemplate('header', Assets.getText('header/header_template.html'));

        // Load css
        var css = Assets.getText('main.css');
        var style = Assets.getText('style.css');

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

            useChat: function() {

                if (parameters) {
                    if (parameters.useChat) {
                        if (parameters.useChat == true) {
                            return true;
                        }
                    }
                }

            },
            brandName: function() {

                return Metas.findOne({ type: "brandName" }).value;

            },
            favicon: function() {
                var faviconId = Metas.findOne({ type: "favicon" }).value;
                var image = Images.findOne(faviconId);
                return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
            },
            isBlackTheme: function() {

                // Load theme
                if (Metas.findOne({ type: 'theme' })) {
                    theme = Metas.findOne({ type: 'theme' }).value;
                    if (theme == 'black') {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }

            }
        });

        var headerHtml = SSR.render('header', {
            css: css,
            style: style,
            trackingCode: trackingCode,
            pixelId: pixelId
        });

        return headerHtml;

    },
    returnNavbar: function() {

        if (Meteor.settings.useCache == true) {

            if (Caches.findOne({ element: 'navbar' })) {

                // Check status of cache
                var navCache = Caches.findOne({ element: 'navbar' });

                if (navCache.cached == true) {

                    console.log('Returning cached navbar');
                    return navCache.html;
                } else {

                    // Render
                    console.log('Updating navbar cache');
                    html = Meteor.call('renderNavbar');

                    // Update cache
                    Caches.update({ element: 'navbar' }, { $set: { html: html, cached: true } });

                    return html;

                }

            } else {

                // Render
                console.log('Creating navbar cache');
                html = Meteor.call('renderNavbar');

                // Create cache
                Caches.insert({ element: 'navbar', html: html, cached: true });

                return html;

            }

        } else {
            console.log('Rendering navbar without caching');
            return Meteor.call('renderNavbar');
        }

    },
    renderNavbar: function() {

        // Compile navbar
        SSR.compileTemplate('navbar', Assets.getText('header/navbar_template.html'));

        // Helpers
        Template.navbar.helpers({
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
            }
        });

        // Render
        var navbarHtml = SSR.render('navbar');

        return navbarHtml;

    },
    renderAllPosts: function(pageNumber, categoryId, url) {

        // Render header & navbar
        headerHtml = Meteor.call('returnHeader');
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

        var posts = Posts.find({ status: 'published' }, { sort: { creationDate: -1 }, skip: (pageNumber - 1) * nbPosts, limit: nbPosts }).fetch();
        for (i in posts) {
            console.log(posts[i].title);
            console.log(posts[i].creationDate);
        }

        // Helpers
        Template.allPosts.helpers({
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
            isActive: function(page) {
                if (page.number == pageNumber) {
                    return true;
                }
            },
            posts: function() {
                if (categoryId !== undefined) {
                    return Posts.find({ postCategory: categoryId, status: 'published' }, { sort: { creationDate: -1 }, skip: (pageNumber - 1) * 3, limit: 3 });
                } else {
                    return Posts.find({ status: 'published' }, { sort: { creationDate: -1 }, skip: (pageNumber - 1) * nbPosts, limit: nbPosts });
                }
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
                return moment(date).format('MMMM Do YYYY');
            },
            userName: function() {
                return Metas.findOne({ type: 'userName' }).value;
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

            // Query
            if (Posts.findOne({ url: postUrl, status: 'published' })) {
                var post = Posts.findOne({ url: postUrl });
            }
            if (Pages.findOne({ url: postUrl })) {
                var post = Pages.findOne({ url: postUrl });
            }

            // Calling another page?
            if (post.type == 'purepages') {

                // Grab page
                console.log('Returning external page');

                // Get page
                var page = Meteor.call('getPurePage', post.purePageId, query);

                // Get header
                var header = Meteor.call('getPurePageHeader', post.purePageId);

                // Return
                return header.html + "<body><div class='container-fluid main-container'>" + page.html + "</div></body>";

            } else if (post.type == 'category') {

                if (query.page) {
                    return Meteor.call('renderAllPosts', query.page, post.categoryId, post.url);
                } else {
                    return Meteor.call('renderAllPosts', 1, post.categoryId, post.url);
                }

            } else {

                // Render header & navbar
                if (Meteor.settings.useChat == true) {
                    if (post.type) {
                        headerHtml = Meteor.call('renderHeader', { useChat: true });
                    } else {
                        headerHtml = Meteor.call('renderHeader');
                    }
                } else {
                    headerHtml = Meteor.call('returnHeader');
                }

                navbarHtml = Meteor.call('returnNavbar');
                footerHtml = Meteor.call('returnFooter');

                // Check if cached
                if (post.cached == true) {

                    // Get render
                    if (post.type) {
                        console.log('Page cached, returning cached version');

                        // Return cached HTML
                        var postHtml = post.html;

                    } else {

                        console.log('Post cached, returning cached version');

                        // Return cached HTML
                        var postHtml = Meteor.call('getLocalisedHtml', post, location);

                    }

                    return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";

                } else {

                    // Compile
                    if (post.type) {

                        console.log('Page not cached, rendering');

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

                                // Get sales page
                                var salesPageUrl = Pages.findOne(allProducts[i].pageId).url;
                                storeProduct.salesPageUrl = salesPageUrl;

                                // Add
                                products.push(storeProduct);

                            }

                        }

                        // Build portfolio
                        if (Integrations.findOne({ type: 'pureportfolio' })) {

                            // Get integration
                            console.log('Grabing portfolio');
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

                        } else {
                            portfolio = {};
                            total = {}
                        }

                        // Build pricing elements for pricing page
                        var pricingElements = [];
                        if (Pricing.find({}).fetch().length > 0) {

                            pricingElements = Pricing.find({}).fetch();

                        }

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
                                if (element.type == 'emailsignup') {
                                    return Boxes.findOne(element.boxId).boxContent;
                                }
                            },
                            signupPopupContent: function(element) {
                                if (element.type == 'emailsignup') {
                                    return Boxes.findOne(element.boxId).popupContent;
                                }
                            },
                            tags: function(tags) {
                                return Boxes.findOne(element.boxId).tags;
                            },
                            listId: function(element) {
                                if (element.type == 'emailsignup') {
                                    return Integrations.findOne({ type: 'puremail' }).list;
                                }
                            },
                            sequenceId: function(element) {
                                if (element.type == 'emailsignup') {
                                    return Boxes.findOne(element.boxId).sequence;
                                }
                            },
                            products: function() {
                                return products;
                            },
                            pricingElements: function() {
                                return pricingElements;
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
                            total: function() {
                                return total;
                            }

                        });


                    } else {

                        console.log('Post not cached, rendering');

                        // Get Meteor URL
                        var websiteUrl = Meteor.absoluteUrl();

                        if (post.category == 'affiliate') {

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
                                    return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
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
                                signupBoxContent: function() {
                                    return Boxes.findOne(this.signupBox).boxContent;
                                },
                                signupPopupContent: function() {
                                    return Boxes.findOne(this.signupBox).popupContent;
                                },
                                tags: function() {
                                    return Boxes.findOne(this.signupBox).tags;
                                },
                                listId: function() {
                                    return Integrations.findOne({ type: 'puremail' }).list;
                                },
                                sequenceId: function(element) {
                                    return Boxes.findOne(this.signupBox).sequence;
                                },
                                elements: function() {
                                    return Elements.find({ postId: this._id });
                                },
                                elementImage: function(element) {
                                    var image = Images.findOne(element.picture);
                                    return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
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
                                tags: function() {
                                    return Boxes.findOne(this.signupBox).tags;
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
                                },
                                disqusId: function() {
                                    return Metas.findOne({ type: 'disqus' }).value;
                                }
                            });

                        } else {

                            // Compile
                            SSR.compileTemplate('postTemplate', Assets.getText('posts/post_template.html'));

                            // Helpers
                            Template.postTemplate.helpers({
                                postImage: function(featuredPicture) {
                                    var image = Images.findOne(featuredPicture);
                                    return '/cdn/storage/Images/' + image._id + '/original/' + image._id + '.' + image.ext;
                                },
                                isPodcast: function() {
                                    if (this.podcastUrl) {
                                        return true;
                                    } else {
                                        return false;
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
                                    return moment(date).format('MMMM Do YYYY');
                                },
                                userName: function() {
                                    return Metas.findOne({ type: 'userName' }).value;
                                },
                                tags: function() {
                                    return Boxes.findOne(this.signupBox).tags;
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
                                signupBoxContent: function() {
                                    return Boxes.findOne(this.signupBox).boxContent;
                                },
                                signupPopupContent: function() {
                                    return Boxes.findOne(this.signupBox).popupContent;
                                },
                                listId: function() {
                                    return Integrations.findOne({ type: 'puremail' }).list;
                                },
                                sequenceId: function(element) {
                                    return Boxes.findOne(this.signupBox).sequence;
                                },
                                siteUrl: function() {
                                    return websiteUrl;
                                },
                                disqusId: function() {
                                    return Metas.findOne({ type: 'disqus' }).value;
                                }
                            });

                        }
                    }

                    // Render
                    var rawHtml = SSR.render('postTemplate', post);

                    // Save
                    if (post.type) {
                        Pages.update({ url: postUrl }, { $set: { cached: true, html: rawHtml } })
                        postHtml = rawHtml;

                    } else {

                        // Process for affiliate links
                        var html = Meteor.call('processHTMLAmazon', rawHtml);
                        Posts.update({ url: postUrl }, { $set: { cached: true, html: html } })

                        // Get localised HTML
                        var postHtml = Meteor.call('getLocalisedHtml', { html: html }, location);

                    }

                    return headerHtml + "<body>" + navbarHtml + "<div class='container-fluid main-container'>" + postHtml + "</div>" + footerHtml + "</body>";

                }

            }

        } else {

            // Render header & navbar
            headerHtml = Meteor.call('returnHeader');
            navbarHtml = Meteor.call('returnNavbar');
            footerHtml = Meteor.call('returnFooter');

            return headerHtml + "<body>" + navbarHtml + footerHtml + "</body>";
        }

    }

});