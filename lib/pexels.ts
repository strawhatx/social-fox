interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page: string;
}

export async function searchPexels(query: string, limit: number = 1): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('PEXELS_API_KEY not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape&size=large`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status, response.statusText);
      return [];
    }

    const data: PexelsResponse = await response.json();
    
    return data.photos.map(photo => photo.src.large);
  } catch (error) {
    console.error('Error searching Pexels:', error);
    return [];
  }
}

export async function getCuratedPexels(limit: number = 1): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('PEXELS_API_KEY not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/curated?per_page=${limit}&orientation=landscape&size=large`,
      {
        headers: {
          'Authorization': apiKey
        }
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status, response.statusText);
      return [];
    }

    const data: PexelsResponse = await response.json();
    
    return data.photos.map(photo => photo.src.large);
  } catch (error) {
    console.error('Error fetching curated Pexels images:', error);
    return [];
  }
}

