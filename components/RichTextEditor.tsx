import React, { useRef, useEffect, useState } from 'react';
import Icon from './Icon';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Execute formatting commands
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  // Format as heading
  const formatHeading = (level: string) => {
    executeCommand('formatBlock', level);
  };

  // Insert horizontal rule
  const insertHR = () => {
    executeCommand('insertHorizontalRule');
  };

  // Insert unordered list
  const insertList = (type: 'ul' | 'ol') => {
    if (type === 'ul') {
      executeCommand('insertUnorderedList');
    } else {
      executeCommand('insertOrderedList');
    }
  };

  // Toolbar button component
  const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    isActive?: boolean;
  }> = ({ onClick, icon, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {icon}
    </button>
  );

  // Dropdown component for headings
  const HeadingDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
          title="Headings"
        >
          <span className="text-sm font-medium">H</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10 min-w-[120px]">
            <button
              type="button"
              onClick={() => {
                formatHeading('p');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => {
                formatHeading('h1');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Heading 1
            </button>
            <button
              type="button"
              onClick={() => {
                formatHeading('h2');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Heading 2
            </button>
            <button
              type="button"
              onClick={() => {
                formatHeading('h3');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Heading 3
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 p-2">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => executeCommand('bold')}
              icon={<span className="font-bold text-sm">B</span>}
              title="Bold (Ctrl+B)"
            />
            <ToolbarButton
              onClick={() => executeCommand('italic')}
              icon={<span className="italic text-sm">I</span>}
              title="Italic (Ctrl+I)"
            />
            <ToolbarButton
              onClick={() => executeCommand('underline')}
              icon={<span className="underline text-sm">U</span>}
              title="Underline (Ctrl+U)"
            />
            <ToolbarButton
              onClick={() => executeCommand('strikeThrough')}
              icon={<span className="line-through text-sm">S</span>}
              title="Strikethrough"
            />
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2 mr-2">
            <HeadingDropdown />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => executeCommand('justifyLeft')}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              }
              title="Align Left"
            />
            <ToolbarButton
              onClick={() => executeCommand('justifyCenter')}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm-2 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              }
              title="Align Center"
            />
            <ToolbarButton
              onClick={() => executeCommand('justifyRight')}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-6 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              }
              title="Align Right"
            />
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2 mr-2">
            <ToolbarButton
              onClick={() => insertList('ul')}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 100 2h.01a1 1 0 100-2H3zM6 4a1 1 0 011-1h9a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H7a1 1 0 01-1-1zM3 8a1 1 0 100 2h.01a1 1 0 100-2H3zm0 4a1 1 0 100 2h.01a1 1 0 100-2H3z" clipRule="evenodd" />
                </svg>
              }
              title="Bullet List"
            />
            <ToolbarButton
              onClick={() => insertList('ol')}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
              title="Numbered List"
            />
          </div>

          {/* Links and Media */}
          <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2 mr-2">
            <ToolbarButton
              onClick={insertLink}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              }
              title="Insert Link"
            />
            <ToolbarButton
              onClick={insertImage}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              }
              title="Insert Image"
            />
          </div>

          {/* Miscellaneous */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={insertHR}
              icon={<span className="text-xs font-bold">HR</span>}
              title="Horizontal Rule"
            />
            <ToolbarButton
              onClick={() => executeCommand('removeFormat')}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              }
              title="Clear Formatting"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        className={`min-h-[300px] p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none prose prose-slate dark:prose-invert max-w-none ${
          !value && !isEditorFocused ? 'text-slate-400' : ''
        }`}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        suppressContentEditableWarning={true}
      />

      {/* Placeholder */}
      {!value && !isEditorFocused && (
        <div className="absolute top-[60px] left-4 text-slate-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;