import { useState, useCallback, useEffect } from 'react';
import { electronAPI } from '../lib/electron-api';
import {
  getAllTemplates,
  loadCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  processWatermarks,
  categoryNames,
  categoryIcons,
  generateId,
} from '../lib/templates';
import type { WatermarkConfig, WatermarkTemplate, TemplateCategory } from '../types';

interface Props {
  watermarks: WatermarkConfig[];
  onWatermarksChange: (watermarks: WatermarkConfig[]) => void;
}

// 可用字体列表
const FONTS = [
  'Microsoft YaHei',
  'SimHei',
  'SimSun',
  'KaiTi',
  'FangSong',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
];

export function WatermarkPanel({ watermarks, onWatermarksChange }: Props) {
  // 当前选中的分类
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('basic');
  
  // 模板列表
  const [templates, setTemplates] = useState<WatermarkTemplate[]>([]);
  
  // 文字水印状态
  const [textValue, setTextValue] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Microsoft YaHei');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [color, setColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(0.8);

  // 图片水印状态
  const [imageOpacity, setImageOpacity] = useState(0.8);

  // 保存模板对话框
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  // 加载模板
  useEffect(() => {
    setTemplates(getAllTemplates());
  }, []);

  // 按分类筛选模板
  const filteredTemplates = templates.filter((t) => t.category === activeCategory);

  // 应用模板
  const handleApplyTemplate = useCallback((template: WatermarkTemplate) => {
    const processed = processWatermarks(template.watermarks);
    onWatermarksChange(processed);
  }, [onWatermarksChange]);

  // 清空水印
  const handleClearWatermarks = useCallback(() => {
    onWatermarksChange([]);
  }, [onWatermarksChange]);

  // 添加文字水印
  const handleAddText = useCallback(() => {
    if (!textValue.trim()) return;

    const newWatermark: WatermarkConfig = {
      id: generateId(),
      type: 'text',
      text: textValue,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      color,
      opacity,
      x: 50,
      y: 50,
      width: textValue.length * fontSize * 0.6,
      height: fontSize,
      rotation: 0,
    };

    onWatermarksChange([...watermarks, newWatermark]);
    setTextValue('');
  }, [textValue, fontSize, fontFamily, fontWeight, fontStyle, color, opacity, watermarks, onWatermarksChange]);

  // 添加图片水印
  const handleAddImage = useCallback(async () => {
    const imagePath = await electronAPI.selectWatermarkImage();
    if (!imagePath) return;

    const newWatermark: WatermarkConfig = {
      id: generateId(),
      type: 'image',
      imagePath,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      opacity: imageOpacity,
      rotation: 0,
    };

    onWatermarksChange([...watermarks, newWatermark]);
  }, [imageOpacity, watermarks, onWatermarksChange]);

  // 删除水印
  const handleRemove = useCallback((id: string) => {
    onWatermarksChange(watermarks.filter((w) => w.id !== id));
  }, [watermarks, onWatermarksChange]);

  // 更新水印属性
  const handleUpdateWatermark = useCallback((id: string, updates: Partial<WatermarkConfig>) => {
    onWatermarksChange(
      watermarks.map((wm) => (wm.id === id ? { ...wm, ...updates } : wm))
    );
  }, [watermarks, onWatermarksChange]);

  // 保存为模板
  const handleSaveTemplate = useCallback(() => {
    if (!newTemplateName.trim() || watermarks.length === 0) return;

    const now = Date.now();
    const template: WatermarkTemplate = {
      id: `custom-${now}`,
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim() || '自定义模板',
      category: 'custom',
      watermarks: [...watermarks],
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
    };

    saveCustomTemplate(template);
    setTemplates(getAllTemplates());
    setShowSaveDialog(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setActiveCategory('custom');
  }, [newTemplateName, newTemplateDesc, watermarks]);

  // 删除自定义模板
  const handleDeleteTemplate = useCallback((id: string) => {
    deleteCustomTemplate(id);
    setTemplates(getAllTemplates());
  }, []);

  // 分类列表
  const categories: TemplateCategory[] = ['basic', 'date', 'location', 'copyright', 'custom'];

  return (
    <div className="watermark-panel">
      <h3>水印设计</h3>

      {/* 模板选择区 */}
      <div className="template-section">
        <div className="section-header">
          <h4>模板库</h4>
          {watermarks.length > 0 && (
            <button className="btn-link" onClick={() => setShowSaveDialog(true)}>
              保存为模板
            </button>
          )}
        </div>

        {/* 分类标签 */}
        <div className="category-tabs">
          {categories.map((cat) => {
            const count = templates.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="cat-icon">{categoryIcons[cat]}</span>
                <span className="cat-name">{categoryNames[cat]}</span>
                <span className="cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* 模板列表 */}
        <div className="template-grid">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => handleApplyTemplate(template)}
            >
              <div className="template-preview">
                <div className="preview-content">
                  {template.watermarks.map((wm, idx) => (
                    <div
                      key={idx}
                      className={`preview-item ${wm.type}`}
                      style={{
                        left: `${(wm.x / 800) * 100}%`,
                        top: `${(wm.y / 600) * 100}%`,
                        fontSize: `${Math.min(wm.fontSize || 16, 16)}px`,
                        color: wm.color || '#fff',
                        opacity: wm.opacity,
                        transform: `rotate(${wm.rotation || 0}deg)`,
                      }}
                    >
                      {wm.type === 'text' ? (
                        <span>{wm.text?.substring(0, 8)}</span>
                      ) : (
                        <span className="img-icon">🖼️</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="template-info">
                <span className="template-name">{template.name}</span>
                <span className="template-desc">{template.description}</span>
                {!template.isBuiltIn && (
                  <button
                    className="btn-delete-template"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    title="删除模板"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="empty-templates">
              <p>暂无模板</p>
            </div>
          )}
        </div>
      </div>

      {/* 水印操作区 */}
      <div className="watermark-actions">
        <div className="action-header">
          <h4>添加水印</h4>
          {watermarks.length > 0 && (
            <button className="btn-link btn-danger" onClick={handleClearWatermarks}>
              清空全部
            </button>
          )}
        </div>

        {/* 文字水印 */}
        <div className="action-section">
          <div className="action-title">文字水印</div>
          <input
            type="text"
            placeholder="输入水印文字"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="input-full"
          />
          <div className="form-row">
            <div className="form-item">
              <label>字号</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min={12}
                max={200}
              />
            </div>
            <div className="form-item">
              <label>颜色</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-item full">
              <label>字体</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={fontWeight === 'bold'}
                onChange={(e) => setFontWeight(e.target.checked ? 'bold' : 'normal')}
              />
              加粗
            </label>
            <label>
              <input
                type="checkbox"
                checked={fontStyle === 'italic'}
                onChange={(e) => setFontStyle(e.target.checked ? 'italic' : 'normal')}
              />
              斜体
            </label>
          </div>
          <div className="form-row">
            <div className="form-item full">
              <label>透明度: {opacity.toFixed(1)}</label>
              <input
                type="range"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
          <button onClick={handleAddText} className="btn-primary btn-full">
            添加文字水印
          </button>
        </div>

        {/* 图片水印 */}
        <div className="action-section">
          <div className="action-title">图片水印</div>
          <div className="form-row">
            <div className="form-item full">
              <label>透明度: {imageOpacity.toFixed(1)}</label>
              <input
                type="range"
                value={imageOpacity}
                onChange={(e) => setImageOpacity(Number(e.target.value))}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
          <button onClick={handleAddImage} className="btn-secondary btn-full">
            选择水印图片
          </button>
        </div>
      </div>

      {/* 已添加水印列表 */}
      {watermarks.length > 0 && (
        <div className="watermark-list-section">
          <h4>当前水印 ({watermarks.length})</h4>
          <div className="watermark-list">
            {watermarks.map((wm, index) => (
              <div key={wm.id} className="watermark-item">
                <div className="wm-index">{index + 1}</div>
                <div className="wm-info">
                  <span className="wm-type-tag">{wm.type === 'text' ? '文字' : '图片'}</span>
                  <span className="wm-content">
                    {wm.type === 'text' ? wm.text : '水印图片'}
                  </span>
                </div>
                <div className="wm-actions">
                  <input
                    type="range"
                    value={wm.opacity}
                    onChange={(e) => handleUpdateWatermark(wm.id, { opacity: Number(e.target.value) })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mini-range"
                    title="透明度"
                  />
                  <button
                    className="btn-icon btn-remove"
                    onClick={() => handleRemove(wm.id)}
                    title="删除"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 保存模板对话框 */}
      {showSaveDialog && (
        <div className="dialog-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h4>保存为模板</h4>
            <div className="form-item">
              <label>模板名称</label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="输入模板名称"
                autoFocus
              />
            </div>
            <div className="form-item">
              <label>模板描述</label>
              <input
                type="text"
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
                placeholder="简短描述（可选）"
              />
            </div>
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setShowSaveDialog(false)}>
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
