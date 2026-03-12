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

  // Caption type for AI-generated and uploaded captions
  public type Caption = {
    id : Text;
    videoId : Text;
    startTime : Float;
    endTime : Float;
    text : Text;
    language : Text;
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
    id;
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
        // Fix: use Nat.sub to avoid trapping on underflow
        let likeCount = if (likes.contains(caller)) {
          video.likeCount + 1
        } else {
          Nat.sub(video.likeCount, if (video.likeCount > 0) { 1 } else { 0 })
        };
        videos.add(videoId, { video with likeCount });
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
    // Fix: add explicit type parameter <Caption> to List.fromArray
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
