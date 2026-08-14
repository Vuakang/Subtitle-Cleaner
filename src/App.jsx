import React, { useState } from 'react';
import Uploader from './components/Uploader';
import Settings from './components/Settings';
import ThemeToggle from './components/ThemeToggle';
import FormatConverter from './components/FormatConverter';
import ResyncSubtitles from './components/ResyncSubtitles';
import Footer from './components/Footer';
import { cleanSrt } from './utils/srtCleaner';
import { Download, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

function App() {
  const [options, setOptions] = useState({
    removeSdh: false,
    removeWatermarks: false,
    removeSpeakerLabels: false,
    removeMusicNotes: false,
    removeLineBreaks: false,
    mergeCues: false,
    toLowerCase: false,
    removeTextFormatting: false,
    keepItalic: false,
    keepBold: false,
    keepFont: false,
    removeAngleBrackets: false,
    removeBetweenCurly: false,
    removeBetweenParens: false,
    removeBetweenSquare: false,
    removeBetweenAsterisks: false,
    removeBetweenHashtags: false
  });

  const [rawFiles, setRawFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);

  const handleFileLoad = (loadedFiles) => {
    setRawFiles(loadedFiles);
    setProcessedFiles([]);
  };

  const handleClean = () => {
    if (rawFiles.length === 0) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        const results = rawFiles.map(file => {
          const cleanedContent = cleanSrt(file.content, options);
          return {
            name: file.name.replace('.srt', '_cleaned.srt'),
            content: cleanedContent
          };
        });
        setProcessedFiles(results);
      } catch (err) {
        alert("An error occurred while cleaning the subtitles.");
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const handleDownload = async () => {
    if (processedFiles.length === 0) return;
    
    if (processedFiles.length === 1) {
      const file = processedFiles[0];
      const element = document.createElement("a");
      const blob = new Blob([file.content], {type: 'text/plain'});
      element.href = URL.createObjectURL(blob);
      element.download = file.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      const zip = new JSZip();
      processedFiles.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      const content = await zip.generateAsync({ type: "blob" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = "cleaned_subtitles.zip";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <>
      <div className="app-container">
        <header className="header animate-fade-in">
          <ThemeToggle />
          <h1>Srt Cleaner</h1>
          <p style={{ textAlign: 'center' }}>Remove HTML tags and formatting from your subtitle files instantly.</p>
        </header>

        <div className="main-content">
          <div className="settings-column">
            <Settings options={options} setOptions={setOptions} />
          </div>

          <div className="uploader-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Uploader onFileLoad={handleFileLoad} />
            
            <div className="glass-panel animate-fade-in uploader-actions" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <button 
                className="btn" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                onClick={handleClean}
                disabled={rawFiles.length === 0 || isProcessing}
              >
                <Sparkles size={20} />
                {isProcessing ? 'Cleaning...' : `Clean Subtitle${rawFiles.length > 1 ? 's' : ''}`}
              </button>

              {processedFiles.length > 0 && (
                <button 
                  className="btn" 
                  style={{ width: '100%', padding: '1rem', background: 'var(--success-color)' }}
                  onClick={handleDownload}
                >
                  <Download size={20} />
                  {processedFiles.length === 1 ? 'Download Cleaned .srt' : `Download All (.zip)`}
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="section-divider" />

        <FormatConverter />

        <hr className="section-divider" />

        <ResyncSubtitles />
      </div>

      <Footer />
    </>
  );
}

export default App;
