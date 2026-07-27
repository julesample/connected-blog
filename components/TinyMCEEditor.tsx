import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  disabled?: boolean;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  height = 400,
  className = "",
  disabled = false
}) => {
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className={className}>
      <Editor
        apiKey="no-api-key" // Using free version without API key
        value={value}
        onEditorChange={handleEditorChange}
        disabled={disabled}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic underline strikethrough | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link image media | emoticons charmap | ' +
            'preview code fullscreen | help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              color: #334155;
            }
            .dark body {
              color: #e2e8f0;
              background-color: #1e293b;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #1e293b;
              font-weight: 600;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
              color: #f8fafc;
            }
            p {
              margin-bottom: 1em;
            }
            a {
              color: #2563eb;
              text-decoration: underline;
            }
            .dark a {
              color: #60a5fa;
            }
            blockquote {
              border-left: 4px solid #e5e7eb;
              margin: 1.5em 0;
              padding-left: 1em;
              font-style: italic;
            }
            .dark blockquote {
              border-left-color: #4b5563;
            }
            code {
              background-color: #f1f5f9;
              padding: 0.2em 0.4em;
              border-radius: 0.25rem;
              font-size: 0.875em;
            }
            .dark code {
              background-color: #374151;
            }
            pre {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 0.375rem;
              padding: 1rem;
              overflow-x: auto;
            }
            .dark pre {
              background-color: #1f2937;
              border-color: #374151;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 0.375rem;
              margin: 1em 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            table, th, td {
              border: 1px solid #e5e7eb;
            }
            .dark table, .dark th, .dark td {
              border-color: #4b5563;
            }
            th, td {
              padding: 0.75rem;
              text-align: left;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .dark th {
              background-color: #374151;
            }
          `,
          placeholder,
          skin: 'oxide',
          content_css: 'default',
          branding: false,
          promotion: false,
          resize: true,
          statusbar: true,
          elementpath: false,
          block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
          link_default_target: '_blank',
          link_assume_external_targets: true,
          image_advtab: true,
          image_caption: true,
          image_title: true,
          automatic_uploads: false,
          file_picker_types: 'image',
          file_picker_callback: (callback: any, value: any, meta: any) => {
            if (meta.filetype === 'image') {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.onchange = function() {
                const file = (this as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = function() {
                    callback(reader.result, { alt: file.name });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }
          },
          setup: (editor: any) => {
            // Apply dark mode styles if needed
            editor.on('init', () => {
              const isDark = document.documentElement.classList.contains('dark');
              if (isDark) {
                editor.getContainer().classList.add('dark');
              }
            });
            
            // Listen for theme changes
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                  const isDark = document.documentElement.classList.contains('dark');
                  const container = editor.getContainer();
                  if (isDark) {
                    container.classList.add('dark');
                  } else {
                    container.classList.remove('dark');
                  }
                }
              });
            });
            
            observer.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['class']
            });
          }
        }}
      />
    </div>
  );
};

export default TinyMCEEditor;