import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function Settings({ options, setOptions }) {
  const handleChange = (e) => {
    const { name, checked } = e.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="settings-grid">
      {/* Options Column */}
      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2>Options</h2>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeSdh" checked={options.removeSdh} onChange={handleChange} />
            Remove SDH
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeWatermarks" checked={options.removeWatermarks} onChange={handleChange} />
            Remove watermarks <HelpCircle className="help-icon" size={16} title="Removes lines like 'Sync by...'" />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeSpeakerLabels" checked={options.removeSpeakerLabels} onChange={handleChange} />
            Remove speaker labels
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeMusicNotes" checked={options.removeMusicNotes} onChange={handleChange} />
            Remove cues containing a music note (♪)
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeLineBreaks" checked={options.removeLineBreaks} onChange={handleChange} />
            Remove all line breaks <HelpCircle className="help-icon" size={16} title="Combines multi-line subtitles into single lines" />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="mergeCues" checked={options.mergeCues} onChange={handleChange} />
            Merge cues with the same text <HelpCircle className="help-icon" size={16} title="Combines timings if two consecutive subtitles are identical" />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="toLowerCase" checked={options.toLowerCase} onChange={handleChange} />
            Change uppercase text to lowercase <HelpCircle className="help-icon" size={16} title="Converts all text to lower case" />
          </label>
        </div>
      </div>

      {/* Remove Text Formatting Column */}
      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2>Remove text formatting</h2>
        <div className="checkbox-group">
          <label className="checkbox-label" style={{ fontWeight: 600 }}>
            <input type="checkbox" className="checkbox-input" name="removeTextFormatting" checked={options.removeTextFormatting} onChange={handleChange} />
            Remove text formatting <HelpCircle className="help-icon" size={16} title="Removes HTML tags" />
          </label>
          <div className="sub-checkboxes">
            <label className={`checkbox-label ${!options.removeTextFormatting ? 'disabled' : ''}`}>
              <input type="checkbox" className="checkbox-input" name="keepItalic" checked={options.keepItalic} onChange={handleChange} disabled={!options.removeTextFormatting} />
              Don't remove italic styling &lt;i&gt;&lt;/i&gt;
            </label>
            <label className={`checkbox-label ${!options.removeTextFormatting ? 'disabled' : ''}`}>
              <input type="checkbox" className="checkbox-input" name="keepBold" checked={options.keepBold} onChange={handleChange} disabled={!options.removeTextFormatting} />
              Don't remove bold styling &lt;b&gt;&lt;/b&gt;
            </label>
            <label className={`checkbox-label ${!options.removeTextFormatting ? 'disabled' : ''}`}>
              <input type="checkbox" className="checkbox-input" name="keepFont" checked={options.keepFont} onChange={handleChange} disabled={!options.removeTextFormatting} />
              Don't remove fonts or colored text &lt;font&gt;&lt;/font&gt;
            </label>
            <label className={`checkbox-label ${!options.removeTextFormatting ? 'disabled' : ''}`}>
              <input type="checkbox" className="checkbox-input" name="removeAngleBrackets" checked={options.removeAngleBrackets} onChange={handleChange} disabled={!options.removeTextFormatting} />
              Remove everything else between angle brackets
            </label>
          </div>
        </div>
      </div>

      {/* Remove Between Column */}
      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2>Remove between</h2>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeBetweenCurly" checked={options.removeBetweenCurly} onChange={handleChange} />
            Remove everything between curly brackets {'{ }'}
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeBetweenParens" checked={options.removeBetweenParens} onChange={handleChange} />
            Remove everything between parentheses ( )
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeBetweenSquare" checked={options.removeBetweenSquare} onChange={handleChange} />
            Remove everything between square brackets [ ]
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeBetweenAsterisks" checked={options.removeBetweenAsterisks} onChange={handleChange} />
            Remove everything between asterisks * ... *
          </label>
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" name="removeBetweenHashtags" checked={options.removeBetweenHashtags} onChange={handleChange} />
            Remove everything between hashtags # ... #
          </label>
        </div>
      </div>
    </div>
  );
}
