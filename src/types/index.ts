export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  coverImage: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  media: string[];
  likes: string[];
  savedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
}