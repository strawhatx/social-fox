interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface GiphyResponse {
  data: GiphyGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}

export async function searchGiphy(query: string, limit: number = 1): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  if (!apiKey) {
    console.warn('GIPHY_API_KEY not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g&lang=en`
    );

    if (!response.ok) {
      console.error('Giphy API error:', response.status, response.statusText);
      return [];
    }

    const data: GiphyResponse = await response.json();
    
    return data.data.map(gif => gif.images.fixed_height.url);
  } catch (error) {
    console.error('Error searching Giphy:', error);
    return [];
  }
}

export async function getTrendingGifs(limit: number = 1): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  if (!apiKey) {
    console.warn('GIPHY_API_KEY not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&rating=g`
    );

    if (!response.ok) {
      console.error('Giphy API error:', response.status, response.statusText);
      return [];
    }

    const data: GiphyResponse = await response.json();
    
    return data.data.map(gif => gif.images.fixed_height.url);
  } catch (error) {
    console.error('Error fetching trending GIFs:', error);
    return [];
  }
}

