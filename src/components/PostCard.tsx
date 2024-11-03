import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Bookmark } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  author: { name: string; profilePicture: string };
  community: { name: string };
}

const PostCard: React.FC<PostCardProps> = ({ post, author, community }) => {
  const { currentUser } = useAuth();
  const isLiked = currentUser && post.likes.includes(currentUser.uid);
  const isSaved = currentUser && post.savedBy.includes(currentUser.uid);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please sign in to like posts');
      return;
    }

    const postRef = doc(db, 'posts', post.id);
    try {
      await updateDoc(postRef, {
        likes: isLiked 
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid)
      });
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Please sign in to save posts');
      return;
    }

    const postRef = doc(db, 'posts', post.id);
    try {
      await updateDoc(postRef, {
        savedBy: isSaved
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid)
      });
    } catch (error) {
      toast.error('Failed to save post');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center mb-4">
        <img
          src={author.profilePicture || 'https://via.placeholder.com/40'}
          alt={author.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <Link to={`/profile/${post.authorId}`} className="font-medium text-gray-900 hover:underline">
            {author.name}
          </Link>
          <div className="flex items-center text-sm text-gray-500">
            <Link to={`/community/${post.communityId}`} className="hover:underline">
              {community.name}
            </Link>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-4">{post.content}</p>

      {post.media && post.media.length > 0 && (
        <div className="mb-4">
          <img
            src={post.media[0]}
            alt="Post content"
            className="rounded-lg max-h-96 w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center space-x-4 text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
        >
          <Heart className="h-5 w-5" />
          <span>{post.likes.length}</span>
        </button>
        <Link to={`/post/${post.id}`} className="flex items-center space-x-1">
          <MessageSquare className="h-5 w-5" />
          <span>Comment</span>
        </Link>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-1 ${isSaved ? 'text-blue-500' : ''}`}
        >
          <Bookmark className="h-5 w-5" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;