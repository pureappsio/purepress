Meteor.methods({

    getAllMenus: function() {

        return Menus.find({}).fetch();

    },
    changeOrderMenu: function(menuId, change) {

        // Get elements
        var menuElement = Menus.findOne(menuId);
        var elements = Menus.find({ userId: menuElement.userId, order: { $exists: true } }, { sort: { order: -1 } }).fetch();
        console.log('Elements: ' + elements.length);

        if ((change == -1 && menuElement.order != 1) || (change == 1 && menuElement.order != elements.length)) {

            console.log('Changing order of menu element');

            // Update element
            Menus.update(menuId, { $inc: { order: change } });

            // Update other element
            Menus.update({ userId: menuElement.userId, order: menuElement.order + change }, { $inc: { order: -1 * change } });

            // Flush cache
            Meteor.call('flushCache');

        } else {

            console.log('Doing nothing');

        }

    },
    createMenuElement: function(element) {

        if (element.parent) {

            // Insert
            Menus.insert(element);

            // Flush cache
            Meteor.call('flushCache');

        } else {

            // Get order
            var elements = Menus.find({ userId: element.userId, order: { $exists: true } }, { sort: { order: -1 } }).fetch();

            if (elements.length == 0) {
                element.order = 1;
            } else {
                element.order = elements[0].order + 1;
            }

            // Insert
            Menus.insert(element);

            // Flush cache
            Meteor.call('flushCache');

        }
    },
    removeMenuElement: function(elementId) {

        // Remove
        Menus.remove(elementId);

        // Flush cache
        Meteor.call('flushCache');
    }

});
