"use client";

import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Input } from '../ui/input';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Search, Film } from 'lucide-react';

// Initialize Giphy API - you'll need to add your API key to environment variables
const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');

type GiphyPickerProps = {
  onSelect: (gifUrl: string) => void;
};

export default function GiphyPicker({ onSelect }: GiphyPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKey, setSearchKey] = useState(0); // Force re-render of Grid component

  const fetchGifs = useCallback((offset: number) => {
    if (searchTerm.trim()) {
      return gf.search(searchTerm, { offset, limit: 12 });
    }
    return gf.trending({ offset, limit: 12 });
  }, [searchTerm]);

  const handleSearch = () => {
    setSearchKey(prev => prev + 1); // Force Grid to re-fetch with new search term
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleGifClick = (gif: any, e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    const gifUrl = gif.images.fixed_height.url;
    onSelect(gifUrl);
    setOpen(false);
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-7 w-7 p-0">
          <Film className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-[400px] bg-gradient-to-br from-blue-50 to-orange-50 border-orange-200" sideOffset={15} alignOffset={100} align="end">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search GIFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-9"
            />

            <Button
              onClick={handleSearch}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[220px] overflow-y-auto giphy-picker-container">
            <Grid
              key={searchKey}
              width={360}
              columns={3}
              gutter={6}
              fetchGifs={fetchGifs}
              onGifClick={handleGifClick}
              hideAttribution={true}
              noLink={true}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
