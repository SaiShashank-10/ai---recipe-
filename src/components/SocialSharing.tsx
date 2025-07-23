import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Instagram, Link, Mail, MessageCircle, Heart, Bookmark } from 'lucide-react';
import { Recipe } from '../types';
import toast from 'react-hot-toast';

interface SocialSharingProps {
  recipe: Recipe;
  onLike?: () => void;
  onBookmark?: () => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likeCount?: number;
}

export function SocialSharing({ 
  recipe, 
  onLike, 
  onBookmark, 
  isLiked = false, 
  isBookmarked = false,
  likeCount = 0 
}: SocialSharingProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const recipeUrl = `${window.location.origin}/recipe/${recipe.id}`;
  const shareText = `Check out this amazing recipe: ${recipe.title}`;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`,
      color: 'text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(recipeUrl)}`,
      color: 'text-blue-400'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${recipeUrl}`)}`,
      color: 'text-green-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`I found this great recipe and thought you might like it:\n\n${recipe.title}\n${recipe.description}\n\n${recipeUrl}`)}`,
      color: 'text-gray-600'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl);
      toast.success('Recipe link copied to clipboard!');
      setShowShareMenu(false);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Like Button */}
      <button
        onClick={onLike}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isLiked 
            ? 'bg-red-100 text-red-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>

      {/* Bookmark Button */}
      <button
        onClick={onBookmark}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isBookmarked 
            ? 'bg-yellow-100 text-yellow-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-500'
        }`}
      >
        <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">Save</span>
      </button>

      {/* Share Button */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm font-medium">Share</span>
        </button>

        {/* Share Menu */}
        {showShareMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="p-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleShare(option.url)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <option.icon className={`h-5 w-5 ${option.color}`} />
                  <span className="text-sm text-gray-700">{option.name}</span>
                </button>
              ))}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Link className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">Copy Link</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}