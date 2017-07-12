Meteor.methods({

    saveSocial: function(social) {

        // Insert
        Networks.insert(social);

    },
    removeNetwork: function(socialId) {

        // Remove
        Networks.remove(socialId);
        
    },
  
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
