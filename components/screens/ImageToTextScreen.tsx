import React, { useState, useRef } from 'react';
import { generateAIResponseFromText } from '../../services/imageToTextService';
import { extractTextFromImage } from '../../services/geminiImageService';

interface ImageToTextScreenProps {
  onBack?: () => void;
}

const ImageToTextScreen: React.FC<ImageToTextScreenProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [generatedResponse, setGeneratedResponse] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      setError(null);
      setExtractedText('');
      setGeneratedResponse('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractTextFromImageHandler = async () => {
    if (!selectedImage) return;

    setError(null);
    
    try {
      const text = await extractTextFromImage(selectedImage);
      setExtractedText(text);
      
      if (!text.trim()) {
        setError('No text could be extracted from this image. Please try a clearer image.');
      }
    } catch (err) {
      console.error('Text Extraction Error:', err);
      setError('Failed to extract text from image. Please try again.');
    }
  };

  const generateAIResponse = async () => {
    if (!extractedText.trim()) {
      setError('Please extract text from an image first');
      return;
    }

    setError(null);

    try {
      const response = await generateAIResponseFromText(extractedText);
      setGeneratedResponse(response);
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('Failed to generate AI response. Please try again.');
    }
  };



  const clearAll = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText('');
    setGeneratedResponse('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-brand-bg border-b-4 border-brand-text p-4 mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack} 
                className="px-3 py-2 text-sm font-bold bg-white text-brand-text border-2 border-brand-text shadow-hard hover:bg-brand-accent"
              >
                Back
              </button>
            )}
                         <h1 className="text-2xl font-bold text-brand-text">📸 Image Analysis</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Image Upload & Processing */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
              <h2 className="text-lg font-bold text-brand-text mb-4">📷 Upload Image</h2>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-brand-text rounded-lg hover:bg-brand-bg transition-colors"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-brand-text font-bold">Click to select image</p>
                    <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF (max 10MB)</p>
                  </div>
                </button>

                {imagePreview && (
                  <div className="mt-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full h-auto rounded-lg border-2 border-brand-text"
                    />
                  </div>
                )}

                                 {selectedImage && (
                   <div className="space-y-2">
                     <button
                       onClick={extractTextFromImageHandler}
                       className="w-full bg-brand-accent hover:bg-amber-500 text-brand-text font-bold py-3 px-4 border-2 border-brand-text shadow-hard transition-all"
                     >
                       🔍 Extract Text
                     </button>
                   </div>
                 )}
              </div>
            </div>

            {/* Extracted Text */}
            {extractedText && (
              <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
                <h2 className="text-lg font-bold text-brand-text mb-4">📝 Extracted Text</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{extractedText}</p>
                </div>
                                 <button
                   onClick={generateAIResponse}
                   className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 border-2 border-green-800 shadow-hard transition-all"
                 >
                   🤖 Generate AI Analysis
                 </button>
              </div>
            )}
          </div>

          {/* Right Column - AI Response */}
          <div className="space-y-6">
            {/* AI Response */}
            {generatedResponse && (
              <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
                <h2 className="text-lg font-bold text-brand-text mb-4">🤖 AI Financial Analysis</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{generatedResponse}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white p-6 border-2 border-brand-text shadow-hard">
              <h2 className="text-lg font-bold text-brand-text mb-4">💡 How to Use</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-brand-accent font-bold">1.</span>
                  <p>Upload a clear image containing text (receipts, documents, screenshots)</p>
                </div>
                                 <div className="flex items-start gap-2">
                   <span className="text-brand-accent font-bold">2.</span>
                   <p>Click "Extract Text" to extract text from the image</p>
                 </div>
                <div className="flex items-start gap-2">
                  <span className="text-brand-accent font-bold">3.</span>
                  <p>If you extracted text, click "Generate AI Analysis" for additional insights</p>
                </div>
              </div>
            </div>

            {/* Clear Button */}
            {(selectedImage || extractedText || generatedResponse) && (
              <button
                onClick={clearAll}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 border-2 border-red-800 shadow-hard transition-all"
              >
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-100 border-2 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToTextScreen;
