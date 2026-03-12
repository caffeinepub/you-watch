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
    getAllVideos(): Promise<Array<Video>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannel(userId: Principal): Promise<[Channel, bigint]>;
    getComments(videoId: string): Promise<Array<Comment>>;
    getLikedVideos(): Promise<Array<Video>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(id: string): Promise<Video | null>;
    isCallerAdmin(): Promise<boolean>;
    isSubscribedToChannel(channelOwnerId: Principal): Promise<boolean>;
    likeComment(commentId: string): Promise<void>;
    likeVideo(videoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchVideos(searchTerm: string): Promise<Array<Video>>;
    subscribeToChannel(channelOwnerId: Principal): Promise<void>;
    unsubscribeFromChannel(channelOwnerId: Principal): Promise<void>;
    updateVideoStatus(id: string, status: VideoStatus): Promise<void>;
    uploadVideo(title: string, description: string, tags: Array<string>, category: string, videoBlobId: string, thumbnailBlobId: string, duration: bigint): Promise<string>;
}
