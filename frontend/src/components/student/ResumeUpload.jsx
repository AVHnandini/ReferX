import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

export default function ResumeUpload({ currentResume, onUpload, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.includes("pdf") && !file.type.includes("document")) {
      setError("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // In a real app, you'd upload to a server
      // For now, we'll just simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In real app, this would be server URL
        uploadedAt: new Date().toISOString(),
      };

      onUpload(fileData);
    } catch (err) {
      setError("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (currentResume) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Resume</h3>
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <FileText size={20} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{currentResume.name}</p>
            <p className="text-sm text-gray-400">
              {formatFileSize(currentResume.size)} • Uploaded {new Date(currentResume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <CheckCircle size={20} className="text-green-400" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Upload Resume</h3>
        <p className="text-gray-400 text-sm">Upload your resume to improve your profile and get better job matches</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-blue-400 bg-blue-500/10"
            : "border-gray-600 hover:border-gray-500 hover:bg-white/5"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-white font-medium">Uploading...</p>
            <p className="text-gray-400 text-sm">Please wait</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-600/50 flex items-center justify-center mb-4">
              <Upload size={24} className="text-gray-400" />
            </div>
            <p className="text-white font-medium mb-2">Drop your resume here</p>
            <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
            <p className="text-gray-500 text-xs">PDF, DOC, DOCX up to 5MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
    </motion.div>
  );
}
