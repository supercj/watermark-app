import { useState, useCallback, useEffect } from 'react';
import { electronAPI } from '../lib/electron-api';
import {
  getAllTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  processWatermarks,
  generateId,
  formatDate,
} from '../lib/templates';
import { anchorNames, calculatePosition } from '../lib/position';
import type {
  WatermarkConfig,
  WatermarkTemplate,
  FrameConfig,
  AnchorPosition,
  TemplateCategory,
} from '../types';

interface Props {
  watermarks: WatermarkConfig[];
  onWatermarksChange: (watermarks: WatermarkConfig[]) => void;
  selectedWatermarkId: string | null;
  onSelectWatermark: (id: string | null) => void;
  // 边框模板
  frameConfig: FrameConfig | null;
  onFrameConfigChange: (config: FrameConfig | null) => void;
}

const FONTS = [
  'Microsoft YaHei', 'SimHei', 'SimSun', 'KaiTi',
  'Arial', 'Times New Roman', 'Georgia',
];

const ANCHOR_GRID: AnchorPosition[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

export function WatermarkPanel({
  watermarks,
  onWatermarksChange,
  selectedWatermarkId,
  onSelectWatermark,
  frameConfig,
  onFrameConfigChange,
}: Props) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templates, setTemplates] = useState<WatermarkTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateFilter, setTemplateFilter] = useState<TemplateCategory | 'all'>('all');

  useEffect(() => {
    setTemplates(getAllTemplates());
  }, []);

  const selectedWatermark = watermarks.find((w) => w.id === selectedWatermarkId) || null;

  // 快速添加文字水印
  const handleAddText = useCallback(() => {
    const wm: WatermarkConfig = {
      id: generateId(),
      type: 'text',
      text: '水印文字',
      anchor: 'center',
      offsetX: 0,
      offsetY: 0,
      fontSize: 32,
      fontFamily: 'Microsoft YaHei',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#ffffff',
      width: 150,
      height: 40,
      opacity: 0.8,
      rotation: 0,
    };
    onWatermarksChange([...watermarks, wm]);
    onSelectWatermark(wm.id);
  }, [watermarks, onWatermarksChange, onSelectWatermark]);

  // 快速添加日期
  const handleAddDate = useCallback(() => {
    const wm: WatermarkConfig = {
      id: generateId(),
      type: 'text',
      text: formatDate('YYYY-MM-DD'),
      anchor: 'bottom-right',
      offsetX: 30,
      offsetY: 30,
      fontSize: 20,
      fontFamily: 'Microsoft YaHei',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#ffffff',
      width: 140,
      height: 25,
      opacity: 0.8,
      rotation: 0,
    };
    onWatermarksChange([...watermarks, wm]);
    onSelectWatermark(wm.id);
  }, [watermarks, onWatermarksChange, onSelectWatermark]);

  // 快速添加版权
  const handleAddCopyright = useCallback(() => {
    const wm: WatermarkConfig = {
      id: generateId(),
      type: 'text',
      text: '© 版权所有',
      anchor: 'bottom-left',
      offsetX: 30,
      offsetY: 30,
      fontSize: 16,
      fontFamily: 'Microsoft YaHei',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#ffffff',
      width: 120,
      height: 20,
      opacity: 0.8,
      rotation: 0,
    };
    onWatermarksChange([...watermarks, wm]);
    onSelectWatermark(wm.id);
  }, [watermarks, onWatermarksChange, onSelectWatermark]);

  // 添加图片水印
  const handleAddImage = useCallback(async () => {
    const imagePath = await electronAPI.selectWatermarkImage();
    if (!imagePath) return;
    const wm: WatermarkConfig = {
      id: generateId(),
      type: 'image',
      imagePath,
      anchor: 'center',
      offsetX: 0,
      offsetY: 0,
      width: 100,
      height: 100,
      opacity: 0.8,
      rotation: 0,
    };
    onWatermarksChange([...watermarks, wm]);
    onSelectWatermark(wm.id);
  }, [watermarks, onWatermarksChange, onSelectWatermark]);

  // 删除水印
  const handleRemove = useCallback((id: string) => {
    onWatermarksChange(watermarks.filter((w) => w.id !== id));
    if (selectedWatermarkId === id) onSelectWatermark(null);
  }, [watermarks, onWatermarksChange, selectedWatermarkId, onSelectWatermark]);

  // 清空
  const handleClear = useCallback(() => {
    onWatermarksChange([]);
    onFrameConfigChange(null);
    onSelectWatermark(null);
  }, [onWatermarksChange, onFrameConfigChange, onSelectWatermark]);

  // 更新选中水印属性
  const updateSelected = useCallback((updates: Partial<WatermarkConfig>) => {
    if (!selectedWatermarkId) return;
    onWatermarksChange(
      watermarks.map((wm) => (wm.id === selectedWatermarkId ? { ...wm, ...updates } : wm))
    );
  }, [watermarks, onWatermarksChange, selectedWatermarkId]);

  // 更新边框配置
  const updateFrame = useCallback((updates: Partial<FrameConfig>) => {
    if (!frameConfig) return;
    onFrameConfigChange({ ...frameConfig, ...updates });
  }, [frameConfig, onFrameConfigChange]);

  // 应用模板
  const handleApplyTemplate = useCallback((template: WatermarkTemplate) => {
    if (template.mode === 'frame' && template.frameConfig) {
      // 边框模板：设置边框配置，清空叠加水印
      onFrameConfigChange({ ...template.frameConfig, id: generateId() });
      onWatermarksChange([]);
    } else if (template.mode === 'overlay' && template.watermarks) {
      // 叠加水印模板
      const processed = processWatermarks(template.watermarks);
      onFrameConfigChange(null);
      onWatermarksChange(processed);
    }
    onSelectWatermark(null);
    setShowTemplateDialog(false);
  }, [onWatermarksChange, onFrameConfigChange, onSelectWatermark]);

  // 保存为模板
  const handleSaveTemplate = useCallback(() => {
    if (!newTemplateName.trim()) return;
    const now = Date.now();
    const template: WatermarkTemplate = {
      id: `custom-${now}`,
      name: newTemplateName.trim(),
      description: '自定义模板',
      category: 'custom',
      mode: frameConfig ? 'frame' : 'overlay',
      frameConfig: frameConfig || undefined,
      watermarks: frameConfig ? undefined : [...watermarks],
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
    };
    saveCustomTemplate(template);
    setTemplates(getAllTemplates());
    setShowSaveDialog(false);
    setNewTemplateName('');
  }, [newTemplateName, watermarks, frameConfig]);

  // 删除模板
  const handleDeleteTemplate = useCallback((id: string) => {
    deleteCustomTemplate(id);
    setTemplates(getAllTemplates());
  }, []);

  // 筛选模板
  const filteredTemplates = templateFilter === 'all'
    ? templates
    : templates.filter((t) => t.category === templateFilter);

  return (
    <div className="watermark-panel">
      {/* 快速添加 */}
      <div className="quick-add">
        <div className="section-title">快速添加</div>
        <div className="quick-add-buttons">
          <button className="quick-btn" onClick={handleAddText}>
            <span className="quick-icon">T</span><span>文字</span>
          </button>
          <button className="quick-btn" onClick={handleAddDate}>
            <span className="quick-icon">📅</span><span>日期</span>
          </button>
          <button className="quick-btn" onClick={handleAddCopyright}>
            <span className="quick-icon">©</span><span>版权</span>
          </button>
          <button className="quick-btn" onClick={handleAddImage}>
            <span className="quick-icon">🖼</span><span>图片</span>
          </button>
        </div>
      </div>

      {/* 边框模板编辑（如果激活） */}
      {frameConfig && (
        <div className="frame-editor">
          <div className="section-title-row">
            <span className="section-title">边框信息栏</span>
            <button className="btn-link btn-danger" onClick={() => onFrameConfigChange(null)}>移除</button>
          </div>
          <div className="frame-fields">
            <div className="prop-field full">
              <label>品牌文字</label>
              <input
                type="text"
                value={frameConfig.brandText}
                onChange={(e) => updateFrame({ brandText: e.target.value })}
              />
            </div>
            <div className="prop-row-inline">
              <div className="prop-field">
                <label>背景色</label>
                <input
                  type="color"
                  value={frameConfig.backgroundColor}
                  onChange={(e) => updateFrame({ backgroundColor: e.target.value })}
                />
              </div>
              <div className="prop-field">
                <label>品牌色</label>
                <input
                  type="color"
                  value={frameConfig.brandColor}
                  onChange={(e) => updateFrame({ brandColor: e.target.value })}
                />
              </div>
            </div>
            {frameConfig.showParams && (
              <div className="prop-field full">
                <label>拍摄参数</label>
                <input
                  type="text"
                  value={frameConfig.paramText}
                  onChange={(e) => updateFrame({ paramText: e.target.value })}
                  placeholder="50mm f/1.8 1/125s ISO100"
                />
              </div>
            )}
            <div className="prop-row-inline checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={frameConfig.showParams}
                  onChange={(e) => updateFrame({ showParams: e.target.checked })}
                /> 参数
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={frameConfig.showDate}
                  onChange={(e) => updateFrame({ showDate: e.target.checked })}
                /> 日期
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={frameConfig.showDivider}
                  onChange={(e) => updateFrame({ showDivider: e.target.checked })}
                /> 分隔线
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 叠加水印列表 */}
      {watermarks.length > 0 && (
        <div className="wm-list-section">
          <div className="section-title-row">
            <span className="section-title">叠加水印 ({watermarks.length})</span>
            <button className="btn-link btn-danger" onClick={handleClear}>清空</button>
          </div>
          <div className="wm-compact-list">
            {watermarks.map((wm, idx) => (
              <div
                key={wm.id}
                className={`wm-compact-item ${wm.id === selectedWatermarkId ? 'selected' : ''}`}
                onClick={() => onSelectWatermark(wm.id)}
              >
                <span className="wm-idx">{idx + 1}</span>
                <span className="wm-label">
                  {wm.type === 'text' ? (wm.text || '文字').substring(0, 10) : '图片水印'}
                </span>
                <span className="wm-pos">{anchorNames[wm.anchor]}</span>
                <button
                  className="wm-del"
                  onClick={(e) => { e.stopPropagation(); handleRemove(wm.id); }}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 选中水印属性编辑 */}
      {selectedWatermark && (
        <div className="wm-properties">
          <div className="section-title">属性</div>
          <div className="prop-row">
            <div className="anchor-grid">
              {ANCHOR_GRID.map((pos) => (
                <button
                  key={pos}
                  className={`anchor-dot ${selectedWatermark.anchor === pos ? 'active' : ''}`}
                  onClick={() => updateSelected({ anchor: pos, offsetX: pos.includes('center') ? 0 : 30, offsetY: pos.includes('center') ? 0 : 30 })}
                  title={anchorNames[pos]}
                />
              ))}
            </div>
            <div className="prop-fields">
              <div className="prop-field">
                <label>边距X</label>
                <input type="number" value={selectedWatermark.offsetX}
                  onChange={(e) => updateSelected({ offsetX: Number(e.target.value) })} min={0} />
              </div>
              <div className="prop-field">
                <label>边距Y</label>
                <input type="number" value={selectedWatermark.offsetY}
                  onChange={(e) => updateSelected({ offsetY: Number(e.target.value) })} min={0} />
              </div>
            </div>
          </div>
          {selectedWatermark.type === 'text' && (
            <div className="text-props">
              <div className="prop-field full">
                <label>文字</label>
                <input type="text" value={selectedWatermark.text || ''}
                  onChange={(e) => updateSelected({ text: e.target.value })} />
              </div>
              <div className="prop-row-inline">
                <div className="prop-field">
                  <label>字号</label>
                  <input type="number" value={selectedWatermark.fontSize || 32}
                    onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} min={12} max={200} />
                </div>
                <div className="prop-field">
                  <label>颜色</label>
                  <input type="color" value={selectedWatermark.color || '#ffffff'}
                    onChange={(e) => updateSelected({ color: e.target.value })} />
                </div>
              </div>
              <div className="prop-field full">
                <label>字体</label>
                <select value={selectedWatermark.fontFamily || 'Microsoft YaHei'}
                  onChange={(e) => updateSelected({ fontFamily: e.target.value })}>
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="prop-field full">
            <label>透明度: {selectedWatermark.opacity.toFixed(1)}</label>
            <input type="range" value={selectedWatermark.opacity}
              onChange={(e) => updateSelected({ opacity: Number(e.target.value) })} min={0} max={1} step={0.1} />
          </div>
        </div>
      )}

      {/* 模板按钮 */}
      <div className="template-buttons">
        <button className="btn-secondary btn-sm" onClick={() => setShowTemplateDialog(true)}>
          模板库
        </button>
        {(watermarks.length > 0 || frameConfig) && (
          <button className="btn-secondary btn-sm" onClick={() => setShowSaveDialog(true)}>
            保存模板
          </button>
        )}
      </div>

      {/* 模板选择弹窗 */}
      {showTemplateDialog && (
        <div className="dialog-overlay" onClick={() => setShowTemplateDialog(false)}>
          <div className="template-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h4>模板库</h4>
              <button className="dialog-close" onClick={() => setShowTemplateDialog(false)}>×</button>
            </div>
            {/* 分类筛选 */}
            <div className="tpl-filter">
              <button className={`filter-btn ${templateFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTemplateFilter('all')}>全部</button>
              <button className={`filter-btn ${templateFilter === 'frame' ? 'active' : ''}`}
                onClick={() => setTemplateFilter('frame')}>边框</button>
              <button className={`filter-btn ${templateFilter === 'overlay' ? 'active' : ''}`}
                onClick={() => setTemplateFilter('overlay')}>叠加</button>
              <button className={`filter-btn ${templateFilter === 'custom' ? 'active' : ''}`}
                onClick={() => setTemplateFilter('custom')}>自定义</button>
            </div>
            <div className="template-grid-dialog">
              {filteredTemplates.map((t) => (
                <div key={t.id} className="template-card-dialog" onClick={() => handleApplyTemplate(t)}>
                  {/* 预览 */}
                  <div className={`tpl-preview ${t.mode === 'frame' ? 'frame-preview' : ''}`}>
                    {t.mode === 'frame' && t.frameConfig && (
                      <div className="frame-preview-content"
                        style={{ backgroundColor: t.frameConfig.backgroundColor }}>
                        <div className="fp-brand" style={{
                          color: t.frameConfig.brandColor,
                          fontSize: `${Math.min(t.frameConfig.brandFontSize * 0.6, 14)}px`,
                          fontWeight: t.frameConfig.brandFontWeight,
                          textAlign: t.frameConfig.layout === 'brand-center' ? 'center' : 'left',
                        }}>
                          {t.frameConfig.brandText}
                        </div>
                        {t.frameConfig.showParams && (
                          <div className="fp-params" style={{ color: t.frameConfig.paramColor }}>
                            {t.frameConfig.paramText.substring(0, 25)}
                          </div>
                        )}
                        {t.frameConfig.showDate && (
                          <div className="fp-date" style={{ color: t.frameConfig.dateColor }}>
                            {formatDate(t.frameConfig.dateFormat)}
                          </div>
                        )}
                      </div>
                    )}
                    {t.mode === 'overlay' && t.watermarks && (
                      <>
                        {t.watermarks.map((wm, idx) => {
                          const previewW = 140;
                          const previewH = 80;
                          const itemW = Math.min(wm.width || 60, previewW * 0.6);
                          const itemH = Math.min(wm.height || 16, previewH * 0.4);
                          const { x, y } = calculatePosition(
                            wm.anchor,
                            Math.round(wm.offsetX * previewW / 800),
                            Math.round(wm.offsetY * previewH / 600),
                            previewW, previewH, itemW, itemH
                          );
                          return (
                            <span key={idx} className="tpl-preview-item" style={{
                              left: `${x}px`, top: `${y}px`,
                              fontSize: `${Math.min((wm.fontSize || 16) * 0.4, 12)}px`,
                              color: wm.color || '#fff',
                              opacity: wm.opacity,
                              transform: `rotate(${wm.rotation || 0}deg)`,
                            }}>
                              {wm.type === 'text' ? (wm.text || 'T').substring(0, 12) : '🖼'}
                            </span>
                          );
                        })}
                      </>
                    )}
                  </div>
                  <div className="tpl-info">
                    <div className="tpl-name">{t.name}</div>
                    <div className="tpl-desc">{t.description}</div>
                  </div>
                  {!t.isBuiltIn && (
                    <button className="tpl-delete" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(t.id);
                    }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 保存模板弹窗 */}
      {showSaveDialog && (
        <div className="dialog-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h4>保存为模板</h4>
            <div className="prop-field full">
              <label>模板名称</label>
              <input type="text" value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="输入模板名称" autoFocus />
            </div>
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setShowSaveDialog(false)}>取消</button>
              <button className="btn-primary" onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
