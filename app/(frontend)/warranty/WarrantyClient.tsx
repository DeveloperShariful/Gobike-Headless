// app/warranty/WarrantyClient.tsx

'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client'; 
import Breadcrumbs from '@/components/Breadcrumbs';
import { submitWarrantyClaim } from '@/app/actions/frontend/warranty-action'; // Ensure correct path

// NEW: Media Type Definition
type UploadedMedia = {
  url: string;
  pathname: string;
  filename: string;
  mimeType: string;
  size: number;
};

export default function WarrantyClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  
  // NEW: Store full media objects instead of just string URLs
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]); 
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    orderNumber: '',
    shopPurchased: 'GoBike Australia', 
    email: '',
    description: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); 
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');
    
    let newUploadedFiles: UploadedMedia[] = [];
    const totalFiles = files.length;
    let completedFiles = 0;

    try {
      for (const file of files) {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: true, 
          onUploadProgress: (progressEvent) => {
            const currentFileProgress = (progressEvent.loaded / progressEvent.total) * 100;
            const overallProgress = Math.round(((completedFiles * 100) + currentFileProgress) / totalFiles);
            setUploadProgress(overallProgress);
          },
        });
        
        // NEW: Capture full details for the Media Library
        newUploadedFiles.push({
          url: blob.url,
          pathname: blob.pathname || file.name,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        });
        
        completedFiles++;
      }
      
      setUploadedMedia((prev) => [...prev, ...newUploadedFiles]);
      setUploadProgress(100);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error: any) {
      console.error(error);
      setErrorMessage('Failed to upload files. ' + error.message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setUploadedMedia(files => files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      return alert("Please wait for files to finish uploading.");
    }
    if (uploadedMedia.length === 0) {
      return alert("Please upload at least one video or image.");
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Create comma-separated string for WarrantyClaim table
      const mediaUrlString = uploadedMedia.map(m => m.url).join(', ');
      
      // Pass both string (for old logic) and array (for Media Library)
      const result = await submitWarrantyClaim({ 
        ...formData, 
        mediaUrl: mediaUrlString,
        mediaDetails: uploadedMedia // NEW: Pass the full objects to backend
      });

      if (!result.success) throw new Error(result.message);

      setSuccessMessage('Your warranty claim has been submitted successfully! Our technical team will review your video and contact you shortly.');
      
      setFormData({ name: '', orderNumber: '', shopPurchased: 'GoBike Australia', email: '', description: '' });
      setUploadedMedia([]);
      setUploadProgress(0);

    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (REST OF THE UI REMAINS EXACTLY THE SAME)
  
  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-800 pb-20">
      <Breadcrumbs pageTitle="Warranty Claim" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* =========================================
              LEFT COLUMN: SEO CONTENT & INSTRUCTIONS
          ========================================= */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Warranty <span className="text-blue-600">Claim</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                At <strong>GoBike Australia</strong>, we build high-quality electric balance bikes for kids. If you experience any issues, our dedicated Australian support team is here to help you get back on track quickly with genuine replacement parts.
              </p>
            </div>

            {/* How it works steps (Good for UX & SEO) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">How the Claim Process Works</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[16px]">Submit Your Details</h4>
                    <p className="text-sm text-gray-500 mt-1">Provide your order info and a detailed description of the problem.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[16px]">Upload a Clear Video</h4>
                    <p className="text-sm text-gray-500 mt-1">Record a short video showing the issue so our mechanics can diagnose it accurately.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[16px]">Fast Resolution</h4>
                    <p className="text-sm text-gray-500 mt-1">Once approved, we will immediately dispatch the required replacement parts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Keyword Content */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What is Covered?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our comprehensive warranty covers manufacturing defects in the frame, motor, battery, and controller. Standard wear and tear (tires, brake pads) or damage from misuse are not covered.
              </p>
              <a href="/warranty" className="text-blue-600 font-semibold text-sm hover:underline">Read Full Warranty Policy →</a>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: THE FORM
          ========================================= */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl border border-gray-100 relative">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] rounded-tr-[2rem] -z-10"></div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Claim Form</h2>

              {successMessage && <div className="mb-8 p-5 bg-green-50 border-l-4 border-green-500 rounded-r-xl text-green-800 font-medium shadow-sm">✓ {successMessage}</div>}
              {errorMessage && <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-800 font-medium shadow-sm">✕ {errorMessage}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                  <p className="text-[13px] text-blue-800 font-medium flex items-center gap-2">
                    <span className="text-lg">💡</span> 
                    <span> Use the exact email from your purchase. We securely auto-fetch your shipping details!</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Original Order Number *</label>
                    <input type="text" name="orderNumber" required value={formData.orderNumber} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. #12345" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Shop Purchased From</label>
                    <select 
                      name="shopPurchased" 
                      value={formData.shopPurchased} 
                      onChange={handleInputChange} 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-gray-800 transition-all"
                    >
                      <option value="GoBike Australia" className="font-bold">GoBike Australia (Online)</option>
                      
                      <optgroup label="New South Wales">
                        <option value="On Two Wheels Motorsports">On Two Wheels Motorsports</option>
                        <option value="Engadine Cycles and Scooters">Engadine Cycles and Scooters</option>
                        <option value="MXR Motorsports Australia">MXR Motorsports Australia</option>
                        <option value="MiniRacer">MiniRacer</option>
                        <option value="Camden Cycles">Camden Cycles</option>
                        <option value="Valley Bikeco">Valley Bikeco</option>
                        <option value="Penrith Pit Bike">Penrith Pit Bike</option>
                      </optgroup>

                      <optgroup label="Victoria">
                        <option value="Ozminis Motorsport">Ozminis Motorsport</option>
                      </optgroup>

                      <optgroup label="Queensland">
                        <option value="Cooroy Motorcycles">Cooroy Motorcycles</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* VIDEO UPLOAD AREA */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Videos or Images *</label>
                  
                  <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center bg-blue-50/50 relative hover:border-blue-400 hover:bg-blue-50 transition-all">
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      multiple 
                      accept="video/mp4, video/quicktime, image/*" 
                      onChange={handleFileSelect}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition-colors"
                      disabled={isUploading}
                    />
                    
                    <p className="text-xs text-gray-500 mt-4">Max file size: 500MB. Formats: MP4, MOV, JPG, PNG.</p>
                    
                    {isUploading && (
                      <div className="mt-5">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 relative overflow-hidden" style={{ width: `${uploadProgress}%` }}>
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-sm text-blue-600 font-bold mt-2">Uploading Files: {uploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  {uploadedMedia.length > 0 && !isUploading && (
                    <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-xl">
                      <p className="text-[13px] font-bold text-green-700 mb-3">✓ {uploadedMedia.length} File(s) Ready to Submit:</p>
                      <ul className="space-y-2">
                        {uploadedMedia.map((media, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-100 text-sm shadow-sm">
                            <a href={media.url} target="_blank" className="text-blue-600 hover:underline font-medium truncate max-w-[70%]">{media.filename} - View</a>
                            <button type="button" onClick={() => removeMedia(idx)} className="text-red-500 hover:text-white hover:bg-red-500 font-bold px-3 py-1 rounded transition-colors text-xs">Remove</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description *</label>
                  <textarea name="description" required rows={4} value={formData.description} onChange={handleInputChange} placeholder="Please describe exactly what happened..." className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"></textarea>
                </div>

                <button type="submit" disabled={isSubmitting || isUploading || uploadedMedia.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                  {isSubmitting ? 'Submitting Claim...' : 'Submit Warranty Claim'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}