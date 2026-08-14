export function cleanSrt(srtContent, options) {
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split('\n\n');
  
  let parsedBlocks = [];
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const id = lines[0];
      const time = lines[1];
      const textLines = lines.slice(2);
      
      parsedBlocks.push({ id, time, textLines });
    }
  }

  const processText = (text) => {
    let processed = text;

    if (options.removeBetweenCurly) {
      processed = processed.replace(/\{.*?\}/g, '');
    }
    if (options.removeBetweenSquare) {
      processed = processed.replace(/\[.*?\]/g, '');
    }
    if (options.removeBetweenParens) {
      processed = processed.replace(/\(.*?\)/g, '');
    }
    if (options.removeBetweenAsterisks) {
      processed = processed.replace(/\*.*?\*/g, '');
    }
    if (options.removeBetweenHashtags) {
      processed = processed.replace(/#.*?#/g, '');
    }
    
    if (options.removeSpeakerLabels) {
      processed = processed.replace(/^[A-Z][a-zA-Z0-9\s]*:\s*/, '');
    }

    if (options.removeTextFormatting) {
      let temp = processed;
      
      if (options.keepItalic) {
        temp = temp.replace(/<i>/gi, '___TAG_I___').replace(/<\/i>/gi, '___TAG_END_I___');
      }
      if (options.keepBold) {
        temp = temp.replace(/<b>/gi, '___TAG_B___').replace(/<\/b>/gi, '___TAG_END_B___');
      }
      if (options.keepFont) {
        temp = temp.replace(/<font(.*?)>/gi, '___TAG_FONT$1___').replace(/<\/font>/gi, '___TAG_END_FONT___');
      }

      temp = temp.replace(/<[^>]+>/g, '');

      if (options.keepItalic) {
        temp = temp.replace(/___TAG_I___/g, '<i>').replace(/___TAG_END_I___/g, '</i>');
      }
      if (options.keepBold) {
        temp = temp.replace(/___TAG_B___/g, '<b>').replace(/___TAG_END_B___/g, '</b>');
      }
      if (options.keepFont) {
        temp = temp.replace(/___TAG_FONT(.*?)___/g, '<font$1>').replace(/___TAG_END_FONT___/g, '</font>');
      }
      processed = temp;
    }

    if (options.toLowerCase) {
      let result = '';
      let inTag = false;
      for (let i = 0; i < processed.length; i++) {
        if (processed[i] === '<') inTag = true;
        if (!inTag) result += processed[i].toLowerCase();
        else result += processed[i];
        if (processed[i] === '>') inTag = false;
      }
      processed = result;
    }

    return processed.trim();
  };

  let finalBlocks = [];

  for (const block of parsedBlocks) {
    if (options.removeMusicNotes && block.textLines.some(line => line.includes('♪'))) {
      continue;
    }

    let joinedText = block.textLines.join('\n');
    
    if (options.removeWatermarks) {
      const watermarks = ['sync by', 'subtitles by', 'downloaded from', 'opensubtitles'];
      if (watermarks.some(wm => joinedText.toLowerCase().includes(wm))) {
        continue;
      }
    }
    
    let processedLines = block.textLines.map(line => processText(line)).filter(line => line.length > 0);
    
    if (options.removeSdh) {
        processedLines = processedLines.map(line => 
          line.replace(/\[.*?\]/g, '')
              .replace(/\(.*?\)/g, '')
              .replace(/^[A-Z0-9\s]+:\s*/, '')
              .trim()
        ).filter(line => line.length > 0);
    }
    
    if (processedLines.length === 0) continue;

    let finalBlockText = options.removeLineBreaks ? processedLines.join(' ') : processedLines.join('\n');
    
    finalBlocks.push({
      time: block.time,
      text: finalBlockText
    });
  }

  if (options.mergeCues) {
    let mergedBlocks = [];
    let currentBlock = null;

    for (const block of finalBlocks) {
      if (!currentBlock) {
        currentBlock = { ...block };
      } else {
        if (currentBlock.text === block.text) {
          const start1 = currentBlock.time.split(' --> ')[0];
          const end2 = block.time.split(' --> ')[1];
          currentBlock.time = `${start1} --> ${end2}`;
        } else {
          mergedBlocks.push(currentBlock);
          currentBlock = { ...block };
        }
      }
    }
    if (currentBlock) {
      mergedBlocks.push(currentBlock);
    }
    finalBlocks = mergedBlocks;
  }

  let output = '';
  for (let i = 0; i < finalBlocks.length; i++) {
    output += `${i + 1}\r\n${finalBlocks[i].time}\r\n${finalBlocks[i].text}\r\n\r\n`;
  }

  return output.trim();
}
