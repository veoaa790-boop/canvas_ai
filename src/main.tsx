import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { fabric } from 'fabric';
import App from './App.tsx';
import './index.css';

// --- Fabric.js Patch ---
// Fixes "Cannot read properties of undefined" errors during serialization and text editing
// by ensuring 'styles' property exists on IText objects before critical methods run.
if (fabric.IText) {
  const originalToObject = fabric.IText.prototype.toObject;
  // @ts-ignore
  fabric.IText.prototype.toObject = function(propertiesToInclude) {
    if (!this.styles) {
      this.styles = {};
    }
    return originalToObject.call(this, propertiesToInclude);
  };

  // Fix for "reading '0'" error during text input/deletion
  const originalRemoveStyleFromTo = fabric.IText.prototype.removeStyleFromTo;
  // @ts-ignore
  fabric.IText.prototype.removeStyleFromTo = function(start, end) {
    if (!this.styles) {
      this.styles = {};
    }
    return originalRemoveStyleFromTo.call(this, start, end);
  };

  // Fix for text insertion
  const originalInsertChars = fabric.IText.prototype.insertChars;
  // @ts-ignore
  fabric.IText.prototype.insertChars = function(chars, useCopiedStyle, start, end) {
    if (!this.styles) {
      this.styles = {};
    }
    return originalInsertChars.call(this, chars, useCopiedStyle, start, end);
  };
}
// -----------------------

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
