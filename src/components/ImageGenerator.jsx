import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageCount, setImageCount] = useState(0);
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');

  // API configuration with three keys
  const API_CONFIGS = [
    {
      key: '359df03b12msh7db3fabbc8e8adfp14eef9jsn6273b5b4d5dc',
      name: 'Primary API'
    },
    {
      key: 'bb766ffd43msha36bd23379e5acfp1b50edjsn1b4cc57ec962',
      name: 'Secondary API'
    },
    {
      key: 'f1cfc6624amshc1f7a8bfd6d6077p1623c3jsn944853391dde',
      name: 'Third API'
    }
  ];

  const getCurrentApiConfig = () => {
    if (imageCount < 10) return API_CONFIGS[0];
    if (imageCount < 20) return API_CONFIGS[1];
    return API_CONFIGS[2];
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (imageCount >= 30) {
      toast.error('You have reached the maximum limit of 30 images');
      return;
    }

    setIsGenerating(true);
    
    try {
      const currentApi = getCurrentApiConfig();
      console.log(`Using ${currentApi.name} for generation ${imageCount + 1}`);

      const response = await fetch('https://dall-e-34.p.rapidapi.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': currentApi.key,
          'x-rapidapi-host': 'dall-e-34.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          model: 'dall-e-3',
          size: size,
          quality: quality
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        setGeneratedImage(data.data[0].url);
        setImageCount(prev => prev + 1);
        toast.success(`Image generated successfully! (${imageCount + 1}/30)`);
        
        // Show API switch notifications
        if (imageCount + 1 === 10) {
          toast.info('Switching to secondary API for remaining generations');
        } else if (imageCount + 1 === 20) {
          toast.info('Switching to third API for remaining generations');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const resetGenerator = () => {
    setImageCount(0);
    setGeneratedImage(null);
    setPrompt('');
    toast.success('Generator reset successfully!');
  };

  const getRemainingGenerations = () => {
    return 30 - imageCount;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            AI Text-to-Image Generator
          </CardTitle>
          <div className="flex justify-end text-sm text-gray-600">
            <span>Remaining: {getRemainingGenerations()}/30</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Image Prompt
            </label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Size</label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">1024x1024 (Square)</SelectItem>
                  <SelectItem value="1792x1024">1792x1024 (Landscape)</SelectItem>
                  <SelectItem value="1024x1792">1024x1792 (Portrait)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateImage} 
              disabled={isGenerating || imageCount >= 30}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
            
            {imageCount > 0 && (
              <Button variant="outline" onClick={resetGenerator}>
                Reset Counter
              </Button>
            )}
          </div>

          {generatedImage && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full rounded-lg shadow-lg"
                  />
                  <Button 
                    onClick={downloadImage}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {imageCount >= 30 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                You have reached the maximum limit of 30 image generations. 
                Reset the counter to continue with a new session.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGenerator;