import { useState, useCallback } from 'react';
import { convertSubtitle, detectFormat } from '../utils/formatConverter';
import JSZip from 'jszip';
import { ArrowRightLeft, Download, UploadCloud, CheckCircle2 } from 'lucide-react';

const ACCEPTED_EXTENSIONS = ['.srt', '.ass', '.vtt', '.sub'];

const OUTPUT_FORMATS = [
  { value: 'srt', label: 'SRT' },
  { value: 'vtt', label: 'VTT (WebVTT)' },
  { value: 'ass', label: 'ASS' },
  { value: 'sub', label: 'SUB (MicroDVD)' },
];

function getExtension(filename) {
  const dot = filename.lastIndexOf('.');
  return dot !== -1 ? filename.slice(dot).toLowerCase() : '';
}

function replaceExtension(filename, newExt) {
  const dot = filename.lastIndexOf('.');
  const base = dot !== -1 ? filename.slice(0, dot) : filename;
  return `${base}.${newExt}`;
}

export default function FormatConverter() {
  const [files, setFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('srt');
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  // ── File handling ───────────────────────────────────────

  const processFiles = useCallback((fileList) => {
    const accepted = Array.from(fileList).filter((f) =>
      ACCEPTED_EXTENSIONS.includes(getExtension(f.name))
    );
    if (accepted.length === 0) {
      setError('No supported subtitle files selected. Accepted: .srt, .ass, .vtt, .sub');
      return;
    }
    setError('');
    setConvertedFiles([]);
    setFiles(accepted);
  }, []);

  // ── Drag & drop handlers ────────────────────────────────

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  // ── Conversion ──────────────────────────────────────────

  const handleConvert = async () => {
    if (files.length === 0) return;
    setError('');

    try {
      const results = [];

      for (const file of files) {
        const content = await file.text();
        const detected = detectFormat(content);
        if (detected === 'unknown') {
          results.push({
            name: replaceExtension(file.name, outputFormat),
            content: null,
            error: `Could not detect format of "${file.name}"`,
          });
          continue;
        }

        if (detected === outputFormat) {
          results.push({
            name: replaceExtension(file.name, outputFormat),
            content,
            skipped: true,
          });
          continue;
        }

        const converted = convertSubtitle(content, detected, outputFormat);
        results.push({
          name: replaceExtension(file.name, outputFormat),
          content: converted,
        });
      }

      setConvertedFiles(results);
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
    }
  };

  // ── Download helpers ────────────────────────────────────

  const downloadSingle = (result) => {
    if (!result.content) return;
    const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllZip = async () => {
    const valid = convertedFiles.filter((f) => f.content);
    if (valid.length === 0) return;

    const zip = new JSZip();
    for (const file of valid) {
      zip.file(file.name, file.content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_subtitles.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────

  const hasResults = convertedFiles.length > 0;
  const validResults = convertedFiles.filter((f) => f.content);

  return (
    <div className="converter-section animate-fade-in">
      <div className="glass-panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ArrowRightLeft size={22} />
          Format Converter
        </h2>

        {/* ── Drop zone ─────────────────────────────────── */}
        <div
          className={`uploader-zone${isDragOver ? ' drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('converter-file-input')?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              document.getElementById('converter-file-input')?.click();
            }
          }}
        >
          <UploadCloud size={36} strokeWidth={1.5} style={{ opacity: 0.6 }} />
          <p>Drag &amp; drop subtitle files here, or click to browse</p>
          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
            Supported: .srt, .ass, .vtt, .sub
          </span>
          <input
            id="converter-file-input"
            type="file"
            accept=".srt,.ass,.vtt,.sub"
            multiple
            hidden
            onChange={handleFileInput}
          />
        </div>

        {/* ── File list ─────────────────────────────────── */}
        {files.length > 0 && (
          <div style={{ margin: '0.75rem 0' }}>
            <strong>{files.length} file{files.length > 1 ? 's' : ''} selected:</strong>
            <ul style={{ margin: '0.25rem 0 0 1.25rem', fontSize: '0.9rem' }}>
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Output format selector ────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <label htmlFor="output-format-select" style={{ fontWeight: 500 }}>
            Convert to:
          </label>
          <select
            id="output-format-select"
            className="format-select"
            value={outputFormat}
            onChange={(e) => {
              setOutputFormat(e.target.value);
              setConvertedFiles([]);
            }}
          >
            {OUTPUT_FORMATS.map((fmt) => (
              <option key={fmt.value} value={fmt.value}>
                {fmt.label}
              </option>
            ))}
          </select>

          <button
            className="btn"
            onClick={handleConvert}
            disabled={files.length === 0}
          >
            <ArrowRightLeft size={16} />
            Convert
          </button>
        </div>

        {/* ── Error ─────────────────────────────────────── */}
        {error && (
          <p style={{ color: '#ff6b6b', marginTop: '0.75rem' }}>{error}</p>
        )}

        {/* ── Results ───────────────────────────────────── */}
        {hasResults && (
          <div className="animate-fade-in" style={{ marginTop: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#51cf66' }} />
              Conversion Results
            </h3>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {convertedFiles.map((result, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>
                    {result.name}
                    {result.skipped && (
                      <em style={{ opacity: 0.5, marginLeft: '0.5rem' }}>(same format — skipped)</em>
                    )}
                    {result.error && (
                      <em style={{ color: '#ff6b6b', marginLeft: '0.5rem' }}>{result.error}</em>
                    )}
                  </span>
                  {result.content && (
                    <button className="btn" onClick={() => downloadSingle(result)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>
                      <Download size={14} />
                      Download
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {validResults.length > 1 && (
              <button
                className="btn"
                onClick={downloadAllZip}
                style={{ marginTop: '0.75rem' }}
              >
                <Download size={16} />
                Download All (.zip)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
