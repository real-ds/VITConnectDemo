import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { Edit, Settings } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', userId!));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        }

        // Fetch user's posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('authorId', '==', userId)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePicture || 'https://via.placeholder.com/100'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.bio || 'No bio yet'}</p>
            </div>
          </div>
          {currentUser?.uid === userId && (
            <div className="flex space-x-2">
              <Link
                to="/edit-profile"
                className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Posts</h2>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={user}
                  community={{ name: 'Loading...' }} // You might want to fetch community details
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No posts yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;