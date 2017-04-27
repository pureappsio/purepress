Template.podcastEpisode.helpers({

    views: function() {
        return Stats.find({ postId: this._id }).fetch().length;
    }

});
