import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Community as CommunityType, Post, User } from '../types';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import { useAuth } from '../contexts/AuthContext';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Community = () => {
  const { communityId } = useParams();
  const { currentUser } = useAuth();
  const [community, setCommunity] = useState<CommunityType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityAndPosts = async () => {
      try {
        // Fetch community data
        const communityDoc = await getDoc(doc(db, 'communities', communityId!));
        if (communityDoc.exists()) {
          setCommunity({ id: communityDoc.id, ...communityDoc.data() } as CommunityType);
        }

        // Fetch community posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('communityId', '==', communityId)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setPosts(postsData);

        // Fetch authors
        const authorIds = [...new Set(postsData.map(post => post.authorId))];
        const authorsData: Record<string, User> = {};
        await Promise.all(
          authorIds.map(async (authorId) => {
            const authorDoc = await getDoc(doc(db, 'users', authorId));
            if (authorDoc.exists()) {
              authorsData[authorId] = { id: authorId, ...authorDoc.data() } as User;
            }
          })
        );
        setAuthors(authorsData);
      } catch (error) {
        console.error('Error fetching community:', error);
        toast.error('Failed to load community');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityAndPosts();
  }, [communityId]);

  const handleJoinCommunity = async () => {
    if (!currentUser || !community) return;

    try {
      const communityRef = doc(db, 'communities', communityId!);
      const newMembers = community.members.includes(currentUser.uid)
        ? community.members.filter(id => id !== currentUser.uid)
        : [...community.members, currentUser.uid];

      await updateDoc(communityRef, {
        members: newMembers,
        updatedAt: new Date().toISOString()
      });

      setCommunity(prev => prev ? { ...prev, members: newMembers } : null);
      toast.success(
        community.members.includes(currentUser.uid)
          ? 'Left community'
          : 'Joined community'
      );
    } catch (error) {
      toast.error('Failed to update membership');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Community not found</p>
      </div>
    );
  }

  const isMember = currentUser && community.members.includes(currentUser.uid);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm mb-6">
        {community.coverImage && (
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
              <p className="text-gray-600">{community.description}</p>
            </div>
            {currentUser && (
              <button
                onClick={handleJoinCommunity}
                className={`flex items-center space-x-1 px-4 py-2 rounded-md ${
                  isMember
                    ? 'border border-gray-300 hover:bg-gray-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{isMember ? 'Leave' : 'Join'}</span>
              </button>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{community.members.length} members</span>
          </div>
        </div>
      </div>

      {currentUser && isMember && (
        <CreatePostForm
          communityId={communityId!}
          onSuccess={() => window.location.reload()}
        />
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            author={authors[post.authorId] || { name: 'Unknown', profilePicture: '' }}
            community={community}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet in this community</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;