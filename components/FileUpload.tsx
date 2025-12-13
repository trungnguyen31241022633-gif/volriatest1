import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file.");
      return;
    }
    onFileSelect(file);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={`relative w-full p-8 transition-all duration-200 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : 
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={!disabled ? onButtonClick : undefined}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleChange}
        disabled={disabled}
      />
      
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
        <Upload size={32} />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        Upload your CV
      </h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
        Drag & drop your PDF here, or click to browse.
      </p>
      
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
        <FileText size={12} />
        <span>PDF only, max 10MB</span>
      </div>
    </div>
  );
};
