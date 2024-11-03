import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Image } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePostFormProps {
  communityId: string;
  onSuccess?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ communityId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const mediaUrls = await Promise.all(
        media.map(async (file) => {
          const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        })
      );

      await addDoc(collection(db, 'posts'), {
        title,
        content,
        authorId: currentUser.uid,
        communityId,
        media: mediaUrls,
        likes: [],
        savedBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setTitle('');
      setContent('');
      setMedia([]);
      toast.success('Post created successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMedia(files);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        required
      />
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        rows={4}
        required
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
          <Image className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">Add media</span>
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </div>
      {media.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {media.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="h-20 w-20 object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default CreatePostForm;