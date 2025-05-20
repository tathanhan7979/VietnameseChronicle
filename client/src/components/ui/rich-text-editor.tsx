import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number | string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
  uploadPath?: string;
}

// Simple toolbar configuration without custom modules
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

// Formats to enable
const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'direction', 'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  height = 400,
  label,
  required = false,
  error,
  className = "",
  style = {},
}) => {
  const [editorValue, setEditorValue] = useState(value || '');

  // Sync value from props
  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  // Handle changes
  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  // Container style
  const containerStyle = {
    height,
    ...style,
  };

  // Editor style
  const editorStyle = {
    height: typeof height === 'number' ? (height as number) - 42 : '350px',
    overflow: 'auto',
    fontSize: '16px',
    lineHeight: '1.5',
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {label && (
        <div className="text-sm font-medium mb-2 flex items-center">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </div>
      )}
      <div 
        className={`border rounded-md overflow-hidden ${error ? 'border-destructive' : 'border-input'}`} 
        style={containerStyle}
      >
        <ReactQuill
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={editorStyle}
        />
      </div>
      {error && (
        <div className="text-sm font-medium text-destructive mt-1">{error}</div>
      )}
    </div>
  );
};

export default RichTextEditor;
export { RichTextEditor };