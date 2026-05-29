// 水印类型
export interface WatermarkConfig {
  id: string;
  type: 'text' | 'image';
  // 文字内容（文字水印）
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  // 图片路径（图片水印）
  imagePath?: string;
  // 通用属性
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

// 模板分类
export type TemplateCategory = 'basic' | 'date' | 'location' | 'copyright' | 'custom';

// 水印模板
export interface WatermarkTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  watermarks: WatermarkConfig[];
  // 预览图（base64 或 URL）
  preview?: string;
  // 是否为内置模板
  isBuiltIn?: boolean;
  createdAt: number;
  updatedAt: number;
}

// 待处理的图片
export interface ImageItem {
  id: string;
  path: string;
  name: string;
  preview?: string;
  width?: number;
  height?: number;
}

// 导出设置
export interface ExportSettings {
  format: 'jpg' | 'png' | 'webp';
  quality: number; // 1-100
  outputFolder: string;
  preserveOriginal: boolean;
}

// 应用状态
export interface AppState {
  images: ImageItem[];
  currentImageIndex: number;
  watermarkTemplate: WatermarkTemplate | null;
  exportSettings: ExportSettings;
}
