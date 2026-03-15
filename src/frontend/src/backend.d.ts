import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: string;
    dislikeCount: bigint;
    status: VideoStatus;
    title: string;
    duration: bigint;
    likeCount: bigint;
    videoBlobId: string;
    thumbnailBlobId: string;
    createdAt: Time;
    tags: Array<string>;
    description: string;
    viewCount: bigint;
    commentCount: bigint;
    category: string;
    uploaderUserId: Principal;
}
export type Time = bigint;
export interface Comment {
    id: string;
    likeCount: bigint;
    createdAt: Time;
    text: string;
    authorUserId: Principal;
    videoId: string;
}
export interface Channel {
    bannerBlobId?: string;
    userId: Principal;
    name: string;
    description: string;
    avatarBlobId?: string;
}
export interface UserProfile {
    bio: string;
    username: string;
    displayName: string;
    bannerBlobId?: string;
    createdAt: Time;
    avatarBlobId?: string;
}
export interface UserSearchResult {
    username: string;
    displayName: string;
    avatarBlobId?: string;
}
export interface NotificationRecord {
    id: string;
    notifType: string;
    actorName: string;
    message: string;
    videoId?: string;
    createdAt: Time;
    read: boolean;
}
export interface Playlist {
    id: string;
    name: string;
    ownerUserId: Principal;
    createdAt: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VideoStatus {
    processing = "processing",
    ready = "ready",
    failed = "failed"
}
export interface backendInterface {
    addComment(videoId: string, text: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMyNotification(id: string): Promise<void>;
    getAllVideos(): Promise<Array<Video>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannel(userId: Principal): Promise<[Channel, bigint]>;
    getComments(videoId: string): Promise<Array<Comment>>;
    getLikedVideos(): Promise<Array<Video>>;
    getMyNotifications(): Promise<Array<NotificationRecord>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: string): Promise<Video | null>;
    isCallerAdmin(): Promise<boolean>;
    isSubscribedToChannel(channelOwnerId: Principal): Promise<boolean>;
    likeComment(commentId: string): Promise<void>;
    likeVideo(videoId: string): Promise<void>;
    markAllMyNotificationsRead(): Promise<void>;
    markNotificationRead(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(query: string): Promise<Array<UserSearchResult>>;
    searchVideos(searchTerm: string): Promise<Array<Video>>;
    subscribeToChannel(channelOwnerId: Principal): Promise<void>;
    unsubscribeFromChannel(channelOwnerId: Principal): Promise<void>;
    updateVideo(id: string, title: string, description: string, thumbnailBlobId: string): Promise<void>;
    updateVideoStatus(id: string, status: VideoStatus): Promise<void>;
    uploadVideo(title: string, description: string, tags: Array<string>, category: string, videoBlobId: string, thumbnailBlobId: string, duration: bigint): Promise<string>;
    // Playlist operations
    createPlaylist(name: string): Promise<string>;
    getMyPlaylists(): Promise<Array<Playlist>>;
    addVideoToPlaylist(playlistId: string, videoId: string): Promise<void>;
    removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void>;
    getPlaylistVideos(playlistId: string): Promise<Array<Video>>;
    getVideoPlaylistIds(videoId: string): Promise<Array<string>>;
    deletePlaylist(playlistId: string): Promise<void>;
    // Video deletion
    deleteVideo(videoId: string): Promise<void>;
}
