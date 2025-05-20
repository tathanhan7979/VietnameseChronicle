import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { advancedQuillModules, advancedQuillFormats, quillCustomStyles } from '@/lib/quill-config';

// Import image resize module and register it properly
import ImageResize from 'quill-image-resize-module-react';

// Check if we're in browser environment before registering the module
if (typeof window !== 'undefined') {
  // Use dynamic import for Quill to avoid SSR issues
  const Quill = ReactQuill.Quill;
  if (Quill) {
    Quill.register('modules/imageResize', ImageResize);
  }
}

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

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  height,
  label,
  required = false,
  error,
  className = "",
  style = {},
}) => {
  const [editorValue, setEditorValue] = useState(value || '');

  // Đồng bộ giá trị từ props
  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  // Xử lý thay đổi
  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  // Kết hợp styles
  const containerStyle = {
    ...quillCustomStyles.container,
    height: height || quillCustomStyles.container.height,
    ...style,
  };

  // Tính toán chiều cao của editor dựa trên container
  const editorHeight = typeof containerStyle.height === 'number' 
    ? (containerStyle.height as number) - 42 // Trừ đi chiều cao của toolbar
    : '350px';

  // Custom CSS cho editor
  const editorStyle = {
    ...quillCustomStyles.editor,
    height: editorHeight,
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
          modules={advancedQuillModules}
          formats={advancedQuillFormats}
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