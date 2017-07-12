import Images from '../imports/api/files';

Meteor.methods({

    deleteRecording: function(recordingId) {
        Recordings.remove(recordingId);
    },
    saveRecording: function(data) {

        // console.log(data);

        // Decode
        var buf = new Buffer(data.recording, 'base64');

        // Save
        var fileRef = Images.write(buf, {
            fileName: 'recording.webm',
            type: 'audio/webm'
        }, function(error, fileRef) {
            if (error) {
                throw error;
            } else {

                // Recording
                var recording = {
                    fileId: fileRef._id,
                    date: new Date(),
                    email: data.email,
                    name: data.name,
                    rawData: buf
                }

                // Get URL
                var url = Images.findOne(fileRef._id).link();
                recording.recordingUrl = url;

                console.log(recording);

                Recordings.insert(recording);

            }
        });

    },
    hasElement: function(pageId, elementType) {

        // Get all elements with type
        if (Elements.findOne({ pageId: pageId, type: elementType })) {
            return true;
        } else {
            return false;
        }

    },
    getElement: function(pageId, elementType) {

        // Get all elements with type
        if (Elements.findOne({ pageId: pageId, type: elementType })) {
            return Elements.findOne({ pageId: pageId, type: elementType });
        } else {
            return false;
        }

    },
    changeOrderPage: function(elementId, change) {

        // Get elements
        var pageElement = Elements.findOne(elementId);
        var elements = Elements.find({ pageId: pageElement.pageId, order: { $exists: true } }, { sort: { order: -1 } }).fetch();
        console.log('Elements: ' + elements.length);

        if ((change == -1 && pageElement.order != 1) || (change == 1 && pageElement.order != elements.length)) {

            console.log('Changing order of page element');

            // Update element
            Elements.update(elementId, { $inc: { order: change } });

            // Update other element
            Elements.update({ pageId: pageElement.pageId, order: pageElement.order + change }, { $inc: { order: -1 * change } });

            // Flush cache
            Meteor.call('flushCache');

        } else {

            console.log('Doing nothing');

        }

    },
    changeOrderPricing: function(elementId, change) {

        // Get elements
        var pageElement = Pricing.findOne(elementId);
        var elements = Pricing.find({ type: pageElement.type, order: { $exists: true } }, { sort: { order: -1 } }).fetch();
        console.log('Pricing lements: ' + elements.length);

        if ((change == -1 && pageElement.order != 1) || (change == 1 && pageElement.order != elements.length)) {

            console.log('Changing order of page element');

            // Update element
            Pricing.update(elementId, { $inc: { order: change } });

            // Update other element
            Pricing.update({ type: pageElement.type, order: pageElement.order + change }, { $inc: { order: -1 * change } });

            // Flush cache
            Meteor.call('flushCache');

        } else {

            console.log('Doing nothing');

        }

    },
    createPricing: function(pricing) {

        // Add order
        var elements = Pricing.find({ type: pricing.type }).fetch();
        var order = elements.length + 1;
        pricing.order = order;

        console.log(pricing);
        Pricing.insert(pricing);

        // Flush cache
        Meteor.call('flushCache');

    },
    updatePricing: function(pricing) {

        console.log(pricing);

        Pricing.update(pricing._id, { $set: pricing });

    },
    deletePricing: function(pricing) {

        Pricing.remove(pricing);

        // Flush cache
        Meteor.call('flushCache');

    },
    copyPage: function(data) {

        // Get page
        var page = Pages.findOne(data.originPageId);

        // Get all elements linked to page
        var elements = Elements.find({ pageId: page._id }).fetch();

        // Create new page
        page.url = data.targetUrl;
        page.title = data.targetTitle;
        delete page._id;

        // Insert
        var pageId = Pages.insert(page);

        // Create copy of elements
        for (i in elements) {

            var element = elements[i];
            element.pageId = pageId;
            delete element._id;

            Elements.insert(element)
        }

    },
    getAllProducts: function() {

        // Get integration
        if (Integrations.findOne({ type: 'purecart' })) {

            var integration = Integrations.findOne({ type: 'purecart' });

            // Get lists
            var url = "https://" + integration.url + "/api/products?key=" + integration.key;

            try {
                var answer = HTTP.get(url);
                return answer.data.products;
            } catch (error) {
                return [];
            }


        } else {
            return [];
        }

    },

    getProductData: function(productId) {

        // Get integration
        if (Integrations.findOne({ type: 'purecart' })) {

            var integration = Integrations.findOne({ type: 'purecart' });

            // Get lists
            var url = "https://" + integration.url + "/api/products/" + productId + "?key=" + integration.key;
            var answer = HTTP.get(url);

            // console.log(answer.data.product);
            return answer.data.product;

        } else {
            return [];
        }

    },

    getPurePages: function() {

        // Get integration
        if (Integrations.findOne({ type: 'purepages' })) {

            var integration = Integrations.findOne({ type: 'purepages' });

            // Get lists
            var url = "https://" + integration.url + "/api/pages?key=" + integration.key;

            // Brand connected?
            if (integration.brand) {
                url += '&brand=' + integration.brand;
            }

            var answer = HTTP.get(url);
            return answer.data.pages;

        } else {
            return [];
        }

    },
    getPurePagesBrands: function() {

        // Get integration
        if (Integrations.findOne({ type: 'purepages' })) {

            var integration = Integrations.findOne({ type: 'purepages' });

            // Get lists
            var url = "https://" + integration.url + "/api/brands?key=" + integration.key;
            var answer = HTTP.get(url);
            return answer.data.brands;

        } else {
            return [];
        }

    },
    getPurePage: function(pageId, query) {

        // Get integration
        if (Integrations.findOne({ type: 'purepages' })) {

            var integration = Integrations.findOne({ type: 'purepages' });

            // Get lists
            var url = "https://" + integration.url + "/api/pages/" + pageId + "?key=" + integration.key;
            if (query.ref) {
                url += '&ref=' + query.ref;
            }
            if (query.origin) {
                url += '&origin=' + query.origin;
            }
            if (query.medium) {
                url += '&medium=' + query.medium;
            }
            if (query.subscriber) {
                url += '&subscriber=' + query.subscriber;
            }
            if (query.location) {
                url += '&location=' + query.location;
            }
            if (query.discount) {
                url += '&discount=' + query.discount;
            }
            console.log(url);
            var answer = HTTP.get(url);
            return answer.data.page;

        } else {
            return [];
        }

    },

    getPurePageHeader: function(pageId) {

        // Get integration
        if (Integrations.findOne({ type: 'purepages' })) {

            var integration = Integrations.findOne({ type: 'purepages' });

            // Get lists
            var url = "https://" + integration.url + "/api/header?key=" + integration.key;
            url += '&page=' + pageId;
            console.log(url);
            var answer = HTTP.get(url);
            return answer.data.header;

        } else {
            return [];
        }

    },
    assignBox: function(boxId, posts) {

        for (i in posts) {

            // Update
            Posts.update(posts[i], { $set: { signupBox: boxId, cached: false } });

            // Render
            Meteor.call('localisePost', posts[i]);

        }

    },
    createBox: function(box) {
        console.log(box);
        Boxes.insert(box);
    },

    editBox: function(box) {
        console.log(box);
        Boxes.update(box._id, box);
    },
    deleteBox: function(boxId) {

        Boxes.remove(boxId);

    },
    getBoxes: function() {
        return Boxes.find({}).fetch();
    },
    getPageDetails: function(pageId) {

        return Pages.findOne(pageId);

    },
    getAllPages: function() {

        return Pages.find({}).fetch();

    },
    editPage: function(page) {

        Pages.update(page._id, page);

    },
    createPage: function(page) {

        console.log(page);

        // Make sure URL is not taken
        if (Pages.findOne({ url: page.url })) {

            // Update
            Pages.update({ url: page.url }, page);

            // Return id
            return Pages.findOne({ url: page.url })._id;

        } else {

            // Insert
            var pageId = Pages.insert(page);

            // Return id
            return pageId;
        }


    },
    removePage: function(pageId) {

        Pages.remove(pageId);

    },
    removeElement: function(elementId) {

        // Find element
        element = Elements.findOne(elementId);

        // Remove
        Elements.remove(elementId);

        // Set page as not cached anymore
        Pages.update(element.pageId, { $set: { cached: false } });

    },
    editPageElement: function(element) {

        // Remove
        console.log(element);
        Elements.update(element._id, { $set: element });

        // Set page as not cached anymore
        Pages.update(element.pageId, { $set: { cached: false } });

    },
    createElement: function(element) {

        console.log(element);

        // Find all existing elements for page
        var elements = Elements.find({ pageId: element.pageId }, { sort: { order: -1 } }).fetch();

        // Set order on page
        if (elements.length > 0) {
            element.order = elements[0].order + 1;
        } else {
            element.order = 1;
        }

        // Insert
        Elements.insert(element);

        // Set page as not cached anymore
        Pages.update(element.pageId, { $set: { cached: false } });

    }
});
