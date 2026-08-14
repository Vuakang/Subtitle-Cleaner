// ────────────────────────────────────────────────────────────
// formatConverter.js
// Subtitle format conversion utilities: SRT, VTT, ASS, SUB
// ────────────────────────────────────────────────────────────

// ── Time helpers ────────────────────────────────────────────

/**
 * Normalise line endings to \n.
 */
function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Convert milliseconds → SRT time string `HH:MM:SS,mmm`
 */
export function msToSrtTime(ms) {
  const totalMs = Math.max(0, Math.round(ms));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = totalMs % 1000;
  return (
    String(hours).padStart(2, '0') +
    ':' +
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0') +
    ',' +
    String(millis).padStart(3, '0')
  );
}

/**
 * Convert milliseconds → VTT time string `HH:MM:SS.mmm`
 */
export function msToVttTime(ms) {
  return msToSrtTime(ms).replace(',', '.');
}

/**
 * Convert milliseconds → ASS time string `H:MM:SS.cc` (centiseconds)
 */
export function msToAssTime(ms) {
  const totalMs = Math.max(0, Math.round(ms));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centis = Math.floor((totalMs % 1000) / 10);
  return (
    String(hours) +
    ':' +
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0') +
    '.' +
    String(centis).padStart(2, '0')
  );
}

/**
 * Parse SRT time string `HH:MM:SS,mmm` → milliseconds
 */
export function srtTimeToMs(time) {
  const m = time.trim().match(/^(\d+):(\d+):(\d+)[,.](\d+)$/);
  if (!m) return 0;
  return (
    parseInt(m[1], 10) * 3600000 +
    parseInt(m[2], 10) * 60000 +
    parseInt(m[3], 10) * 1000 +
    parseInt(m[4].padEnd(3, '0').slice(0, 3), 10)
  );
}

/**
 * Parse VTT time string `HH:MM:SS.mmm` or `MM:SS.mmm` → milliseconds
 */
export function vttTimeToMs(time) {
  const t = time.trim();
  // VTT allows MM:SS.mmm (no hours)
  const m = t.match(/^(?:(\d+):)?(\d+):(\d+)[.](\d+)$/);
  if (!m) return 0;
  const hours = m[1] ? parseInt(m[1], 10) : 0;
  return (
    hours * 3600000 +
    parseInt(m[2], 10) * 60000 +
    parseInt(m[3], 10) * 1000 +
    parseInt(m[4].padEnd(3, '0').slice(0, 3), 10)
  );
}

/**
 * Parse ASS time string `H:MM:SS.cc` → milliseconds
 */
export function assTimeToMs(time) {
  const m = time.trim().match(/^(\d+):(\d+):(\d+)[.](\d+)$/);
  if (!m) return 0;
  return (
    parseInt(m[1], 10) * 3600000 +
    parseInt(m[2], 10) * 60000 +
    parseInt(m[3], 10) * 1000 +
    parseInt(m[4].padEnd(2, '0').slice(0, 2), 10) * 10
  );
}

// ── Parsers ─────────────────────────────────────────────────

/**
 * Parse SRT content → array of cue objects
 * `[{ index, startTime, endTime, text }]`  (times in ms)
 */
export function parseSrt(content) {
  const text = normalizeLineEndings(content).trim();
  if (!text) return [];

  const blocks = text.split(/\n\n+/);
  const cues = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;

    // Find the timing line (contains -->)
    let timingIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingIdx = i;
        break;
      }
    }
    if (timingIdx === -1) continue;

    const index = timingIdx > 0 ? parseInt(lines[0], 10) : cues.length + 1;
    const timeParts = lines[timingIdx].split('-->');
    if (timeParts.length < 2) continue;

    const startTime = srtTimeToMs(timeParts[0]);
    const endTime = srtTimeToMs(timeParts[1]);
    const cueText = lines.slice(timingIdx + 1).join('\n').trim();

    if (cueText) {
      cues.push({ index: isNaN(index) ? cues.length + 1 : index, startTime, endTime, text: cueText });
    }
  }

  return cues;
}

/**
 * Parse WebVTT content → array of cue objects
 */
export function parseVtt(content) {
  const text = normalizeLineEndings(content).trim();
  if (!text) return [];

  // Strip the WEBVTT header and any metadata before the first blank line pair
  const blocks = text.split(/\n\n+/);
  const cues = [];
  let cueIndex = 1;

  for (const block of blocks) {
    const lines = block.split('\n');

    // Skip header block
    if (lines[0].startsWith('WEBVTT')) continue;
    // Skip NOTE blocks
    if (lines[0].startsWith('NOTE')) continue;
    // Skip STYLE blocks
    if (lines[0].startsWith('STYLE')) continue;

    // Find timing line
    let timingIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingIdx = i;
        break;
      }
    }
    if (timingIdx === -1) continue;

    const timeParts = lines[timingIdx].split('-->');
    if (timeParts.length < 2) continue;

    // VTT may have positioning info after the end time – strip it
    const startTime = vttTimeToMs(timeParts[0]);
    const endTimePart = timeParts[1].trim().split(/\s/)[0];
    const endTime = vttTimeToMs(endTimePart);
    const cueText = lines.slice(timingIdx + 1).join('\n').trim();

    if (cueText) {
      cues.push({ index: cueIndex++, startTime, endTime, text: cueText });
    }
  }

  return cues;
}

/**
 * Parse ASS/SSA content → array of cue objects
 * Extracts Dialogue lines from the [Events] section.
 */
export function parseAss(content) {
  const text = normalizeLineEndings(content).trim();
  if (!text) return [];

  const lines = text.split('\n');
  const cues = [];
  let inEvents = false;
  let formatFields = null;
  let cueIndex = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers
    if (/^\[.*\]$/.test(trimmed)) {
      inEvents = /^\[events\]$/i.test(trimmed);
      continue;
    }

    if (!inEvents) continue;

    // Parse Format line to know column positions
    if (/^format\s*:/i.test(trimmed)) {
      formatFields = trimmed
        .replace(/^format\s*:\s*/i, '')
        .split(',')
        .map((f) => f.trim().toLowerCase());
      continue;
    }

    // Parse Dialogue lines
    if (/^dialogue\s*:/i.test(trimmed)) {
      const rawValues = trimmed.replace(/^dialogue\s*:\s*/i, '');

      // The Text field is always the last field and may contain commas,
      // so we split only up to (formatFields.length - 1) commas.
      const fieldCount = formatFields ? formatFields.length : 10;
      const parts = rawValues.split(',');
      const values = parts.slice(0, fieldCount - 1);
      values.push(parts.slice(fieldCount - 1).join(','));

      const getField = (name) => {
        if (!formatFields) return undefined;
        const idx = formatFields.indexOf(name);
        return idx !== -1 && idx < values.length ? values[idx].trim() : undefined;
      };

      const startStr = getField('start');
      const endStr = getField('end');
      let cueText = getField('text') || '';

      // Strip ASS override tags like {\b1}, {\an8}, etc.
      cueText = cueText.replace(/\{[^}]*\}/g, '');
      // Convert \N and \n to real newlines
      cueText = cueText.replace(/\\N/g, '\n').replace(/\\n/g, '\n');
      cueText = cueText.trim();

      if (startStr && endStr && cueText) {
        cues.push({
          index: cueIndex++,
          startTime: assTimeToMs(startStr),
          endTime: assTimeToMs(endStr),
          text: cueText,
        });
      }
    }
  }

  return cues;
}

/**
 * Parse MicroDVD SUB format `{startFrame}{endFrame}text` → cue objects
 */
export function parseSub(content, fps = 23.976) {
  const text = normalizeLineEndings(content).trim();
  if (!text) return [];

  const lines = text.split('\n');
  const cues = [];
  let cueIndex = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const m = trimmed.match(/^\{(\d+)\}\{(\d+)\}(.+)$/);
    if (!m) continue;

    const startFrame = parseInt(m[1], 10);
    const endFrame = parseInt(m[2], 10);
    let cueText = m[3];

    // MicroDVD uses | for line breaks
    cueText = cueText.replace(/\|/g, '\n').trim();

    const startTime = Math.round((startFrame / fps) * 1000);
    const endTime = Math.round((endFrame / fps) * 1000);

    if (cueText) {
      cues.push({ index: cueIndex++, startTime, endTime, text: cueText });
    }
  }

  return cues;
}

// ── Serialisers ─────────────────────────────────────────────

/**
 * Convert cues array → SRT string
 */
export function toSrt(cues) {
  return cues
    .map(
      (cue, i) =>
        `${i + 1}\n${msToSrtTime(cue.startTime)} --> ${msToSrtTime(cue.endTime)}\n${cue.text}`
    )
    .join('\n\n');
}

/**
 * Convert cues array → WebVTT string
 */
export function toVtt(cues) {
  const header = 'WEBVTT\n\n';
  const body = cues
    .map(
      (cue, i) =>
        `${i + 1}\n${msToVttTime(cue.startTime)} --> ${msToVttTime(cue.endTime)}\n${cue.text}`
    )
    .join('\n\n');
  return header + body;
}

/**
 * Convert cues array → ASS string (full file with headers)
 */
export function toAss(cues) {
  const header = `[Script Info]
; Script generated by Subtitle Converter
Title: Converted Subtitle
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const dialogues = cues
    .map((cue) => {
      const text = cue.text.replace(/\n/g, '\\N');
      return `Dialogue: 0,${msToAssTime(cue.startTime)},${msToAssTime(cue.endTime)},Default,,0,0,0,,${text}`;
    })
    .join('\n');

  return header + dialogues + '\n';
}

/**
 * Convert cues array → MicroDVD SUB string
 */
export function toSub(cues, fps = 23.976) {
  return cues
    .map((cue) => {
      const startFrame = Math.round((cue.startTime / 1000) * fps);
      const endFrame = Math.round((cue.endTime / 1000) * fps);
      const text = cue.text.replace(/\n/g, '|');
      return `{${startFrame}}{${endFrame}}${text}`;
    })
    .join('\n');
}

// ── Detection & Conversion ─────────────────────────────────

/**
 * Auto-detect subtitle format from file content.
 * Returns one of: 'srt', 'vtt', 'ass', 'sub', or 'unknown'.
 */
export function detectFormat(content) {
  const text = normalizeLineEndings(content).trim();

  if (/^WEBVTT/i.test(text)) return 'vtt';
  if (/^\[Script Info\]/im.test(text)) return 'ass';
  if (/\[V4\+?\s*Styles?\]/im.test(text)) return 'ass';
  if (/^\{\d+\}\{\d+\}/m.test(text)) return 'sub';

  // SRT: lines like "1\n00:00:01,000 --> 00:00:02,000"
  if (/\d+:\d+:\d+[,.]\d+\s*-->\s*\d+:\d+:\d+[,.]\d+/.test(text)) return 'srt';

  return 'unknown';
}

const parsers = {
  srt: parseSrt,
  vtt: parseVtt,
  ass: parseAss,
  sub: parseSub,
};

const serialisers = {
  srt: toSrt,
  vtt: toVtt,
  ass: toAss,
  sub: toSub,
};

/**
 * Convert subtitle content from one format to another.
 * @param {string} content      Raw subtitle text
 * @param {string} fromFormat   Source format ('srt','vtt','ass','sub','auto')
 * @param {string} toFormat     Target format ('srt','vtt','ass','sub')
 * @returns {string}            Converted subtitle text
 */
export function convertSubtitle(content, fromFormat, toFormat) {
  let sourceFormat = fromFormat;
  if (!sourceFormat || sourceFormat === 'auto') {
    sourceFormat = detectFormat(content);
  }

  const parser = parsers[sourceFormat];
  if (!parser) {
    throw new Error(`Unsupported source format: ${sourceFormat}`);
  }

  const serialiser = serialisers[toFormat];
  if (!serialiser) {
    throw new Error(`Unsupported target format: ${toFormat}`);
  }

  const cues = parser(content);
  return serialiser(cues);
}
