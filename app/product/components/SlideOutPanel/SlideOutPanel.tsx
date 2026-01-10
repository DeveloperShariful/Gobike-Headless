// ফাইল পাথ: app/product/components/SlideOutPanel/SlideOutPanel.tsx
'use client';

// import styles from './SlideOutPanel.module.css'; // CSS Module সরানো হয়েছে

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideOutPanel({ isOpen, onClose, title, children }: SlideOutPanelProps) {
  // isOpen false হলে রেন্ডার করবে না, তবে এনিমেশনের জন্য এটি হ্যান্ডেল করা ভালো। 
  // তবে আপনার লজিক অনুযায়ী এটি রাখছি।
  
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed top-0 left-0 w-full h-full bg-black/50 z-[999] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 w-full max-w-[480px] h-full bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.1)] z-[1000] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#e5e5e5]">
          <h3 className="text-[1.1rem] font-semibold m-0 tracking-[1px] uppercase">{title}</h3>
          <button 
            onClick={onClose} 
            className="bg-transparent border-none cursor-pointer p-0 text-[2rem] text-[#333] leading-none hover:text-black transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
            {children}
        </div>
      </div>
    </>
  );
}