import React, { useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Link,
  Image, EyeIcon, Edit, Divide, Check, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const EnhancedMarkdownEditor = ({ initialValue = '', onSave, onCancel }) => {
  const [markdownContent, setMarkdownContent] = useState(initialValue);
  const [previewMode, setPreviewMode] = useState(false);
  const editorRef = useRef(null);
  
  useEffect(() => {
    if (!previewMode && editorRef.current) {
      editorRef.current.focus();
    }
  }, [previewMode]);
  
  // Function to insert formatting at cursor position
  const insertFormatting = (startChars, endChars = '') => {
    if (!editorRef.current) return;
    
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const text = markdownContent;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) 
                  + startChars 
                  + selectedText 
                  + (endChars || startChars) 
                  + text.substring(end);
    
    setMarkdownContent(newText);
    
    // Set cursor position after the operation
    setTimeout(() => {
      editorRef.current.focus();
      const newCursorPos = end + startChars.length + (endChars ? endChars.length : startChars.length);
      editorRef.current.setSelectionRange(
        selectedText ? start : newCursorPos,
        selectedText ? end + startChars.length + (endChars ? endChars.length : startChars.length) : newCursorPos
      );
    }, 0);
  };
  
  // Toolbar button actions
  const formatActions = {
    bold: () => insertFormatting('**', '**'),
    italic: () => insertFormatting('*', '*'),
    unorderedList: () => insertFormatting('- '),
    orderedList: () => insertFormatting('1. '),
    heading1: () => insertFormatting('# '),
    heading2: () => insertFormatting('## '),
    code: () => insertFormatting('`', '`'),
    codeBlock: () => insertFormatting('```\n', '\n```'),
    link: () => insertFormatting('[Link text](', ')'),
    image: () => insertFormatting('![Alt text](', ')'),
    hr: () => insertFormatting('\n---\n')
  };
  
  // Toolbar button component
  const ToolbarButton = ({ icon: Icon, action, tooltip }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => action()}
      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
      title={tooltip}
      type="button"
    >
      <Icon size={18} />
    </motion.button>
  );
  
  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center bg-gray-50 border-b border-gray-300 p-2 gap-1 flex-wrap">
        <div className="flex gap-1 mr-2">
          <ToolbarButton icon={Bold} action={formatActions.bold} tooltip="Bold (Ctrl+B)" />
          <ToolbarButton icon={Italic} action={formatActions.italic} tooltip="Italic (Ctrl+I)" />
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <div className="flex gap-1 mr-2">
          <ToolbarButton icon={Heading1} action={formatActions.heading1} tooltip="Heading 1" />
          <ToolbarButton icon={Heading2} action={formatActions.heading2} tooltip="Heading 2" />
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <div className="flex gap-1 mr-2">
          <ToolbarButton icon={List} action={formatActions.unorderedList} tooltip="Bullet List" />
          <ToolbarButton icon={ListOrdered} action={formatActions.orderedList} tooltip="Numbered List" />
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <div className="flex gap-1 mr-2">
          <ToolbarButton icon={Code} action={formatActions.code} tooltip="Inline Code" />
          <ToolbarButton icon={Link} action={formatActions.link} tooltip="Link" />
          <ToolbarButton icon={Image} action={formatActions.image} tooltip="Image" />
          <ToolbarButton icon={Divide} action={formatActions.hr} tooltip="Horizontal Rule" />
        </div>
        <div className="flex-grow"></div>
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1 px-3 py-1 rounded ${
              previewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
            }`}
            type="button"
          >
            {previewMode ? (
              <>
                <Edit size={16} />
                <span className="text-sm">Edit</span>
              </>
            ) : (
              <>
                <EyeIcon size={16} />
                <span className="text-sm">Preview</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Editor/Preview Area */}
      <div className="relative">
        {previewMode ? (
          <div className="bg-white p-4 min-h-[200px] max-h-[400px] overflow-y-auto prose prose-sm max-w-none">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={editorRef}
            className="w-full p-4 min-h-[200px] max-h-[400px] overflow-y-auto resize-none focus:outline-none"
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            placeholder="Tulis soal menggunakan Markdown..."
          />
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 p-3 bg-gray-50 border-t border-gray-300">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-1"
          type="button"
        >
          <X size={16} />
          <span>Batal</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSave(markdownContent)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
          type="button"
          disabled={!markdownContent.trim()}
        >
          <Check size={16} />
          <span>Simpan</span>
        </motion.button>
      </div>
    </div>
  );
};

export default EnhancedMarkdownEditor;