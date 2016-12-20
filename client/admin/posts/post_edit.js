Template.postEdit.onRendered(function() {

    // Init box signup
    if (this.data.signupBox) {
        var signupBox = this.data.signupBox;
    }

    Meteor.call('getBoxes', function(err, boxes) {

        // Empty
        $('#post-box').empty();

        // Add none option
        $('#post-box').append($('<option>', {
            value: 'none',
            text: 'No signup box'
        }));

        // Fill
        for (l = 0; l < boxes.length; l++) {
            $('#post-box').append($('<option>', {
                value: boxes[l]._id,
                text: boxes[l].title
            }));
        }

        // Select
        if (signupBox) {
            $('#post-box').val(signupBox);
        }

    });

    // Show podcast url
    if (this.data.category) {
        if (this.data.category == 'podcast') {
            $('.podcast-url-selector').show();
        } else {
            $('.podcast-url-selector').hide();
        }
    } else {
        $('.podcast-url-selector').hide();
    }

    // Show affiliate stuff
    if (this.data.category) {
        if (this.data.category == 'affiliate') {
            $('.main-content').hide();
            $('.affiliate-content').show();
        } else {
            $('.main-content').show();
            $('.affiliate-content').hide();
        }
    } else {
        $('.main-content').show();
        $('.affiliate-content').hide();
    }

    // Init editor
    $('#post-content').summernote({
        popover: {
            image: [
                ['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
                ['float', ['floatLeft', 'floatRight', 'floatNone']],
                ['custom', ['imageAttributes', 'imageShape']],
                ['remove', ['removeMedia']]
            ],
        },
        height: 400 // set editor height
    });

    // Init post content
    if (this.data.content) {
        $('#post-content').summernote('code', this.data.content);
    }

    // Init editor
    $('#post-excerpt').summernote({
        height: 50 // set editor height
    });

    // Init post content
    if (this.data.excerpt) {
        $('#post-excerpt').summernote('code', this.data.excerpt);
    }

    // Date time
    if (this.data.creationDate) {
        $('.datetimepicker').datetimepicker({
            defaultDate: this.data.creationDate
        });
    } else {
        $('.datetimepicker').datetimepicker({
            defaultDate: new Date()
        });
    }

    // Init category
    if (this.data.category) {
        $('#post-category').val(this.data.category);
    }

    // Init category
    if (this.data.postCategory) {
        $('#blog-post-category').val(this.data.postCategory);
    }

    // Init editor
    $('#post-introduction').summernote({
        height: 100 // set editor height
    });

    // Init post intro affiliate
    if (this.data.introduction) {
        $('#post-introduction').summernote('code', this.data.introduction);
    }

    // Init editor
    $('#post-conclusion').summernote({
        height: 100 // set editor height
    });

    // Init post intro affiliate
    if (this.data.conclusion) {
        $('#post-conclusion').summernote('code', this.data.conclusion);
    }

    // Init editor
    $('#post-middle').summernote({
        height: 100 // set editor height
    });

    // Init post intro affiliate
    if (this.data.middle) {
        $('#post-middle').summernote('code', this.data.middle);
    }

    // Init editor
    $('#affiliate-short').summernote({
        height: 50 // set editor height
    });

    // Init editor
    $('#affiliate-description').summernote({
        height: 150 // set editor height
    });

});

Template.postEdit.events({

    'click #post-publish': function() {

        // Set to published
        Meteor.call('setPostStatus', this._id, 'published');

    },
    'click #post-draft': function() {

        // Set to published
        Meteor.call('setPostStatus', this._id, 'draft');

    },
    'click #create-category': function() {

        var category = {
            name: $('#new-category').val()
        }

        Meteor.call('createCategory', category);

    },
    'click #affiliate-add': function() {

        // Create element
        var element = {
            rank: $('#affiliate-rank').val(),
            rating: $('#affiliate-rating').val(),
            title: $('#affiliate-title').val(),
            link: $('#affiliate-link').val(),
            shortDescription: $('#affiliate-short').summernote('code'),
            description: $('#affiliate-description').summernote('code'),
            postId: this._id
        }

        // Get picture
        if (Session.get('affiliatePicture')) {
            element.picture = Session.get('affiliatePicture');
        }

        // Add element
        Meteor.call('createPostElement', element);

    },
    'click #get-data': function() {

        Meteor.call('getMP3Data', $('#podcast-url').val(), function(err, data) {

            $('#podcast-size').val(data.size);
            $('#podcast-duration').val(data.duration);

        });

    },
    'click #post-category, change #post-category': function() {

        if ($('#post-category :selected').val() == 'podcast') {
            $('.podcast-url-selector').show();
        } else {
            $('.podcast-url-selector').hide();
        }

        if ($('#post-category :selected').val() == 'affiliate') {
            $('.main-content').hide();
            $('.affiliate-content').show();
        } else {
            $('.main-content').show();
            $('.affiliate-content').hide();
        }

    },
    'click #edit-post': function() {

        var post = {
            title: $('#post-title').val(),
            url: $('#post-url').val(),
            cached: false,
            excerpt: $('#post-excerpt').summernote('code'),
            userId: Meteor.user()._id,
            _id: this._id,
            category: $('#post-category :selected').val(),
            signupBox: $('#post-box :selected').val(),
            postCategory: $('#blog-post-category :selected').val(),
            status: this.status
        }

        if ($('#post-category :selected').val() == 'general') {
            post.content = $('#post-content').summernote('code');
        }

        if ($('#post-category :selected').val() == 'podcast') {
            post.podcastUrl = $('#podcast-url').val();
            post.podcastDuration = $('#podcast-duration').val();
            post.podcastSize = $('#podcast-size').val();
            post.content = $('#post-content').summernote('code');
        }

        if ($('#post-category :selected').val() == 'affiliate') {
            post.introduction = $('#post-introduction').summernote('code');
            post.conclusion = $('#post-conclusion').summernote('code');
            post.middle = $('#post-middle').summernote('code');
        }

        if (this.featuredPicture) {
            post.featuredPicture = this.featuredPicture;
        }

        // Get creation date
        post.creationDate = new Date($('#creation-date').val());

        // Get picture
        if (Session.get('featuredPicture')) {
            post.featuredPicture = Session.get('featuredPicture');
        }

        Meteor.call('editPost', post, function(err, data) {
            delete Session.keys['featuredPicture'];
        });

    }

});

Template.postEdit.helpers({

    imgLink: function() {
        return Session.get('imgLink');
    },
    affiliateListings: function() {
        return Elements.find({postId: this._id});
    },
    categories: function() {
        return Categories.find({});
    },
    statusLabel: function() {
    if (this.status) {
        if (this.status == 'draft') {
            return 'warning';
        }
        if (this.status == 'published') {
            return 'primary';
        }
    }

  }

});