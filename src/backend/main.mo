import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Structures
  type VideoStatus = {
    #processing;
    #ready;
    #failed;
  };

  public type UserProfile = {
    username : Text;
    displayName : Text;
    bio : Text;
    avatarBlobId : ?Text;
    bannerBlobId : ?Text;
    createdAt : Time.Time;
  };

  public type UserSearchResult = {
    userId : Principal;
    username : Text;
    displayName : Text;
    avatarBlobId : ?Text;
  };

  type Channel = {
    userId : Principal;
    name : Text;
    description : Text;
    avatarBlobId : ?Text;
    bannerBlobId : ?Text;
  };

  type Video = {
    id : Text;
    uploaderUserId : Principal;
    title : Text;
    description : Text;
    tags : [Text];
    category : Text;
    videoBlobId : Text;
    thumbnailBlobId : Text;
    duration : Nat;
    viewCount : Nat;
    likeCount : Nat;
    dislikeCount : Nat;
    commentCount : Nat;
    createdAt : Time.Time;
    status : VideoStatus;
  };

  type Comment = {
    id : Text;
    videoId : Text;
    authorUserId : Principal;
    text : Text;
    createdAt : Time.Time;
    likeCount : Nat;
  };

  public type Caption = {
    id : Text;
    videoId : Text;
    startTime : Float;
    endTime : Float;
    text : Text;
    language : Text;
  };

  public type NotificationRecord = {
    id : Text;
    notifType : Text;
    actorName : Text;
    message : Text;
    videoId : ?Text;
    createdAt : Time.Time;
    read : Bool;
  };

  public type Playlist = {
    id : Text;
    name : Text;
    ownerUserId : Principal;
    createdAt : Time.Time;
  };

  // Persistent storage
  let users = Map.empty<Principal, UserProfile>();
  let channels = Map.empty<Principal, Channel>();
  let videos = Map.empty<Text, Video>();
  let comments = Map.empty<Text, Comment>();
  let videoLikes = Map.empty<Text, Set.Set<Principal>>();
  let videoDislikes = Map.empty<Text, Set.Set<Principal>>();
  let subscriptions = Map.empty<Principal, Set.Set<Principal>>();
  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let captionsByVideoId = Map.empty<Text, List.List<Caption>>();
  let notificationsByUser = Map.empty<Principal, List.List<NotificationRecord>>();

  // Playlist storage
  let playlists = Map.empty<Text, Playlist>();
  let playlistVideoIds = Map.empty<Text, List.List<Text>>();
  let userPlaylistIds = Map.empty<Principal, List.List<Text>>();

  // Append notification; newest-first order is achieved by reversing on read
  func addNotificationForUser(userId : Principal, notif : NotificationRecord) {
    let existing = switch (notificationsByUser.get(userId)) {
      case (?list) { list };
      case (null) { List.empty<NotificationRecord>() };
    };
    existing.add(notif);
    notificationsByUser.add(userId, existing);
  };

  // PROFILE MANAGEMENT

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
    let channel : Channel = {
      userId = caller;
      name = profile.displayName;
      description = profile.bio;
      avatarBlobId = profile.avatarBlobId;
      bannerBlobId = profile.bannerBlobId;
    };
    channels.add(caller, channel);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  // USER SEARCH

  public query ({ caller }) func searchUsers(searchQuery : Text) : async [UserSearchResult] {
    let q = searchQuery.toLower();
    let results = List.empty<UserSearchResult>();
    for ((userId, profile) in users.entries()) {
      if (userId != caller and profile.username.toLower().contains(#text(q))) {
        results.add({
          username = profile.username;
          userId = userId;
          displayName = profile.displayName;
          avatarBlobId = profile.avatarBlobId;
        });
        if (results.size() >= 20) {
          return results.toArray();
        };
      };
    };
    results.toArray();
  };

  // VIDEO OPERATIONS

  public shared ({ caller }) func uploadVideo(
    title : Text,
    description : Text,
    tags : [Text],
    category : Text,
    videoBlobId : Text,
    thumbnailBlobId : Text,
    duration : Nat
  ) : async Text {
    let id = Time.now().toText();
    let newVideo : Video = {
      id;
      uploaderUserId = caller;
      title;
      description;
      tags;
      category;
      videoBlobId;
      thumbnailBlobId;
      duration;
      viewCount = 0;
      likeCount = 0;
      dislikeCount = 0;
      commentCount = 0;
      createdAt = Time.now();
      status = #processing;
    };
    videos.add(id, newVideo);

    let uploaderName = switch (users.get(caller)) {
      case (?profile) { profile.displayName };
      case (null) { "A channel you follow" };
    };

    for ((subscriberId, subSet) in subscriptions.entries()) {
      if (subSet.contains(caller) and subscriberId != caller) {
        let notif : NotificationRecord = {
          id = id # "-upload-" # subscriberId.toText();
          notifType = "new_upload";
          actorName = uploaderName;
          message = uploaderName # " uploaded: " # title;
          videoId = ?id;
          createdAt = Time.now();
          read = false;
        };
        addNotificationForUser(subscriberId, notif);
      };
    };

    id;
  };

  public shared ({ caller }) func updateVideo(
    id : Text,
    title : Text,
    description : Text,
    thumbnailBlobId : Text
  ) : async () {
    switch (videos.get(id)) {
      case (?video) {
        if (video.uploaderUserId != caller) {
          Runtime.trap("Unauthorized: Only the video owner can edit this video");
        };
        let updated = { video with title; description; thumbnailBlobId };
        videos.add(id, updated);
      };
      case (null) { Runtime.trap("Video not found") };
    };
  };

  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    switch (videos.get(videoId)) {
      case (?video) {
        if (video.uploaderUserId != caller) {
          Runtime.trap("Unauthorized: Only the video owner can delete this video");
        };
        // Remove from videos map
        videos.remove(videoId);
        // Remove from all playlists
        for ((playlistId, videoList) in playlistVideoIds.entries()) {
          let filtered = videoList.filter(func(id : Text) : Bool { id != videoId });
          playlistVideoIds.add(playlistId, filtered);
        };
      };
      case (null) { Runtime.trap("Video not found") };
    };
  };

  public shared ({ caller }) func updateVideoStatus(id : Text, status : VideoStatus) : async () {
    switch (videos.get(id)) {
      case (?video) {
        let updatedVideo = { video with status };
        videos.add(id, updatedVideo);
      };
      case (null) { Runtime.trap("Video not found") };
    };
  };

  public query ({ caller }) func getVideo(id : Text) : async ?Video {
    videos.get(id);
  };

  public query ({ caller }) func getAllVideos() : async [Video] {
    videos.values().toArray();
  };

  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    let likes = switch (videoLikes.get(videoId)) {
      case (null) {
        let set = Set.empty<Principal>();
        set.add(caller);
        set;
      };
      case (?existing) {
        if (existing.contains(caller)) {
          existing.remove(caller);
        } else {
          existing.add(caller);
        };
        existing;
      };
    };
    videoLikes.add(videoId, likes);
    switch (videos.get(videoId)) {
      case (?video) {
        let isLiking = likes.contains(caller);
        let likeCount = if (isLiking) {
          video.likeCount + 1
        } else {
          Nat.sub(video.likeCount, if (video.likeCount > 0) { 1 } else { 0 })
        };
        videos.add(videoId, { video with likeCount });
        if (isLiking and video.uploaderUserId != caller) {
          let likerName = switch (users.get(caller)) {
            case (?profile) { profile.displayName };
            case (null) { "Someone" };
          };
          let notif : NotificationRecord = {
            id = videoId # "-like-" # caller.toText();
            notifType = "like";
            actorName = likerName;
            message = likerName # " liked your video: " # video.title;
            videoId = ?videoId;
            createdAt = Time.now();
            read = false;
          };
          addNotificationForUser(video.uploaderUserId, notif);
        };
      };
      case (null) { Runtime.trap("Video not found") };
    };
  };

  public query ({ caller }) func getLikedVideos() : async [Video] {
    let likedVideos = List.empty<Video>();
    switch (videoLikes.get(caller.toText())) {
      case (?likes) {
        for (videoId in likes.values()) {
          switch (videos.get(videoId.toText())) {
            case (?video) { likedVideos.add(video) };
            case (null) {};
          };
        };
        likedVideos.toArray();
      };
      case (null) { [] };
    };
  };

  // COMMENT OPERATIONS

  public shared ({ caller }) func addComment(videoId : Text, text : Text) : async Text {
    let id = Time.now().toText();
    let newComment : Comment = {
      id;
      videoId;
      authorUserId = caller;
      text;
      createdAt = Time.now();
      likeCount = 0;
    };
    comments.add(id, newComment);
    switch (videos.get(videoId)) {
      case (?video) {
        if (video.uploaderUserId != caller) {
          let commenterName = switch (users.get(caller)) {
            case (?profile) { profile.displayName };
            case (null) { "Someone" };
          };
          let notifType = if (text.contains(#text("@"))) { "mention" } else { "comment" };
          let message = if (notifType == "mention") {
            commenterName # " mentioned you: \"" # text # "\""
          } else {
            commenterName # " commented on your video: \"" # text # "\""
          };
          let notif : NotificationRecord = {
            id = id # "-notif";
            notifType;
            actorName = commenterName;
            message;
            videoId = ?videoId;
            createdAt = Time.now();
            read = false;
          };
          addNotificationForUser(video.uploaderUserId, notif);
        };
      };
      case (null) {};
    };
    id;
  };

  public query ({ caller }) func getComments(videoId : Text) : async [Comment] {
    comments.values().toArray().filter(func(c) { c.videoId == videoId });
  };

  public shared ({ caller }) func likeComment(commentId : Text) : async () {
    switch (comments.get(commentId)) {
      case (?comment) {
        comments.add(commentId, { comment with likeCount = comment.likeCount + 1 });
      };
      case (null) { Runtime.trap("Comment not found") };
    };
  };

  // SUBSCRIPTION MANAGEMENT

  public shared ({ caller }) func subscribeToChannel(channelOwnerId : Principal) : async () {
    if (caller == channelOwnerId) { Runtime.trap("Cannot subscribe to yourself") };
    let currentSubs = switch (subscriptions.get(caller)) {
      case (null) {
        let set = Set.empty<Principal>();
        set.add(channelOwnerId);
        set;
      };
      case (?existing) {
        if (existing.contains(channelOwnerId)) { Runtime.trap("Already subscribed") };
        existing.add(channelOwnerId);
        existing;
      };
    };
    subscriptions.add(caller, currentSubs);
    let subscriberName = switch (users.get(caller)) {
      case (?profile) { profile.displayName };
      case (null) { "Someone" };
    };
    let notif : NotificationRecord = {
      id = Time.now().toText() # "-sub-" # caller.toText();
      notifType = "subscribe";
      actorName = subscriberName;
      message = subscriberName # " subscribed to your channel";
      videoId = null;
      createdAt = Time.now();
      read = false;
    };
    addNotificationForUser(channelOwnerId, notif);
  };

  public shared ({ caller }) func unsubscribeFromChannel(channelOwnerId : Principal) : async () {
    let currentSubs = switch (subscriptions.get(caller)) {
      case (null) { Runtime.trap("No subscriptions found") };
      case (?subs) {
        if (not subs.contains(channelOwnerId)) { Runtime.trap("Not subscribed to this channel") };
        subs.remove(channelOwnerId);
        subs;
      };
    };
    subscriptions.add(caller, currentSubs);
  };

  public query ({ caller }) func isSubscribedToChannel(channelOwnerId : Principal) : async Bool {
    switch (subscriptions.get(caller)) {
      case (null) { false };
      case (?subs) { subs.contains(channelOwnerId) };
    };
  };

  public query ({ caller }) func getChannel(userId : Principal) : async (Channel, Nat) {
    switch (channels.get(userId)) {
      case (?channel) {
        var subscriberCount = 0 : Nat;
        for (subs in subscriptions.values()) {
          if (subs.contains(userId)) { subscriberCount += 1 };
        };
        (channel, subscriberCount);
      };
      case (null) { Runtime.trap("Channel not found") };
    };
  };

  // CAPTION OPERATIONS

  public shared ({ caller }) func saveCaptions(videoId : Text, newCaptions : [Caption]) : async () {
    let captionList = List.fromArray<Caption>(newCaptions);
    captionsByVideoId.add(videoId, captionList);
  };

  public query ({ caller }) func getCaptions(videoId : Text) : async [Caption] {
    switch (captionsByVideoId.get(videoId)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func hasCaptions(videoId : Text) : async Bool {
    switch (captionsByVideoId.get(videoId)) {
      case (?list) { list.size() > 0 };
      case (null) { false };
    };
  };

  // NOTIFICATION OPERATIONS

  public query ({ caller }) func getMyNotifications() : async [NotificationRecord] {
    switch (notificationsByUser.get(caller)) {
      case (?list) {
        let arr = list.toArray();
        let result = List.empty<NotificationRecord>();
        var i = arr.size();
        while (i > 0) {
          i -= 1;
          result.add(arr[i]);
        };
        result.toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    switch (notificationsByUser.get(caller)) {
      case (?list) {
        var count = 0 : Nat;
        for (n in list.values()) {
          if (not n.read) { count += 1 };
        };
        count;
      };
      case (null) { 0 };
    };
  };

  public shared ({ caller }) func markNotificationRead(id : Text) : async () {
    switch (notificationsByUser.get(caller)) {
      case (?list) {
        let updated = list.map<NotificationRecord, NotificationRecord>(func(n : NotificationRecord) : NotificationRecord {
          if (n.id == id) { { n with read = true } } else { n }
        });
        notificationsByUser.add(caller, updated);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func markAllMyNotificationsRead() : async () {
    switch (notificationsByUser.get(caller)) {
      case (?list) {
        let updated = list.map<NotificationRecord, NotificationRecord>(func(n : NotificationRecord) : NotificationRecord {
          { n with read = true }
        });
        notificationsByUser.add(caller, updated);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func deleteMyNotification(id : Text) : async () {
    switch (notificationsByUser.get(caller)) {
      case (?list) {
        let filtered = list.filter(func(n : NotificationRecord) : Bool { n.id != id });
        notificationsByUser.add(caller, filtered);
      };
      case (null) {};
    };
  };

  // PLAYLIST OPERATIONS

  public shared ({ caller }) func createPlaylist(name : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let id = Time.now().toText() # "-" # caller.toText();
    let playlist : Playlist = {
      id;
      name;
      ownerUserId = caller;
      createdAt = Time.now();
    };
    playlists.add(id, playlist);
    let existing = switch (userPlaylistIds.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Text>() };
    };
    existing.add(id);
    userPlaylistIds.add(caller, existing);
    id;
  };

  public query ({ caller }) func getMyPlaylists() : async [Playlist] {
    switch (userPlaylistIds.get(caller)) {
      case (?ids) {
        let result = List.empty<Playlist>();
        for (id in ids.values()) {
          switch (playlists.get(id)) {
            case (?pl) { result.add(pl) };
            case (null) {};
          };
        };
        result.toArray();
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addVideoToPlaylist(playlistId : Text, videoId : Text) : async () {
    switch (playlists.get(playlistId)) {
      case (?pl) {
        if (pl.ownerUserId != caller) { Runtime.trap("Not your playlist") };
      };
      case (null) { Runtime.trap("Playlist not found") };
    };
    let existing = switch (playlistVideoIds.get(playlistId)) {
      case (?list) { list };
      case (null) { List.empty<Text>() };
    };
    // Avoid duplicates
    let alreadyIn = existing.toArray().any(func(id : Text) : Bool { id == videoId });
    if (not alreadyIn) {
      existing.add(videoId);
      playlistVideoIds.add(playlistId, existing);
    };
  };

  public shared ({ caller }) func removeVideoFromPlaylist(playlistId : Text, videoId : Text) : async () {
    switch (playlists.get(playlistId)) {
      case (?pl) {
        if (pl.ownerUserId != caller) { Runtime.trap("Not your playlist") };
      };
      case (null) { Runtime.trap("Playlist not found") };
    };
    switch (playlistVideoIds.get(playlistId)) {
      case (?list) {
        let filtered = list.filter(func(id : Text) : Bool { id != videoId });
        playlistVideoIds.add(playlistId, filtered);
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getPlaylistVideos(playlistId : Text) : async [Video] {
    switch (playlistVideoIds.get(playlistId)) {
      case (?ids) {
        let result = List.empty<Video>();
        for (id in ids.values()) {
          switch (videos.get(id)) {
            case (?v) { result.add(v) };
            case (null) {};
          };
        };
        result.toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getVideoPlaylistIds(videoId : Text) : async [Text] {
    switch (userPlaylistIds.get(caller)) {
      case (?ids) {
        let result = List.empty<Text>();
        for (plId in ids.values()) {
          switch (playlistVideoIds.get(plId)) {
            case (?vids) {
              if (vids.toArray().any(func(id : Text) : Bool { id == videoId })) {
                result.add(plId);
              };
            };
            case (null) {};
          };
        };
        result.toArray();
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func deletePlaylist(playlistId : Text) : async () {
    switch (playlists.get(playlistId)) {
      case (?pl) {
        if (pl.ownerUserId != caller) { Runtime.trap("Not your playlist") };
      };
      case (null) { Runtime.trap("Playlist not found") };
    };
    playlists.remove(playlistId);
    playlistVideoIds.remove(playlistId);
    switch (userPlaylistIds.get(caller)) {
      case (?ids) {
        let filtered = ids.filter(func(id : Text) : Bool { id != playlistId });
        userPlaylistIds.add(caller, filtered);
      };
      case (null) {};
    };
  };

  // SEARCH
  module VideoHelpers {
    public func compareByViews(a : Video, b : Video) : Order.Order {
      Nat.compare(b.viewCount, a.viewCount);
    };
  };

  public query ({ caller }) func searchVideos(searchTerm : Text) : async [Video] {
    let filtered = videos.values().toArray().filter(
      func(v) {
        v.title.toLower().contains(#text(searchTerm.toLower())) or v.tags.any(
          func(tag) { tag.toLower().contains(#text(searchTerm.toLower())) }
        );
      }
    );
    filtered.sort(VideoHelpers.compareByViews);
  };
};
