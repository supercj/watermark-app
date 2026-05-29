// 位置锚点（九宫格）
export type AnchorPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

// 水印类型
export interface WatermarkConfig {
  id: string;
  type: 'text' | 'image';
  // 位置：锚点 + 偏移
  anchor: AnchorPosition;
  offsetX: number;
  offsetY: number;
  // 文字内容
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  // 图片路径
  imagePath?: string;
  // 通用属性
  width: number;
  height: number;
  opacity: number;
  rotation: number;
}

// 边框信息栏模板的布局方式
export type FrameLayout = 'brand-left' | 'brand-center' | 'minimal' | 'magazine';

// 边框信息栏配置（作为可拖拽的组合块）
export interface FrameConfig {
  id: string;
  layout: FrameLayout;
  // 位置（整体可拖拽）
  anchor: AnchorPosition;
  offsetX: number;
  offsetY: number;
  // 外观
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  // 品牌信息
  brandText: string;
  brandFontSize: number;
  brandColor: string;
  brandFontWeight: 'normal' | 'bold';
  // 拍摄参数
  showParams: boolean;
  paramText: string;
  paramFontSize: number;
  paramColor: string;
  // 日期
  showDate: boolean;
  dateFormat: string;
  dateColor: string;
  dateFontSize: number;
  // 分隔线
  showDivider: boolean;
  dividerColor: string;
}

// 模板分类
export type TemplateCategory = 'frame' | 'overlay' | 'custom';

// 水印模板（支持两种模式：边框模板 和 叠加水印模板）
export interface WatermarkTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  // 模板类型
  mode: 'frame' | 'overlay';
  // 边框模式的配置
  frameConfig?: FrameConfig;
  // 叠加模式的水印列表
  watermarks?: WatermarkConfig[];
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
  quality: number;
  outputFolder: string;
  preserveOriginal: boolean;
}

// 移动端底部 Tab
export type MobileTab = 'images' | 'watermark' | 'export';
