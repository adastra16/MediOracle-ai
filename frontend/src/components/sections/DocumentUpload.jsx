import { useState, useCallback } from 'react';
import { useSpring, animated, useTrail } from '@react-spring/web';
import { GlassCard } from '../ui/GlassCard';
import { Button3D } from '../ui/Button3D';

function UploadZone({ onFilesSelected, isUploading }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const dropSpring = useSpring({
    scale: isDragOver ? 1.02 : 1,
    borderColor: isDragOver ? 'rgba(255, 121, 198, 0.8)' : 'rgba(255, 121, 198, 0.3)',
    backgroundColor: isDragOver ? 'rgba(255, 121, 198, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    config: { mass: 1, tension: 300, friction: 30 },
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files);
  }, [onFilesSelected]);

  return (
    <animated.div
      style={dropSpring}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative p-8 md:p-12 rounded-3xl border-2 border-dashed cursor-pointer transition-colors"
    >
      <input
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-400/20 to-pink-500/20 flex items-center justify-center">
          <span className="text-4xl">{isDragOver ? '📥' : '📄'}</span>
        </div>
        
        <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
          {isDragOver ? 'Drop files here!' : 'Upload Medical Documents'}
        </h3>
        
        <p className="text-text-secondary mb-4">
          Drag & drop files or click to browse
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 text-xs text-text-muted">
          <span className="px-2 py-1 rounded-lg bg-pink-100/50">PDF</span>
          <span className="px-2 py-1 rounded-lg bg-pink-100/50">TXT</span>
          <span className="px-2 py-1 rounded-lg bg-pink-100/50">DOC</span>
          <span className="px-2 py-1 rounded-lg bg-pink-100/50">DOCX</span>
        </div>
      </div>
    </animated.div>
  );
}

function FileCard({ file, index, onRemove, status }) {
  const cardSpring = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay: index * 100,
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading': return 'border-yellow-300 bg-yellow-50/50';
      case 'success': return 'border-green-300 bg-green-50/50';
      case 'error': return 'border-red-300 bg-red-50/50';
      default: return 'border-pink-200/30 bg-white/40';
    }
  };

  return (
    <animated.div
      style={cardSpring}
      className={`flex items-center gap-4 p-4 rounded-xl border ${getStatusColor()} transition-colors`}
    >
      <span className="text-2xl">{getStatusIcon()}</span>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{file.name}</p>
        <p className="text-sm text-text-muted">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      
      {status === 'uploading' && (
        <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
      )}
      
      {(status === 'pending' || status === 'error') && (
        <button
          onClick={() => onRemove(index)}
          className="p-2 rounded-lg hover:bg-pink-100/50 text-text-muted hover:text-pink-500 transition-colors"
        >
          ✕
        </button>
      )}
    </animated.div>
  );
}

export function DocumentUpload({ onUpload, uploadProgress }) {
  const [files, setFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const containerSpring = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const handleFilesSelected = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'txt', 'doc', 'docx'].includes(ext);
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    
    const newStatuses = {};
    validFiles.forEach((_, i) => {
      newStatuses[files.length + i] = 'pending';
    });
    setFileStatuses(prev => ({ ...prev, ...newStatuses }));
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[index];
      return newStatuses;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      if (fileStatuses[i] === 'success') continue;
      
      setFileStatuses(prev => ({ ...prev, [i]: 'uploading' }));
      
      try {
        await onUpload(files[i]);
        setFileStatuses(prev => ({ ...prev, [i]: 'success' }));
      } catch (error) {
        setFileStatuses(prev => ({ ...prev, [i]: 'error' }));
      }
    }
    
    setIsUploading(false);
  };

  const pendingCount = Object.values(fileStatuses).filter(s => s === 'pending').length;
  const successCount = Object.values(fileStatuses).filter(s => s === 'success').length;

  return (
    <animated.div style={containerSpring} className="w-full max-w-3xl mx-auto space-y-6">
      <GlassCard className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 shadow-pink-lg">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gradient mb-2">
            Upload Documents
          </h2>
          <p className="text-text-secondary">
            Add medical documents to enhance AI responses
          </p>
        </div>

        <UploadZone onFilesSelected={handleFilesSelected} isUploading={isUploading} />

        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-text-primary">
                Selected Files ({files.length})
              </h4>
              {successCount > 0 && (
                <span className="text-sm text-green-600">
                  {successCount} uploaded successfully
                </span>
              )}
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <FileCard
                  key={`${file.name}-${index}`}
                  file={file}
                  index={index}
                  status={fileStatuses[index]}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button3D
                variant="neon"
                size="lg"
                onClick={handleUpload}
                loading={isUploading}
                disabled={pendingCount === 0}
                icon="☁️"
              >
                {isUploading ? 'Uploading...' : `Upload ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
              </Button3D>
              
              {files.length > 0 && !isUploading && (
                <Button3D
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setFiles([]);
                    setFileStatuses({});
                  }}
                  icon="🗑️"
                >
                  Clear All
                </Button3D>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </animated.div>
  );
}

export default DocumentUpload;

