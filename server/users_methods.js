var cheerio = Npm.require("cheerio");

Meteor.methods({

    getLocalisedHtml: function(post, location) {

        console.log(location);

        if (location == 'FR') {
            if (post.html['FR']) {
                console.log('Returning localised HTML');
                return post.html['FR'];
            } else {
                return post.html['US'];
            }
        }
        if (location == 'GB') {
            if (post.html['GB']) {
                console.log('Returning localised HTML');
                return post.html['GB'];
            } else {
                return post.html['US'];
            }
        }
        if (location == 'CA') {
            if (post.html['CA']) {
                console.log('Returning localised HTML');
                return post.html['CA'];
            } else {
                return post.html['US'];
            }
        } else {
            return post.html['US'];
        }

    },
    getUserLocation: function(httpHeaders) {

        if (httpHeaders['cf-ipcountry']) {
            console.log('Using CloudFlare location')
            var data = {};
            country_code = httpHeaders['cf-ipcountry'];
        } else {
            console.log('Using direct IP location')
            country_code = 'US';
        }

        return country_code;

    },
    localiseAmazonLink: function(url, countryCode) {

        // Check if it's an Amazon link
        if (url.indexOf("https://www.amazon.com/") != -1) {

            // Extract ASIN
            var asinStart = url.indexOf("/dp/");
            var asinEnd = url.indexOf("/ref=");

            var asin = url.substring(asinStart + 4, asinEnd);

            var result = Meteor.call('addAffiliateCode', asin, countryCode)

            return result;
        }
        // Check for a-fwd links
        else if (url.indexOf("http://a-fwd.com") != -1) {

            // Extract ASIN
            var asinStart = url.indexOf("asin-com=");
            var asinEnd = url.indexOf("&com=");

            var asin = url.substring(asinStart + 9, asinEnd);

            var result = Meteor.call('addAffiliateCode', asin, countryCode)

            return result;
        }
        else {
            return url;
        }
    },
    addAffiliateCode: function(asin, countryCode) {

        if (countryCode == 'US') {
            var result = 'https://www.amazon.com/dp/' + asin;
            if (Metas.findOne({ type: 'affiliateUS' })) {
                result += '?tag=' + Metas.findOne({ type: 'affiliateUS' }).value;
            }
        } else if (countryCode == 'FR') {
            var result = 'https://www.amazon.fr/dp/' + asin;
            if (Metas.findOne({ type: 'affiliateFR' })) {
                result += '?tag=' + Metas.findOne({ type: 'affiliateFR' }).value;
            }
        } else if (countryCode == 'CA') {
            var result = 'https://www.amazon.ca/dp/' + asin;
            if (Metas.findOne({ type: 'affiliateCA' })) {
                result += '?tag=' + Metas.findOne({ type: 'affiliateCA' }).value;
            }
        } else if (countryCode == 'GB') {
            var result = 'https://www.amazon.co.uk/dp/' + asin;
            if (Metas.findOne({ type: 'affiliateUK' })) {
                result += '?tag=' + Metas.findOne({ type: 'affiliateUK' }).value;
            }
        } else {
            var result = 'https://www.amazon.com/dp/' + asin;
            if (Metas.findOne({ type: 'affiliateUS' })) {
                result += '?tag=' + Metas.findOne({ type: 'affiliateUS' }).value;
            }
        }
        return result;

    },
    processHTMLAmazon: function(rawHtml) {

        // Output
        var output = {};

        // Country codes
        countryCodes = ['US', 'FR', 'CA', 'GB'];

        for (j = 0; j < countryCodes.length; j++) {

            // Load raw HTML
            $ = cheerio.load(rawHtml);

            // Process links
            $('a').each(function(i, elem) {
                var link = Meteor.call('localiseAmazonLink',
                    $(elem)[0].attribs.href, countryCodes[j]);
                $(elem)[0].attribs.href = link;
            });

            output[countryCodes[j]] = $.html();

        }

        console.log(output);

        return output;
    },
    setList: function(list) {

        // Update
        Integrations.update({ type: 'puremail' }, { $set: { list: list } });

    },

    getEmailLists: function() {

        // Get integration
        if (Integrations.findOne({ type: 'puremail' })) {

            var integration = Integrations.findOne({ type: 'puremail' });

            // Get lists
            var url = "https://" + integration.url + "/api/lists?key=" + integration.key;

            try {
                var answer = HTTP.get(url);
                return answer.data.lists;

            } catch (e) {
                return [];
            }

        } else {
            return [];
        }

    },
    getListSequences: function() {

        // Get integration
        if (Integrations.findOne({ type: 'puremail', list: { $exists: true } })) {

            // Get integration
            var integration = Integrations.findOne({ type: 'puremail' });

            // Get sequences
            var url = "https://" + integration.url + "/api/sequences?key=" + integration.key;
            url += '&list=' + integration.list;
            var answer = HTTP.get(url);
            return answer.data.sequences;

        } else {
            return [];
        }

    },
    createUsers: function() {

        // Create admin user
        var adminUser = {
            email: Meteor.settings.adminUser.email,
            password: Meteor.settings.adminUser.password,
            role: 'admin'
        }
        Meteor.call('createNewUser', adminUser);

        // Create editor user
        var editorUser = {
            email: Meteor.settings.editorUser.email,
            password: Meteor.settings.editorUser.password,
            role: 'editor'
        }
        Meteor.call('createNewUser', editorUser);

    },
    createNewUser: function(data) {

        // Check if exist
        if (Meteor.users.findOne({ "emails.0.address": data.email })) {

            console.log('User already created');
            var userId = Meteor.users.findOne({ "emails.0.address": data.email })._id;

        } else {

            console.log('Creating new user');

            // Create
            var userId = Accounts.createUser(data);

            // Change role
            Meteor.users.update(userId, { $set: { role: data.role } });
            console.log(Meteor.users.findOne(userId));

        }

    }

});
