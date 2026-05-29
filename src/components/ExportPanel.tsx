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

  // 选择输出目录
  const handleSelectFolder = useCallback(async () => {
    const folder = await electronAPI.selectSaveFolder();
    if (folder) {
      onSettingsChange({ ...settings, outputFolder: folder });
    }
  }, [settings, onSettingsChange]);

  // 开始导出
  const handleExport = useCallback(async () => {
    if (images.length === 0) {
      alert('请先添加图片');
      return;
    }
    if (watermarks.length === 0) {
      alert('请先添加水印');
      return;
    }
    if (!settings.outputFolder) {
      alert('请选择输出目录');
      return;
    }

    setExporting(true);
    setProgress(0);

    // TODO: 实现实际的导出逻辑
    // 这里需要使用 Canvas 合成图片和水印
    for (let i = 0; i < images.length; i++) {
      // 模拟处理进度
      await new Promise((r) => setTimeout(r, 100));
      setProgress(Math.round(((i + 1) / images.length) * 100));
    }

    setExporting(false);
    alert(`导出完成！共处理 ${images.length} 张图片`);
  }, [images, watermarks, settings]);

  return (
    <div className="export-panel">
      <h3>导出设置</h3>
      
      <div className="setting-item">
        <label>输出格式:</label>
        <select
          value={settings.format}
          onChange={(e) =>
            onSettingsChange({ ...settings, format: e.target.value as ExportSettings['format'] })
          }
        >
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </div>

      <div className="setting-item">
        <label>图片质量:</label>
        <input
          type="range"
          value={settings.quality}
          onChange={(e) =>
            onSettingsChange({ ...settings, quality: Number(e.target.value) })
          }
          min={1}
          max={100}
        />
        <span>{settings.quality}%</span>
      </div>

      <div className="setting-item">
        <label>输出目录:</label>
        <button onClick={handleSelectFolder} className="btn-secondary">
          {settings.outputFolder || '选择目录'}
        </button>
      </div>

      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={settings.preserveOriginal}
            onChange={(e) =>
              onSettingsChange({ ...settings, preserveOriginal: e.target.checked })
            }
          />
          保留原始文件名
        </label>
      </div>

      {exporting && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={exporting || images.length === 0}
        className="btn-primary btn-large"
      >
        {exporting ? '导出中...' : `导出 (${images.length} 张图片)`}
      </button>
    </div>
  );
}
