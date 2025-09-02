import React, { useState } from "react";

// Dummy data types
interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  comments: number;
  retweets?: number;
  createdAt: string;
  niche: string;
  highlight?: string;
}

const dummyPosts: Post[] = [
  {
    id: "1",
    author: { name: "Jane Doe", avatar: "/fox-logo.png" },
    content: "Just shipped a new feature! #buildinpublic",
    likes: 120,
    comments: 15,
    retweets: 10,
    createdAt: "2025-09-01T08:00:00Z",
    niche: "buildinpublic",
    highlight: "Trending in #buildinpublic"
  },
  {
    id: "2",
    author: { name: "John Smith", avatar: "/fox-logo.png" },
    content: "How do you manage async workflows in JS?",
    likes: 90,
    comments: 22,
    retweets: 5,
    createdAt: "2025-08-31T10:00:00Z",
    niche: "javascript",
    highlight: "Popular in #javascript"
  },
  {
    id: "3",
    author: { name: "Alice Lee", avatar: "/fox-logo.png" },
    content: "Open source is the future! #opensource",
    likes: 75,
    comments: 10,
    retweets: 8,
    createdAt: "2025-08-30T12:00:00Z",
    niche: "opensource",
    highlight: "Active in #opensource"
  }
];

const niches = ["buildinpublic", "javascript", "opensource"];

export default function Community() {
  const [selectedNiche, setSelectedNiche] = useState<string>("");

  // Filter posts by selected niche and recency (last 3 days)
  const now = new Date();
  const filteredPosts = dummyPosts.filter(post => {
    const postDate = new Date(post.createdAt);
    const daysAgo = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
    return (!selectedNiche || post.niche === selectedNiche) && daysAgo <= 3;
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Community Highlights</h2>
      <div className="mb-6 flex gap-2">
        <span className="font-medium">Filter by niche:</span>
        {niches.map(niche => (
          <button
            key={niche}
            className={`px-3 py-1 rounded-full border ${selectedNiche === niche ? "bg-blue-100 border-blue-400" : "bg-white border-gray-300"}`}
            onClick={() => setSelectedNiche(niche)}
          >
            #{niche}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded-full border bg-white border-gray-300"
          onClick={() => setSelectedNiche("")}
        >
          All
        </button>
      </div>
      <div className="space-y-6">
        {filteredPosts.length === 0 && (
          <div className="text-gray-500">No trending posts in this niche for the last few days.</div>
        )}
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" />
              <span className="font-semibold">{post.author.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-base text-gray-800">{post.content}</div>
            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              <span>👍 {post.likes}</span>
              <span>💬 {post.comments}</span>
              {typeof post.retweets !== "undefined" && <span>🔁 {post.retweets}</span>}
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600">Like</button>
              <button className="px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-600">Reply</button>
              <button className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-600">Share</button>
            </div>
            {post.highlight && (
              <div className="text-xs text-blue-500 mt-2">{post.highlight}</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
        <strong>Why is this post here?</strong> Trending posts are selected based on engagement and freshness in your chosen niche. Join the discussion to grow your reach!
      </div>
    </div>
  );
}
