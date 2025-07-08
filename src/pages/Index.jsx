import ImageGenerator from '@/components/ImageGenerator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Image Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your ideas into stunning images with AI technology
          </p>
        </div>
        <ImageGenerator />
      </div>
    </div>
  );
};

export default Index;