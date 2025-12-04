import { fabric } from 'fabric';

export interface EditorState {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  zoom: number;
  history: string[];
  historyIndex: number;
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  json: string; // Fabric JSON
}

export interface Layer {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  locked: boolean;
  object: fabric.Object;
}

export interface Font {
  name: string;
  family: string; // Used for Google Fonts URL construction (e.g., "Open+Sans")
}

export type ToolType = 'select' | 'shapes' | 'text' | 'images' | 'background' | 'templates';
