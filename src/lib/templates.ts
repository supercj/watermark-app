import type { WatermarkTemplate, WatermarkConfig } from '../types';

// 生成唯一 ID
export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 格式化日期
export const formatDate = (format: string = 'YYYY-MM-DD'): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

// ===== 内置边框模板（水印相机风格，可拖拽整体） =====
export const builtInTemplates: WatermarkTemplate[] = [
  {
    id: 'frame-leica',
    name: 'LEICA 经典',
    description: '徕卡风格信息块',
    category: 'frame',
    mode: 'frame',
    isBuiltIn: true,
    frameConfig: {
      id: 'fc-leica',
      layout: 'brand-left',
      anchor: 'bottom-center',
      offsetX: 0,
      offsetY: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: 12,
      borderRadius: 6,
      brandText: 'LEICA',
      brandFontSize: 20,
      brandColor: '#d40000',
      brandFontWeight: 'bold',
      showParams: true,
      paramText: '50mm  f/1.8  1/125s  ISO 100',
      paramFontSize: 12,
      paramColor: '#666666',
      showDate: true,
      dateFormat: 'YYYY-MM-DD HH:mm',
      dateColor: '#999999',
      dateFontSize: 11,
      showDivider: true,
      dividerColor: '#e0e0e0',
    },
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'frame-sony',
    name: 'SONY α',
    description: '索尼微单风格',
    category: 'frame',
    mode: 'frame',
    isBuiltIn: true,
    frameConfig: {
      id: 'fc-sony',
      layout: 'brand-left',
      anchor: 'bottom-center',
      offsetX: 0,
      offsetY: 20,
      backgroundColor: 'rgba(0,0,0,0.85)',
      padding: 12,
      borderRadius: 6,
      brandText: 'SONY',
      brandFontSize: 18,
      brandColor: '#ffffff',
      brandFontWeight: 'bold',
      showParams: true,
      paramText: '35mm  f/2.8  1/250s  ISO 200',
      paramFontSize: 12,
      paramColor: '#aaaaaa',
      showDate: true,
      dateFormat: 'YYYY/MM/DD',
      dateColor: '#888888',
      dateFontSize: 11,
      showDivider: true,
      dividerColor: '#444444',
    },
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'frame-fujifilm',
    name: 'FUJIFILM',
    description: '富士胶片风格',
    category: 'frame',
    mode: 'frame',
    isBuiltIn: true,
    frameConfig: {
      id: 'fc-fuji',
      layout: 'brand-center',
      anchor: 'bottom-center',
      offsetX: 0,
      offsetY: 20,
      backgroundColor: 'rgba(245,245,240,0.92)',
      padding: 14,
      borderRadius: 8,
      brandText: 'FUJIFILM',
      brandFontSize: 16,
      brandColor: '#1a5c2a',
      brandFontWeight: 'bold',
      showParams: true,
      paramText: '23mm  f/2.0  1/60s  ISO 400',
      paramFontSize: 11,
      paramColor: '#555555',
      showDate: true,
      dateFormat: 'YYYY.MM.DD',
      dateColor: '#888888',
      dateFontSize: 10,
      showDivider: false,
      dividerColor: '#dddddd',
    },
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'frame-canon',
    name: 'Canon',
    description: '佳能红圈风格',
    category: 'frame',
    mode: 'frame',
    isBuiltIn: true,
    frameConfig: {
      id: 'fc-canon',
      layout: 'brand-left',
      anchor: 'bottom-center',
      offsetX: 0,
      offsetY: 20,
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: 12,
      borderRadius: 6,
      brandText: 'Canon',
      brandFontSize: 18,
      brandColor: '#cc0000',
      brandFontWeight: 'bold',
      showParams: true,
      paramText: '85mm  f/1.4  1/200s  ISO 100',
      paramFontSize: 12,
      paramColor: '#555555',
      showDate: true,
      dateFormat: 'YYYY-MM-DD',
      dateColor: '#999999',
      dateFontSize: 11,
      showDivider: true,
      dividerColor: '#eeeeee',
    },
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'frame-iphone',
    name: 'Shot on iPhone',
    description: 'iPhone 拍摄风格',
    category: 'frame',
    mode: 'frame',
    isBuiltIn: true,
    frameConfig: {
      id: 'fc-iphone',
      layout: 'brand-center',
      anchor: 'bottom-center',
      offsetX: 0,
      offsetY: 20,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 10,
      borderRadius: 20,
      brandText: 'Shot on iPhone',
      brandFontSize: 14,
      brandColor: '#ffffff',
      brandFontWeight: 'normal',
      showParams: false,
      paramText: '',
      paramFontSize: 11,
      paramColor: '#aaaaaa',
      showDate: true,
      dateFormat: 'YYYY-MM-DD HH:mm',
      dateColor: '#888888',
      dateFontSize: 10,
      showDivider: false,
      dividerColor: '#333333',
    },
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'frame-minimal',
    name: '极简信息',
    description: '极简日期参数',
    category: 'frame',
    mode: 'frame',
    isBuiltIn: true,
    frameConfig: {
      id: 'fc-minimal',
      layout: 'minimal',
      anchor: 'bottom-right',
      offsetX: 20,
      offsetY: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 8,
      borderRadius: 4,
      brandText: '',
      brandFontSize: 12,
      brandColor: '#ffffff',
      brandFontWeight: 'normal',
      showParams: true,
      paramText: '50mm f/1.8',
      paramFontSize: 11,
      paramColor: '#dddddd',
      showDate: true,
      dateFormat: 'YYYY.MM.DD',
      dateColor: '#aaaaaa',
      dateFontSize: 10,
      showDivider: false,
      dividerColor: '#555555',
    },
    createdAt: 0,
    updatedAt: 0,
  },
  // 叠加水印模板
  {
    id: 'overlay-diagonal',
    name: '对角线水印',
    description: '居中大字防盗',
    category: 'overlay',
    mode: 'overlay',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-diagonal',
        type: 'text',
        text: '仅供预览',
        anchor: 'center',
        offsetX: 0,
        offsetY: 0,
        fontSize: 60,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#ffffff',
        width: 300,
        height: 75,
        opacity: 0.3,
        rotation: -30,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'overlay-copyright',
    name: '版权声明',
    description: '右下角版权文字',
    category: 'overlay',
    mode: 'overlay',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-copyright',
        type: 'text',
        text: '© 版权所有 禁止转载',
        anchor: 'bottom-right',
        offsetX: 30,
        offsetY: 30,
        fontSize: 18,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        width: 200,
        height: 22,
        opacity: 0.7,
        rotation: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
];

// 模板变量处理
export const processTemplateVariables = (text: string): string => {
  return text
    .replace(/\{\{date\}\}/g, formatDate('YYYY-MM-DD'))
    .replace(/\{\{datetime\}\}/g, formatDate('YYYY-MM-DD HH:mm'))
    .replace(/\{\{time\}\}/g, formatDate('HH:mm'));
};

// 处理叠加水印模板
export const processWatermarks = (watermarks: WatermarkConfig[]): WatermarkConfig[] => {
  return watermarks.map((wm) => ({
    ...wm,
    id: generateId(),
    text: wm.text ? processTemplateVariables(wm.text) : undefined,
  }));
};

// 本地存储
const CUSTOM_TEMPLATES_KEY = 'watermark-custom-templates';

export const loadCustomTemplates = (): WatermarkTemplate[] => {
  try {
    const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveCustomTemplate = (template: WatermarkTemplate): void => {
  const existing = loadCustomTemplates();
  const updated = [...existing.filter((t) => t.id !== template.id), template];
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
};

export const deleteCustomTemplate = (id: string): void => {
  const existing = loadCustomTemplates();
  const updated = existing.filter((t) => t.id !== id);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
};

export const getAllTemplates = (): WatermarkTemplate[] => {
  return [...builtInTemplates, ...loadCustomTemplates()];
};

export const categoryNames: Record<string, string> = {
  frame: '边框模板',
  overlay: '叠加水印',
  custom: '自定义',
};
