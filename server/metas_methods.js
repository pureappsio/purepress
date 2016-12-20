Meteor.methods({

    saveSocial: function(social) {

        // Insert
        Networks.insert(social);

    },
    removeNetwork: function(socialId) {

        // Remove
        Networks.remove(socialId);
        
    },
    // saveLogo: function(websiteLogo) {
    //
    //   // Get brand
    //   var brand = Brands.find({}).fetch()[0];
    //
    //   // Update
    //   Brands.update(brand._id, {$set: {logo: websiteLogo}});
    //   console.log(Brands.find({}).fetch()[0]);
    //
    // },
    // saveLogo: function(websiteLogo) {
    //
    //   // Get brand
    //   var brand = Brands.find({}).fetch()[0];
    //
    //   // Update
    //   Brands.update(brand._id, {$set: {logo: websiteLogo}});
    //   console.log(Brands.find({}).fetch()[0]);
    //
    // },
    // saveFavicon: function(websiteFavicon) {
    //
    //   // Get brand
    //   var brand = Brands.find({}).fetch()[0];
    //
    //   // Update
    //   Brands.update(brand._id, {$set: {favicon: websiteFavicon}});
    //
    // },
    // createBrand: function(brand) {
    //
    //     // Insert
    //     Metas.insert({name: brand});
    //
    // },
    insertMeta: function(meta) {

        console.log(meta);

        // Check if exist
        if (Metas.findOne({ type: meta.type })) {

            // Update
            console.log('Updating meta');
            Metas.update({ type: meta.type }, { $set: { value: meta.value } });

        } else {

            // Insert
            console.log('Creating new meta');
            Metas.insert(meta);

        }

        // Flush
        Meteor.call('flushCache');

    }

});
