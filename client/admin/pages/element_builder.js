Template.elementBuilder.onRendered(function() {

    // Init editor
    $('#element-content').summernote({
        height: 100 // set editor height
    });

});

Template.elementBuilder.helpers({

    imageNeeded: function() {

        if (Session.get('imageNeeded') == true) {
            return true;
        }

    },
    imageLink: function() {
        return Session.get('imgLink');
    }

});

Template.elementBuilder.events({

    'change #element-type, click #element-type': function() {

        // Get type
        var elementType = $('#element-type :selected').val();

        // Clean container
        $('#builder-container').empty();

        // Fill depending on choice
        if (elementType == 'text') {

            // No image
            Session.set('imageNeeded', false);

            // Add elements
            $('#builder-container').append("<div class='row'><div class='col-md-12'><input type='text' id='element-content' class='summernote' /></div></div>")

            // Init editor
            $('#element-content').summernote({
                height: 100 // set editor height
            });

        }

        // Title
        if (elementType == 'title') {

            // No image
            Session.set('imageNeeded', false);

            // Add elements
            $('#builder-container').append("<div class='row'><div class='col-md-12'><input class='form-control' type='text' id='element-title'/></div></div>")

        }


        // Image
        if (elementType == 'image' || elementType == 'imagehalf') {

            // No image
            Session.set('imageNeeded', true);

        }

        // Image
        if (elementType == 'pricing') {

            // No image
            Session.set('imageNeeded', false);

        }

        // Button
        if (elementType == 'button') {

            // No image
            Session.set('imageNeeded', false);

            // Build fields
            var fields = "<div class='row'>";
            fields += "<div class='col-md-6'><input class='form-control' type='text' id='element-button' placeholder='Button message ...' /></div>";
            fields += "<div class='col-md-6'><input class='form-control' type='text' id='element-link' placeholder='Button link ...' /></div>";
            fields += "</div>";

            // Add fields
            $('#builder-container').append(fields);

        }

        // Fill depending on choice
        if (elementType == 'resource') {

            // Image
            Session.set('imageNeeded', true);

            // Add title field
            $('#builder-container').append("<div class='row'><div class='col-md-6'><input class='form-control' type='text' id='element-title' placeholder='Title ...'/></div><div class='col-md-6'><input class='form-control' type='text' id='element-link' placeholder='Link ...' /></div></div>")

            // Add text field
            $('#builder-container').append("<div class='row'><div class='col-md-12'><input type='text' id='element-content' class='summernote' /></div></div>");

            // Init editor
            $('#element-content').summernote({
                height: 100 // set editor height
            });

        }

        // Fill depending on choice
        if (elementType == 'featurebox' || elementType == 'featureboxbutton') {

            // Image
            Session.set('imageNeeded', false);

            // Build fields
            var fields = "<div class='row'><div class='col-md-6'><input class='form-control' type='text' id='element-title' placeholder='Title ...'/></div>";
            fields += "<div class='col-md-6'><select class='form-control' id='feature-icon'>";
            fields += '<option value="address-book">Address Book</option>';
            fields += '<option value="paper-plane">Paper Plane</option>';
            fields += '<option value="bolt">Bolt</option>';
            fields += '<option value="wifi">WiFi</option>';
            fields += '<option value="link">Link</option>';
            fields += '<option value="exchange">Exchange</option>';
            fields += '<option value="bar-chart">Bar Chart</option>';
            fields += '<option value="id-badge">Id Badge</option>';
            fields += '<option value="vcard">Vcard</option>';
            fields += '<option value="cloud">Cloud</option>';
            fields += '<option value="random">Random</option>';
            fields += '<option value="refresh">Refresh</option>';
            fields += '</select></div></div>';

            // Add title field
            $('#builder-container').append(fields);

            // Add text field
            $('#builder-container').append("<div class='row'><div class='col-md-12'><input type='text' id='element-content' class='summernote' /></div></div>");

            // Init editor
            $('#element-content').summernote({
                height: 100 // set editor height
            });

        }

        // Fill depending on choice
        if (elementType == 'featureboxbutton') {

            // Add button field
            var fields = "<div class='row'>";
            fields += "<div class='col-md-6'><input class='form-control' type='text' id='element-button'/></div>";
            fields += "<div class='col-md-6'><input class='form-control' type='text' id='element-link'/></div>";
            fields += "</div>";
            $('#builder-container').append(fields);

        }

        // Fill depending on choice
        if (elementType == 'rowstart' || elementType == 'rowend') {

            // Image
            Session.set('imageNeeded', false);

        }

        // Fill depending on choice
        if (elementType == 'fullpicture') {

            // Image
            Session.set('imageNeeded', true);

            // Build fields
            var fields = "<div class='row'>";
            fields += "<div class='col-md-4'><input class='form-control' type='text' id='element-title' placeholder='Message ...' /></div>";
            fields += "<div class='col-md-4'><input class='form-control' type='text' id='element-button' placeholder='Button message ...' /></div>";
            fields += "<div class='col-md-4'><input class='form-control' type='text' id='element-link' placeholder='Button link ...' /></div>";
            fields += "</div>";

            // Add fields
            $('#builder-container').append(fields);

        }

        // Fill depending on choice
        if (elementType == 'fullwidthpicture') {

            // Image
            Session.set('imageNeeded', true);

            // Add fields
            $('#builder-container').append(fields);

        }

        // Fill depending on choice
        if (elementType == 'twopictures') {

            // Image
            Session.set('imageNeeded', true);

            // Build fields
            var fields = "<div class='row'>";
            fields += "<div class='col-md-3'><input class='form-control' type='text' id='element-picture-one' placeholder='Picture one ...' /></div>";
            fields += "<div class='col-md-3'><input class='form-control' type='text' id='element-link-one' placeholder='Link one ...' /></div>";
            fields += "<div class='col-md-3'><input class='form-control' type='text' id='element-picture-two' placeholder='Picture two ...' /></div>";
            fields += "<div class='col-md-3'><input class='form-control' type='text' id='element-link-two' placeholder='Link two ...' /></div>";
            fields += "</div>";

            // Add fields
            $('#builder-container').append(fields);

        }

        if (elementType == 'emailsignup') {

            // Image
            Session.set('imageNeeded', false);

            // Build fields
            var fields = "<div class='row'>";
            fields += "<div class='col-md-6'><select class='form-control' id='box-id'></select></div>";
            fields += "</div>";

            // Add fields
            $('#builder-container').append(fields);

            // Fill
            Meteor.call('getBoxes', function(err, boxes) {

                $('#box-id').empty();

                for (l = 0; l < boxes.length; l++) {
                    $('#box-id').append($('<option>', {
                        value: boxes[l]._id,
                        text: boxes[l].title
                    }));
                }

            });

        }
        if (elementType == 'portfolio') {

            // Image
            Session.set('imageNeeded', false);

        }

        if (elementType == 'portfoliodetail') {

            // Image
            Session.set('imageNeeded', false);

            // Build fields
            var fields = "<div class='row'>";
            fields += "<div class='col-md-3'>";
            fields += "<select class='form-control' id='portfolio-type'>";
            fields += "<option value='p2p'>Peer-to-Peer Lending</option>";
            fields += "<option value='realestate'>Real Estate</option>";
            fields += "<option value='stock'>Dividend Paying Stocks</option>";
            fields += "</select>";
            fields += "</div>";
            fields += "</div>";

            // Add fields
            $('#builder-container').append(fields);

        }

        if (elementType == 'store') {

            // Image
            Session.set('imageNeeded', false);

        }

    },

    'click #add-element': function() {

        // Get type
        var elementType = $('#element-type :selected').val();

        // Element
        var element = {
            pageId: this._id,
            userId: Meteor.user()._id,
            type: this.type
        }

        if (elementType == 'text') {
            element.content = $('#element-content').summernote('code');
        }

        if (elementType == 'title') {
            element.title = $('#element-title').val();
        }

        if (elementType == 'resource') {
            element.title = $('#element-title').val();
            element.link = $('#element-link').val();
            element.content = $('#element-content').summernote('code');
        }

        if (elementType == 'featurebox' || elementType == 'featureboxbutton') {
            element.title = $('#element-title').val();
            element.content = $('#element-content').summernote('code');
            element.icon = $('#feature-icon :selected').val();
        }

        if (elementType == 'featurebox' || elementType == 'featureboxbutton') {
            element.link = $('#element-link').val();
            element.button = $('#element-button').val();
        }

        if (elementType == 'fullpicture') {
            element.title = $('#element-title').val();
            element.link = $('#element-link').val();
            element.button = $('#element-button').val();
        }

        if (elementType == 'button') {
            element.link = $('#element-link').val();
            element.button = $('#element-button').val();
        }

        if (elementType == 'portfoliodetail') {
            element.portfolioType = $('#portfolio-type :selected').val();
        }

        if (elementType == 'twopictures') {
            element.pictureOne = $('#element-picture-one').val();
            element.pictureTwo = $('#element-picture-two').val();

            element.linkOne = $('#element-link-one').val();
            element.linkTwo = $('#element-link-two').val();
        }

        if (elementType == 'emailsignup') {
            element.boxId = $('#box-id').val();
        }

        // Get picture
        if (Session.get('elementPicture')) {
            element.image = Session.get('elementPicture');
        }

        // Type
        element.type = elementType;

        Meteor.call('createElement', element);

    }

});;
