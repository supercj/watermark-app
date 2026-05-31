import { useState, useCallback } from 'react';
import { electronAPI, isElectron } from '../lib/electron-api';
import { composeImage, downloadBlob, buildFilename } from '../lib/export-image';
import type { ExportSettings, WatermarkConfig, ImageItem, FrameConfig } from '../types';

interface Props {
  images: ImageItem[];
  watermarks: WatermarkConfig[];
  frameConfig: FrameConfig | null;
  settings: ExportSettings;
  onSettingsChange: (settings: ExportSettings) => void;
}

export function ExportPanel({
  images,
  watermarks,
  frameConfig,
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

  const hasContent = watermarks.length > 0 || !!frameConfig;

  const handleExport = useCallback(async () => {
    if (images.length === 0) { alert('请先添加图片'); return; }
    if (!hasContent) { alert('请先添加水印或选择模板'); return; }

    setExporting(true);
    setProgress(0);

    try {
      // Web 环境：合成图片并逐张下载
      for (let i = 0; i < images.length; i++) {
        const blob = await composeImage(images[i], watermarks, frameConfig, settings);
        const filename = buildFilename(
          images[i].name,
          i,
          settings.format,
          settings.preserveOriginal
        );
        downloadBlob(blob, filename);
        setProgress(Math.round(((i + 1) / images.length) * 100));
        // 给浏览器一点时间处理多文件下载
        await new Promise((r) => setTimeout(r, 150));
      }
      alert(`导出完成！共处理 ${images.length} 张图片`);
    } catch (err) {
      console.error(err);
      alert(`导出失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setExporting(false);
    }
  }, [images, watermarks, frameConfig, settings, hasContent]);

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
          {/* 仅 Electron 环境显示输出目录选择，Web 走浏览器下载 */}
          {isElectron && (
            <div className="export-row">
              <button onClick={handleSelectFolder} className="btn-secondary btn-sm export-folder-btn">
                {settings.outputFolder ? settings.outputFolder.split(/[/\\]/).pop() : '选择目录'}
              </button>
            </div>
          )}
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={settings.preserveOriginal}
              onChange={(e) => onSettingsChange({ ...settings, preserveOriginal: e.target.checked })}
            />
            保留原文件名
          </label>
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
