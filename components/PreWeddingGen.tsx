import React, { useState } from 'react';
// import { generatePreWeddingPhoto } from '../services/geminiService'; // Removed in favor of Firebase Function
import { fileToBase64, getMimeType } from '../utils/fileUtils';
import { addWatermark } from '../utils/imageUtils';
import { VIBES } from '../constants';
import { Camera, Heart, Sparkles, Plus, X, Loader2, Download, History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';



interface UploadedFile {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

const PreWeddingGen: React.FC = () => {
  const [couplePhotos, setCouplePhotos] = useState<UploadedFile[]>([]);
  const [dressPhoto, setDressPhoto] = useState<UploadedFile | null>(null);
  const [selectedVibeId, setSelectedVibeId] = useState<string>('');
  const [customDescription, setCustomDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleCoupleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Cast Array.from result to File[] to fix type inference errors
      const files = Array.from(e.target.files).slice(0, 3 - couplePhotos.length) as File[];
      const newPhotos: UploadedFile[] = [];
      
      for (const file of files) {
         const base64 = await fileToBase64(file);
         newPhotos.push({
           file,
           preview: URL.createObjectURL(file),
           base64,
           mimeType: getMimeType(file)
         });
      }
      setCouplePhotos([...couplePhotos, ...newPhotos]);
    }
  };

  const handleDressUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setDressPhoto({
        file,
        preview: URL.createObjectURL(file),
        base64,
        mimeType: getMimeType(file)
      });
    }
  };

  const removeCouplePhoto = (index: number) => {
    const newPhotos = [...couplePhotos];
    newPhotos.splice(index, 1);
    setCouplePhotos(newPhotos);
  };

  const handleGenerate = async () => {
  if (couplePhotos.length === 0) return;

  setIsGenerating(true);
  setGeneratedImage(null);

  try {
    // Collect references
    const references = couplePhotos.map(p => ({ base64: p.base64, mimeType: p.mimeType }));
    if (dressPhoto) {
      references.push({ base64: dressPhoto.base64, mimeType: dressPhoto.mimeType });
    }

    // Determine style
    const selectedVibe = VIBES.find(v => v.id === selectedVibeId);
    const styleDesc = selectedVibe 
      ? `${selectedVibe.title}. ${selectedVibe.description}` 
      : customDescription || "Professional cinematic pre-wedding portrait";

    const finalPrompt = customDescription 
      ? `${customDescription} (Vibe: ${selectedVibe?.title || 'Custom'})` 
      : styleDesc;

    const functionUrl = "https://generatepreweddingphoto-5ygtzea37q-uc.a.run.app";
    
    // Call Firebase Function directly (HTTP)
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referenceImages: references,
        styleDescription: finalPrompt,
        customPrompt: dressPhoto ? "Include the style of the uploaded dress." : undefined
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
    }
    const data = await response.json();
    console.log(data);
    const result = data.image;
    console.log(result);
    const watermarkedResult = await addWatermark(result, "MoonVeil Studio");

    setGeneratedImage(watermarkedResult);
    setHistory(prev => [watermarkedResult, ...prev]);
    toast.success("Photo generated successfully!");
    
  } catch (error) {
    console.error(error);
    toast.error("Failed to generate photo. Please try again.");
  } finally {
    setIsGenerating(false);
  }
};


  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-4xl font-serif text-slate-100">MoonVeil Studio</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">Upload your photos and let our AI transform them into cinematic masterpieces.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Couple Upload */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Couple Photos (Max 3)
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {couplePhotos.map((photo, index) => (
                <div key={index} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden group border border-slate-600">
                  <img src={photo.preview} className="w-full h-full object-cover" alt="couple" />
                  <button 
                    onClick={() => removeCouplePhoto(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {couplePhotos.length < 3 && (
                <label className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-slate-600 hover:border-rose-500 hover:bg-slate-700/50 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Plus className="w-6 h-6 text-slate-500" />
                  <span className="text-[10px] text-slate-400 mt-1">Add Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoupleUpload} />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Clear, front-facing photos work best.</p>
          </div>

          {/* Dress Upload (Optional) */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-slate-400" />
              Outfit Reference (Optional)
            </h3>
            {dressPhoto ? (
               <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600 group">
                 <img src={dressPhoto.preview} className="w-full h-full object-cover" alt="dress" />
                 <button 
                    onClick={() => setDressPhoto(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
               </div>
            ) : (
              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-rose-500 hover:bg-slate-700/50 transition-all">
                <span className="text-sm text-slate-400">Click to upload dress/suit photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleDressUpload} />
              </label>
            )}
          </div>

          {/* Vibe Selection */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-500" />
              Select Vibe
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {VIBES.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => setSelectedVibeId(vibe.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedVibeId === vibe.id
                      ? 'bg-rose-900/40 border-rose-500/50 text-rose-100'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium text-xs md:text-sm">{vibe.title}</div>
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Custom Details / Adjustments</label>
              <textarea 
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="E.g. 'Make it look like sunset', 'Add more flowers'..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-slate-600 transition-colors"
                rows={3}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={couplePhotos.length === 0 || isGenerating}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-gold-500" />
                Generate Photos
              </>
            )}
          </button>

        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7">
          <div className="h-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-2 md:p-6 flex flex-col min-h-[500px]">
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center overflow-hidden relative">
              {isGenerating ? (
                 <div className="text-center space-y-6 max-w-sm px-4">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                      <Heart className="absolute inset-0 m-auto w-8 h-8 text-rose-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-serif text-slate-200">Creating your masterpiece</h3>
                       <p className="text-slate-500 text-sm">Gemini is analyzing features, applying lighting, and rendering the scene...</p>
                    </div>
                 </div>
              ) : generatedImage ? (
                <div className="relative w-full h-full group">
                   <img src={generatedImage} alt="Generated Pre-wedding" className="w-full h-full object-contain" />
                   <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                      <a 
                        href={generatedImage} 
                        download="dream-wedding-photo.png"
                        className="bg-rose-600 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-rose-500 transition-colors shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        Download High Res
                      </a>
                   </div>
                </div>
              ) : (
                <div className="text-center space-y-4 px-6 opacity-40">
                   <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700">
                      <Camera className="w-10 h-10 text-slate-600" />
                   </div>
                   <p className="text-lg font-serif text-slate-500">Your generated photos will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Gallery Section */}
      {history.length > 0 && (
        <div className="mt-16 border-t border-slate-800 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <History className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-2xl font-serif text-slate-200">Session Gallery</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-xs border border-slate-700">{history.length}</span>
            </div>
            <button 
              onClick={() => {
                setHistory([]);
                setGeneratedImage(null);
              }}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800 group"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Clear Gallery
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((img, idx) => (
              <div 
                key={idx} 
                className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group border-2 transition-all duration-200 ${
                  generatedImage === img 
                    ? 'border-rose-500 ring-4 ring-rose-500/20 scale-[1.02] shadow-xl shadow-rose-900/20 z-10' 
                    : 'border-slate-800 hover:border-slate-600 hover:shadow-lg'
                }`}
                onClick={() => setGeneratedImage(img)}
              >
                <img src={img} alt={`Generated ${idx}`} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent transition-opacity ${generatedImage === img ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreWeddingGen;