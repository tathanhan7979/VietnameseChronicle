/**
 * Cấu hình nâng cao cho trình soạn thảo ReactQuill
 */

// Định nghĩa cấu hình cơ bản cho thanh công cụ Quill
export const advancedQuillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
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

// Cấu hình các kiểu định dạng được hỗ trợ
export const advancedQuillFormats = [
  'header', 'font', 'size', 
  'bold', 'italic', 'underline', 'strike', 
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'direction', 'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

// Cấu hình tùy chỉnh CSS cho container của ReactQuill
export const quillCustomStyles = {
  container: {
    height: '400px', // Điều chỉnh chiều cao mặc định
  },
  editor: {
    height: '350px', 
    overflow: 'auto',
    fontSize: '16px',
    lineHeight: '1.5',
  }
};