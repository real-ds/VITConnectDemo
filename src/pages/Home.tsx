import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post, User, Community } from '../types';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [communities, setCommunities] = useState<Record<string, Community>>({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch posts
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setPosts(postsData);

        // Fetch authors and communities
        const authorIds = [...new Set(postsData.map(post => post.authorId))];
        const communityIds = [...new Set(postsData.map(post => post.communityId))];

        const authorsData: Record<string, User> = {};
        const communitiesData: Record<string, Community> = {};

        // Fetch authors
        await Promise.all(
          authorIds.map(async (authorId) => {
            const authorDoc = await getDocs(doc(db, 'users', authorId));
            if (authorDoc.exists()) {
              authorsData[authorId] = { id: authorId, ...authorDoc.data() } as User;
            }
          })
        );

        // Fetch communities
        await Promise.all(
          communityIds.map(async (communityId) => {
            const communityDoc = await getDocs(doc(db, 'communities', communityId));
            if (communityDoc.exists()) {
              communitiesData[communityId] = { id: communityId, ...communityDoc.data() } as Community;
            }
          })
        );

        setAuthors(authorsData);
        setCommunities(communitiesData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {currentUser && (
        <CreatePostForm
          communityId="general" // You might want to handle this differently
          onSuccess={() => {
            // Refresh posts
            window.location.reload();
          }}
        />
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            author={authors[post.authorId] || { name: 'Unknown', profilePicture: '' }}
            community={communities[post.communityId] || { name: 'General' }}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;