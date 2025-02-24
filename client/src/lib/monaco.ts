import { loader } from '@monaco-editor/react';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs'
  }
});

export const editorOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  occurrencesHighlight: false,
  cursorStyle: 'line',
  automaticLayout: true,
  tabSize: 2,
  formatOnType: true,
  formatOnPaste: true
};
