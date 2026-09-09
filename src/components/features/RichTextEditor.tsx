import { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Image, Code,
  Heading1, Heading2, Palette, RotateCcw, RotateCw, Type,
  Scissors, Copy, Clipboard, Highlighter, Quote, Minus
} from 'lucide-react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
const FONT_FAMILIES = ['Inter', 'Georgia', 'Courier New', 'Arial', 'Verdana', 'Times New Roman'];
const TEXT_COLORS = ['#ffffff', '#a78bfa', '#06b6d4', '#4ade80', '#fbbf24', '#f87171', '#fb923c', '#e879f9', '#818cf8'];
const BG_COLORS = ['transparent', 'rgba(139,92,246,0.3)', 'rgba(6,182,212,0.3)', 'rgba(74,222,128,0.3)', 'rgba(251,191,36,0.3)', 'rgba(248,113,113,0.3)'];

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

const Btn = ({ onClick, active, title, children }: ToolbarBtnProps) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-1.5 rounded transition-all min-w-[28px] min-h-[28px] flex items-center justify-center ${
      active ? 'bg-purple-500/40 text-purple-200' : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-white/10 mx-0.5 flex-shrink-0" />;

const RichTextEditor = ({ value = '', onChange, placeholder = 'Start writing...', minHeight = '180px' }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleChange();
  };

  const handleChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const isActive = (cmd: string) => document.queryCommandState(cmd);

  const insertLink = () => {
    if (!linkUrl) return;
    let url = linkUrl;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    exec('createLink', url);
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const insertHR = () => exec('insertHorizontalRule');
  const insertBlockquote = () => exec('formatBlock', 'blockquote');

  const applyFontSize = (size: string) => {
    setFontSize(size);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      exec('fontSize', '7');
      const spans = editorRef.current?.querySelectorAll('font[size="7"]');
      spans?.forEach(span => {
        const s = span as HTMLElement;
        s.removeAttribute('size');
        s.style.fontSize = size;
      });
    }
  };

  const applyFontFamily = (family: string) => {
    setFontFamily(family);
    exec('fontName', family);
  };

  return (
    <div className="flex flex-col glass rounded-xl overflow-hidden border border-white/10">
      {/* Toolbar row 1 */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-white/10 bg-black/20">
        <Btn onClick={() => exec('undo')} title="Undo"><RotateCcw size={11} /></Btn>
        <Btn onClick={() => exec('redo')} title="Redo"><RotateCw size={11} /></Btn>
        <Divider />
        <Btn onClick={() => exec('bold')} active={isActive('bold')} title="Bold"><Bold size={11} /></Btn>
        <Btn onClick={() => exec('italic')} active={isActive('italic')} title="Italic"><Italic size={11} /></Btn>
        <Btn onClick={() => exec('underline')} active={isActive('underline')} title="Underline"><Underline size={11} /></Btn>
        <Btn onClick={() => exec('strikeThrough')} active={isActive('strikeThrough')} title="Strikethrough"><Strikethrough size={11} /></Btn>
        <Divider />
        <Btn onClick={() => exec('formatBlock', 'h1')} title="Heading 1"><Heading1 size={11} /></Btn>
        <Btn onClick={() => exec('formatBlock', 'h2')} title="Heading 2"><Heading2 size={11} /></Btn>
        <Btn onClick={() => exec('formatBlock', 'p')} title="Paragraph"><Type size={11} /></Btn>
        <Divider />
        <Btn onClick={() => exec('justifyLeft')} title="Align Left"><AlignLeft size={11} /></Btn>
        <Btn onClick={() => exec('justifyCenter')} title="Center"><AlignCenter size={11} /></Btn>
        <Btn onClick={() => exec('justifyRight')} title="Align Right"><AlignRight size={11} /></Btn>
      </div>

      {/* Toolbar row 2 */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-white/10 bg-black/20">
        <Btn onClick={() => exec('insertUnorderedList')} title="Bullet List"><List size={11} /></Btn>
        <Btn onClick={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered size={11} /></Btn>
        <Btn onClick={insertBlockquote} title="Blockquote"><Quote size={11} /></Btn>
        <Btn onClick={() => exec('formatBlock', 'pre')} title="Code Block"><Code size={11} /></Btn>
        <Btn onClick={insertHR} title="Horizontal Rule"><Minus size={11} /></Btn>
        <Divider />
        <Btn onClick={() => setShowLinkDialog(l => !l)} title="Insert Link"><Link2 size={11} /></Btn>
        <Divider />

        {/* Text color */}
        <div className="relative">
          <Btn onClick={() => { setShowColorPicker(c => !c); setShowBgPicker(false); }} title="Text Color">
            <Palette size={11} />
          </Btn>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 glass rounded-lg p-2 flex flex-wrap gap-1 w-36 z-20">
              {TEXT_COLORS.map(c => (
                <button
                  key={c}
                  onMouseDown={e => { e.preventDefault(); exec('foreColor', c); setShowColorPicker(false); }}
                  className="w-5 h-5 rounded border border-white/20 hover:scale-110 transition-transform"
                  style={{ background: c === 'transparent' ? 'none' : c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <Btn onClick={() => { setShowBgPicker(b => !b); setShowColorPicker(false); }} title="Highlight">
            <Highlighter size={11} />
          </Btn>
          {showBgPicker && (
            <div className="absolute top-full left-0 mt-1 glass rounded-lg p-2 flex flex-wrap gap-1 w-36 z-20">
              {BG_COLORS.map((c, i) => (
                <button
                  key={i}
                  onMouseDown={e => { e.preventDefault(); exec('hiliteColor', c); setShowBgPicker(false); }}
                  className="w-5 h-5 rounded border border-white/20 hover:scale-110 transition-transform"
                  style={{ background: c === 'transparent' ? 'rgba(255,255,255,0.05)' : c }}
                  title={i === 0 ? 'None' : 'Highlight'}
                />
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Font size */}
        <select
          value={fontSize}
          onChange={e => applyFontSize(e.target.value)}
          className="bg-white/5 border border-white/10 rounded text-[10px] text-white/70 px-1 py-1 outline-none w-14"
        >
          {FONT_SIZES.map(s => <option key={s} value={s} className="bg-[#1a1a2e]">{s}</option>)}
        </select>

        {/* Font family */}
        <select
          value={fontFamily}
          onChange={e => applyFontFamily(e.target.value)}
          className="bg-white/5 border border-white/10 rounded text-[10px] text-white/70 px-1 py-1 outline-none w-20"
        >
          {FONT_FAMILIES.map(f => <option key={f} value={f} className="bg-[#1a1a2e]">{f}</option>)}
        </select>
      </div>

      {/* Link dialog */}
      {showLinkDialog && (
        <div className="flex gap-2 p-2 border-b border-white/10 bg-black/20 fade-in">
          <input
            type="text"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertLink()}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-white/30 outline-none"
          />
          <button onClick={insertLink} className="text-xs bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 px-2 py-1 rounded">Insert</button>
          <button onClick={() => setShowLinkDialog(false)} className="text-xs bg-white/5 hover:bg-white/10 text-white/50 px-2 py-1 rounded">Cancel</button>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        data-placeholder={placeholder}
        style={{ minHeight, fontFamily }}
        className="flex-1 p-3 text-sm text-white/90 outline-none overflow-y-auto leading-relaxed rich-editor"
      />

      {/* Rich editor styles */}
      <style>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.25);
          pointer-events: none;
        }
        .rich-editor h1 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; color: #a78bfa; }
        .rich-editor h2 { font-size: 1.25em; font-weight: 600; margin: 0.4em 0; color: #c4b5fd; }
        .rich-editor p { margin: 0.3em 0; }
        .rich-editor ul { list-style: disc; padding-left: 1.5em; }
        .rich-editor ol { list-style: decimal; padding-left: 1.5em; }
        .rich-editor blockquote { border-left: 3px solid #8b5cf6; padding-left: 0.75em; color: rgba(255,255,255,0.5); font-style: italic; margin: 0.5em 0; }
        .rich-editor pre { background: rgba(0,0,0,0.4); border-radius: 6px; padding: 8px 12px; font-family: 'Courier New', monospace; font-size: 0.85em; color: #4ade80; overflow-x: auto; }
        .rich-editor a { color: #06b6d4; text-decoration: underline; }
        .rich-editor hr { border: none; border-top: 1px solid rgba(255,255,255,0.15); margin: 0.75em 0; }
        .rich-editor b, .rich-editor strong { font-weight: 700; }
        .rich-editor i, .rich-editor em { font-style: italic; }
        .rich-editor u { text-decoration: underline; }
        .rich-editor s { text-decoration: line-through; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
