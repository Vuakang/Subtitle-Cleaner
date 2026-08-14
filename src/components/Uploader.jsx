import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export default function Uploader({ onFileLoad }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileNames, setFileNames] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFiles = async (files) => {
    const srtFiles = Array.from(files).filter(f => f.name.endsWith('.srt'));
    
    if (srtFiles.length === 0) {
      alert("Please upload valid .srt files.");
      return;
    }

    setFileNames(srtFiles.map(f => f.name));
    
    const filePromises = srtFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ content: e.target.result, name: file.name });
        };
        reader.readAsText(file);
      });
    });

    const loadedFiles = await Promise.all(filePromises);
    onFileLoad(loadedFiles);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div 
      className={`glass-panel uploader-zone ${dragActive ? 'drag-active' : ''} animate-fade-in`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload').click()}
    >
      <input 
        type="file" 
        id="file-upload" 
        accept=".srt" 
        multiple
        style={{ display: 'none' }} 
        onChange={handleChange} 
      />
      
      {fileNames.length > 0 ? (
        <>
          <CheckCircle2 className="uploader-icon" style={{ color: 'var(--success-color)' }} />
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <h3>{fileNames.length} {fileNames.length === 1 ? 'File' : 'Files'} Loaded</h3>
            {fileNames.length === 1 ? (
              <p style={{ marginTop: '0.5rem', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{fileNames[0]}</p>
            ) : (
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {fileNames.slice(0, 2).join(', ')}
                {fileNames.length > 2 && ` and ${fileNames.length - 2} more...`}
              </p>
            )}
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={(e) => {
            e.stopPropagation();
            setFileNames([]);
            onFileLoad([]);
            document.getElementById('file-upload').value = '';
          }}>
            Choose other files
          </button>
        </>
      ) : (
        <>
          <UploadCloud className="uploader-icon" />
          <div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Upload Subtitle Files</h3>
            <p>Drag and drop multiple .srt files here, or click to browse</p>
          </div>
        </>
      )}
    </div>
  );
}
