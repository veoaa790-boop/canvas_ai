// Initial default fonts
export const DEFAULT_FONTS = [
  { name: 'Arial', family: 'Arial' },
  { name: 'Roboto', family: 'Roboto' },
  { name: 'Open Sans', family: 'Open+Sans' },
  { name: 'Montserrat', family: 'Montserrat' },
  { name: 'Lato', family: 'Lato' },
  { name: 'Poppins', family: 'Poppins' },
  { name: 'Oswald', family: 'Oswald' },
  { name: 'Raleway', family: 'Raleway' },
  { name: 'Merriweather', family: 'Merriweather' },
  { name: 'Playfair Display', family: 'Playfair+Display' },
  { name: 'Nunito', family: 'Nunito' },
  { name: 'Rubik', family: 'Rubik' },
  { name: 'Ubuntu', family: 'Ubuntu' },
  { name: 'Dancing Script', family: 'Dancing+Script' },
  { name: 'Bebas Neue', family: 'Bebas+Neue' }
];

export const CANVAS_PRESETS = [
  { name: 'Custom', width: 800, height: 600 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 940, height: 788 },
  { name: 'Facebook Cover', width: 851, height: 315 },
  { name: 'A4 Document', width: 794, height: 1123 },
  { name: 'Presentation (16:9)', width: 1920, height: 1080 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
];

export const KIE_MODELS = {
  EDIT: 'google/nano-banana-edit',
  PRO: 'nano-banana-pro',
  VIDEO: 'kling-ai/sora-2'
};

// Icon Keys Registry
export const ICON_KEYS = {
  // Sidebar Main Tabs
  SIDEBAR_TEMPLATES: 'sidebar_templates',
  SIDEBAR_TEXT: 'sidebar_text',
  SIDEBAR_SHAPES: 'sidebar_shapes',
  SIDEBAR_IMAGES: 'sidebar_images',
  SIDEBAR_AI: 'sidebar_ai',
  SIDEBAR_VIDEO: 'sidebar_video',
  SIDEBAR_MAGIC: 'sidebar_magic',
  
  // Sidebar Inner Content
  SIDEBAR_TEXT_H1: 'sidebar_text_h1',
  SIDEBAR_TEXT_H2: 'sidebar_text_h2',
  SIDEBAR_TEXT_BODY: 'sidebar_text_body',
  SIDEBAR_IMAGE_UPLOAD: 'sidebar_image_upload',
  SIDEBAR_AI_GENERATE: 'sidebar_ai_generate',
  SIDEBAR_AI_MIC: 'sidebar_ai_mic',
  SIDEBAR_VIDEO_GENERATE: 'sidebar_video_generate',
  SIDEBAR_VIDEO_MIC: 'sidebar_video_mic',
  SIDEBAR_VIDEO_UPLOAD: 'sidebar_video_upload',
  SIDEBAR_VIDEO_CLEAR: 'sidebar_video_clear',
  SIDEBAR_VIDEO_ADD: 'sidebar_video_add',
  SIDEBAR_VIDEO_DOWNLOAD: 'sidebar_video_download',
  SIDEBAR_MAGIC_APPLY: 'sidebar_magic_apply',
  SIDEBAR_MAGIC_MIC: 'sidebar_magic_mic',
  
  // Toolbar
  TOOLBAR_UNDO: 'toolbar_undo',
  TOOLBAR_REDO: 'toolbar_redo',
  TOOLBAR_BOLD: 'toolbar_bold',
  TOOLBAR_ITALIC: 'toolbar_italic',
  TOOLBAR_UNDERLINE: 'toolbar_underline',
  TOOLBAR_ALIGN_LEFT: 'toolbar_align_left',
  TOOLBAR_ALIGN_CENTER: 'toolbar_align_center',
  TOOLBAR_ALIGN_RIGHT: 'toolbar_align_right',
  TOOLBAR_DELETE: 'toolbar_delete',
  TOOLBAR_DUPLICATE: 'toolbar_duplicate',
  TOOLBAR_DOWNLOAD: 'toolbar_download',
  TOOLBAR_MIC: 'toolbar_mic',
  TOOLBAR_CROP: 'toolbar_crop',
  TOOLBAR_REMOVE_BG: 'toolbar_remove_bg',
  TOOLBAR_FONT_PLUS: 'toolbar_font_plus',
  TOOLBAR_FONT_MINUS: 'toolbar_font_minus',
  TOOLBAR_SPACING: 'toolbar_spacing',
};

export const DEFAULT_MAGIC_EDIT_ICON = "https://cdn-icons-png.flaticon.com/512/2689/2689985.png";
export const DEFAULT_ICON_COLOR = "#4b5563"; // gray-600
