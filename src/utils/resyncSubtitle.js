/**
 * Resync (time-shift) subtitles by a given number of milliseconds.
 * Supports: .srt, .vtt (webvtt), .ass, .ssa, .smi
 */

/* ── helpers ── */

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}

function clampMs(ms) {
  return Math.max(0, ms);
}

/* ── SRT ── */

function resyncSrt(content, offsetMs) {
  return content.replace(
    /(\d{2}):(\d{2}):(\d{2}),(\d{3})/g,
    (_, h, m, s, ms) => {
      const total = clampMs(
        parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(s) * 1000 + parseInt(ms) + offsetMs
      );
      const hh = pad(Math.floor(total / 3600000));
      const mm = pad(Math.floor((total % 3600000) / 60000));
      const ss = pad(Math.floor((total % 60000) / 1000));
      const mmm = pad(total % 1000, 3);
      return `${hh}:${mm}:${ss},${mmm}`;
    }
  );
}

/* ── VTT (WebVTT) ── */

function resyncVtt(content, offsetMs) {
  return content.replace(
    /(\d{2}):(\d{2}):(\d{2})\.(\d{3})/g,
    (_, h, m, s, ms) => {
      const total = clampMs(
        parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(s) * 1000 + parseInt(ms) + offsetMs
      );
      const hh = pad(Math.floor(total / 3600000));
      const mm = pad(Math.floor((total % 3600000) / 60000));
      const ss = pad(Math.floor((total % 60000) / 1000));
      const mmm = pad(total % 1000, 3);
      return `${hh}:${mm}:${ss}.${mmm}`;
    }
  );
}

/* ── ASS / SSA ── */

function resyncAss(content, offsetMs) {
  // ASS time format: H:MM:SS.cc  (centiseconds)
  return content.replace(
    /(\d+):(\d{2}):(\d{2})\.(\d{2})/g,
    (_, h, m, s, cs) => {
      const total = clampMs(
        parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(s) * 1000 + parseInt(cs) * 10 + offsetMs
      );
      const hh = Math.floor(total / 3600000);
      const mm = pad(Math.floor((total % 3600000) / 60000));
      const ss = pad(Math.floor((total % 60000) / 1000));
      const cc = pad(Math.floor((total % 1000) / 10));
      return `${hh}:${mm}:${ss}.${cc}`;
    }
  );
}

/* ── SMI ── */

function resyncSmi(content, offsetMs) {
  // SMI uses <SYNC Start=milliseconds>
  return content.replace(
    /<SYNC\s+Start\s*=\s*(\d+)/gi,
    (match, ms) => {
      const newMs = clampMs(parseInt(ms) + offsetMs);
      return `<SYNC Start=${newMs}`;
    }
  );
}

/* ── Main export ── */

export function detectResyncFormat(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'srt') return 'srt';
  if (ext === 'vtt' || ext === 'webvtt') return 'vtt';
  if (ext === 'ass') return 'ass';
  if (ext === 'ssa') return 'ssa';
  if (ext === 'smi') return 'smi';
  return null;
}

export function resyncSubtitle(content, offsetMs, format) {
  switch (format) {
    case 'srt':
      return resyncSrt(content, offsetMs);
    case 'vtt':
      return resyncVtt(content, offsetMs);
    case 'ass':
    case 'ssa':
      return resyncAss(content, offsetMs);
    case 'smi':
      return resyncSmi(content, offsetMs);
    default:
      return content;
  }
}
