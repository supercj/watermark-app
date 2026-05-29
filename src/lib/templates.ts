import type { WatermarkTemplate, WatermarkConfig } from '../types';

// 生成唯一 ID
export const generateId = (): string => 
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 格式化日期
const formatDate = (format: string = 'YYYY-MM-DD'): string => {
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

// 内置模板
export const builtInTemplates: WatermarkTemplate[] = [
  {
    id: 'builtin-simple-text',
    name: '简单文字',
    description: '右下角文字水印',
    category: 'basic',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-simple-text',
        type: 'text',
        text: '水印文字',
        fontSize: 24,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 650,
        y: 550,
        width: 100,
        height: 30,
        opacity: 0.7,
        rotation: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-date-bottom',
    name: '日期水印',
    description: '显示当前日期（右下角）',
    category: 'date',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-date-main',
        type: 'text',
        text: '{{date}}',
        fontSize: 20,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 620,
        y: 560,
        width: 160,
        height: 25,
        opacity: 0.8,
        rotation: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-datetime',
    name: '日期时间',
    description: '显示完整的日期和时间',
    category: 'date',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-datetime-main',
        type: 'text',
        text: '{{datetime}}',
        fontSize: 18,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 580,
        y: 565,
        width: 200,
        height: 22,
        opacity: 0.75,
        rotation: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-copyright',
    name: '版权声明',
    description: '版权所有水印',
    category: 'copyright',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-copyright-symbol',
        type: 'text',
        text: '©',
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 30,
        y: 540,
        width: 40,
        height: 40,
        opacity: 0.8,
        rotation: 0,
      },
      {
        id: 'wm-copyright-text',
        type: 'text',
        text: '版权所有 禁止转载',
        fontSize: 16,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 70,
        y: 555,
        width: 150,
        height: 20,
        opacity: 0.8,
        rotation: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-diagonal',
    name: '对角线水印',
    description: '大字对角线文字水印',
    category: 'basic',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-diagonal-main',
        type: 'text',
        text: '仅供预览',
        fontSize: 60,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 250,
        y: 300,
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
    id: 'builtin-location',
    name: '地点标记',
    description: '显示拍摄地点',
    category: 'location',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-location-icon',
        type: 'text',
        text: '📍',
        fontSize: 24,
        fontFamily: 'Segoe UI Emoji',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 30,
        y: 545,
        width: 30,
        height: 30,
        opacity: 0.9,
        rotation: 0,
      },
      {
        id: 'wm-location-text',
        type: 'text',
        text: '{{location}}',
        fontSize: 18,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 60,
        y: 552,
        width: 150,
        height: 22,
        opacity: 0.85,
        rotation: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'builtin-author',
    name: '作者署名',
    description: '左下角作者署名',
    category: 'copyright',
    isBuiltIn: true,
    watermarks: [
      {
        id: 'wm-author-label',
        type: 'text',
        text: '摄影：',
        fontSize: 14,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#aaaaaa',
        x: 30,
        y: 560,
        width: 50,
        height: 18,
        opacity: 0.9,
        rotation: 0,
      },
      {
        id: 'wm-author-name',
        type: 'text',
        text: '{{author}}',
        fontSize: 18,
        fontFamily: 'Microsoft YaHei',
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#ffffff',
        x: 75,
        y: 553,
        width: 100,
        height: 22,
        opacity: 0.9,
        rotation: 0,
      },
    ],
    createdAt: 0,
    updatedAt: 0,
  },
];

// 模板变量处理器
export const processTemplateVariables = (text: string): string => {
  const now = new Date();
  
  return text
    .replace(/\{\{date\}\}/g, formatDate('YYYY-MM-DD'))
    .replace(/\{\{datetime\}\}/g, formatDate('YYYY-MM-DD HH:mm'))
    .replace(/\{\{time\}\}/g, formatDate('HH:mm'))
    .replace(/\{\{year\}\}/g, String(now.getFullYear()))
    .replace(/\{\{month\}\}/g, String(now.getMonth() + 1).padStart(2, '0'))
    .replace(/\{\{day\}\}/g, String(now.getDate()).padStart(2, '0'))
    .replace(/\{\{location\}\}/g, '未知地点')
    .replace(/\{\{author\}\}/g, '作者');
};

// 处理模板中的水印配置
export const processWatermarks = (watermarks: WatermarkConfig[]): WatermarkConfig[] => {
  return watermarks.map((wm) => ({
    ...wm,
    id: generateId(), // 生成新的 ID
    text: wm.text ? processTemplateVariables(wm.text) : undefined,
  }));
};

// 本地存储 key
const CUSTOM_TEMPLATES_KEY = 'watermark-custom-templates';

// 加载自定义模板
export const loadCustomTemplates = (): WatermarkTemplate[] => {
  try {
    const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// 保存自定义模板
export const saveCustomTemplate = (template: WatermarkTemplate): void => {
  const existing = loadCustomTemplates();
  const updated = [...existing.filter(t => t.id !== template.id), template];
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
};

// 删除自定义模板
export const deleteCustomTemplate = (id: string): void => {
  const existing = loadCustomTemplates();
  const updated = existing.filter(t => t.id !== id);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
};

// 获取所有模板（内置 + 自定义）
export const getAllTemplates = (): WatermarkTemplate[] => {
  return [...builtInTemplates, ...loadCustomTemplates()];
};

// 按分类获取模板
export const getTemplatesByCategory = (category: WatermarkTemplate['category']): WatermarkTemplate[] => {
  return getAllTemplates().filter(t => t.category === category);
};

// 分类名称映射
export const categoryNames: Record<WatermarkTemplate['category'], string> = {
  basic: '基础模板',
  date: '日期时间',
  location: '位置信息',
  copyright: '版权声明',
  custom: '我的模板',
};

// 分类图标
export const categoryIcons: Record<WatermarkTemplate['category'], string> = {
  basic: '📝',
  date: '📅',
  location: '📍',
  copyright: '©️',
  custom: '⭐',
};
