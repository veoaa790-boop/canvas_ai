import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EditorProvider } from './context/EditorContext';
import { Editor } from './components/Editor/Editor';
import { AdminDashboard } from './components/Admin/AdminDashboard';

function App() {
  return (
    <EditorProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </EditorProvider>
  );
}

export default App;
