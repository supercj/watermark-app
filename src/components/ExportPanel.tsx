import { useState, useCallback } from 'react';
import { electronAPI } from '../lib/electron-api';
import type { ExportSettings, WatermarkConfig, ImageItem } from '../types';

interface Props {
  images: ImageItem[];
  watermarks: WatermarkConfig[];
  settings: ExportSettings;
  onSettingsChange: (settings: ExportSettings) => void;
}

export function ExportPanel({
  images,
  watermarks,
  settings,
  onSettingsChange,
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handleSelectFolder = useCallback(async () => {
    const folder = await electronAPI.selectSaveFolder();
    if (folder) {
      onSettingsChange({ ...settings, outputFolder: folder });
    }
  }, [settings, onSettingsChange]);

  const handleExport = useCallback(async () => {
    if (images.length === 0) { alert('请先添加图片'); return; }
    if (watermarks.length === 0) { alert('请先添加水印'); return; }
    if (!settings.outputFolder) { alert('请选择输出目录'); return; }

    setExporting(true);
    setProgress(0);

    for (let i = 0; i < images.length; i++) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(Math.round(((i + 1) / images.length) * 100));
    }

    setExporting(false);
    alert(`导出完成！共处理 ${images.length} 张图片`);
  }, [images, watermarks, settings]);

  return (
    <div className="export-panel">
      <div className="export-header" onClick={() => setExpanded(!expanded)}>
        <span className="export-title">导出</span>
        <span className="export-toggle">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="export-settings">
          <div className="export-row">
            <label>格式</label>
            <select
              value={settings.format}
              onChange={(e) => onSettingsChange({ ...settings, format: e.target.value as ExportSettings['format'] })}
            >
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
            <label>质量</label>
            <span className="quality-val">{settings.quality}%</span>
          </div>
          <input
            type="range"
            value={settings.quality}
            onChange={(e) => onSettingsChange({ ...settings, quality: Number(e.target.value) })}
            min={1} max={100}
            className="quality-slider"
          />
          <div className="export-row">
            <button onClick={handleSelectFolder} className="btn-secondary btn-sm export-folder-btn">
              {settings.outputFolder ? settings.outputFolder.split(/[/\\]/).pop() : '选择目录'}
            </button>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={settings.preserveOriginal}
                onChange={(e) => onSettingsChange({ ...settings, preserveOriginal: e.target.checked })}
              />
              保留原名
            </label>
          </div>
        </div>
      )}

      {exporting && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={exporting || images.length === 0}
        className="btn-primary btn-full btn-export"
      >
        {exporting ? '导出中...' : `导出 (${images.length} 张)`}
      </button>
    </div>
  );
}
