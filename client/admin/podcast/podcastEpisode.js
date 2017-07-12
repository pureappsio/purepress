Template.podcastEpisode.helpers({

    views: function() {
        return Stats.find({ userId: Meteor.user()._id, postId: this._id }).fetch().length;
    }

});
