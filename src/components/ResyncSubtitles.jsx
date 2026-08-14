import React, { useCallback, useState } from 'react';
import { UploadCloud, CheckCircle2, Download, Timer, Info } from 'lucide-react';
import { resyncSubtitle, detectResyncFormat } from '../utils/resyncSubtitle';
import JSZip from 'jszip';

export default function ResyncSubtitles() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [offsetMs, setOffsetMs] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);

  const SUPPORTED_EXTS = ['.srt', '.ass', '.ssa', '.smi', '.vtt'];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const processInputFiles = async (fileList) => {
    const validFiles = Array.from(fileList).filter(f =>
      SUPPORTED_EXTS.some(ext => f.name.toLowerCase().endsWith(ext))
    );
    if (validFiles.length === 0) {
      alert('Please upload valid subtitle files (.srt, .ass, .ssa, .smi, .vtt)');
      return;
    }
    setFileNames(validFiles.map(f => f.name));

    const loaded = await Promise.all(
      validFiles.map(file =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ content: e.target.result, name: file.name });
          reader.readAsText(file);
        })
      )
    );
    setFiles(loaded);
    setProcessedFiles([]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) processInputFiles(e.dataTransfer.files);
  }, []);

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files?.length) processInputFiles(e.target.files);
  };

  const handleResync = () => {
    if (files.length === 0 || offsetMs === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const results = files.map(file => {
          const format = detectResyncFormat(file.name);
          if (!format) return { name: file.name, content: file.content };
          const synced = resyncSubtitle(file.content, offsetMs, format);
          const ext = file.name.split('.').pop();
          const baseName = file.name.replace(`.${ext}`, '');
          return {
            name: `${baseName}_resynced.${ext}`,
            content: synced
          };
        });
        setProcessedFiles(results);
      } catch (err) {
        alert('An error occurred while resyncing.');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const handleDownload = async () => {
    if (processedFiles.length === 0) return;
    if (processedFiles.length === 1) {
      const f = processedFiles[0];
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([f.content], { type: 'text/plain' }));
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const zip = new JSZip();
      processedFiles.forEach(f => zip.file(f.name, f.content));
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'resynced_subtitles.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetFiles = (e) => {
    e.stopPropagation();
    setFiles([]);
    setFileNames([]);
    setProcessedFiles([]);
    document.getElementById('resync-file-upload').value = '';
  };

  return (
    <div className="resync-section animate-fade-in">
      <h2 style={{ display: 'block', textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        <Timer size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
        Resync Subtitles
      </h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        This tool fixes subtitles that are out of sync with the video. Shift all timestamps forward or backward by a specified amount.
      </p>

      <div className="resync-layout">
        {/* Left: Upload + Controls */}
        <div className="glass-panel resync-controls-panel">
          <div
            className={`uploader-zone resync-uploader ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resync-file-upload').click()}
          >
            <input
              type="file"
              id="resync-file-upload"
              accept=".srt,.ass,.ssa,.smi,.vtt"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {fileNames.length > 0 ? (
              <>
                <CheckCircle2 className="uploader-icon" style={{ color: 'var(--success-color)' }} />
                <div style={{ width: '100%', overflow: 'hidden' }}>
                  <h3>{fileNames.length} {fileNames.length === 1 ? 'File' : 'Files'} Loaded</h3>
                  <p style={{
                    marginTop: '0.5rem', fontSize: '0.85rem',
                    wordBreak: 'break-all', overflow: 'hidden',
                    textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {fileNames.slice(0, 2).join(', ')}
                    {fileNames.length > 2 && ` and ${fileNames.length - 2} more...`}
                  </p>
                </div>
                <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={resetFiles}>
                  Choose other files
                </button>
              </>
            ) : (
              <>
                <UploadCloud className="uploader-icon" />
                <div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Upload Subtitle Files</h3>
                  <p>Drag and drop your subtitle files here, or click to browse</p>
                </div>
              </>
            )}
          </div>

          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Supported formats: srt, ass, ssa, smi, webvtt
          </p>
        </div>

        {/* Right: Timing Input + Info */}
        <div className="glass-panel resync-timing-panel">
          <div className="resync-timing-row">
            <label htmlFor="offset-input" className="resync-timing-label">Change the timing by</label>
            <div className="resync-input-group">
              <input
                id="offset-input"
                type="number"
                className="resync-input"
                value={offsetMs}
                onChange={(e) => setOffsetMs(parseInt(e.target.value) || 0)}
              />
              <span className="resync-unit">milliseconds</span>
            </div>
          </div>

          <div className="resync-hints">
            <div className="resync-hint">
              <Info size={14} />
              <span>1 second = 1000 milliseconds</span>
            </div>
            <div className="resync-hint">
              <Info size={14} />
              <span>If the subtitle appears <strong>too early</strong>, enter a <strong>positive</strong> number</span>
            </div>
            <div className="resync-hint">
              <Info size={14} />
              <span>If the subtitle appears <strong>too late</strong>, enter a <strong>negative</strong> number</span>
            </div>
          </div>

          <button
            className="btn"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '1.5rem' }}
            onClick={handleResync}
            disabled={files.length === 0 || offsetMs === 0 || isProcessing}
          >
            <Timer size={20} />
            {isProcessing ? 'Resyncing...' : `Resync Subtitle${files.length > 1 ? 's' : ''}`}
          </button>

          {processedFiles.length > 0 && (
            <button
              className="btn"
              style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: 'var(--success-color)' }}
              onClick={handleDownload}
            >
              <Download size={20} />
              {processedFiles.length === 1 ? 'Download Resynced File' : 'Download All (.zip)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
