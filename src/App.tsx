import { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { WatermarkEditor } from './components/WatermarkEditor';
import { WatermarkPanel } from './components/WatermarkPanel';
import { ExportPanel } from './components/ExportPanel';
import type { ImageItem, WatermarkConfig, ExportSettings } from './types';
import './App.css';

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function App() {
  // 状态管理
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watermarks, setWatermarks] = useState<WatermarkConfig[]>([]);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'jpg',
    quality: 90,
    outputFolder: '',
    preserveOriginal: true,
  });

  // 添加图片
  const handleImagesAdd = useCallback((paths: string[]) => {
    const newImages: ImageItem[] = paths.map((path) => ({
      id: generateId(),
      path,
      name: path.split(/[/\\]/).pop() || path.split('/').pop() || '未命名',
      preview: path, // 直接使用路径，在 ImageUploader 中处理预览
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // 删除图片
  const handleImageRemove = useCallback((id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id);
      // 如果删除的是当前选中的图片，调整 currentIndex
      const deletedIndex = prev.findIndex((img) => img.id === id);
      if (deletedIndex !== -1 && deletedIndex <= currentIndex) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
      return newImages;
    });
  }, [currentIndex]);

  // 选择图片
  const handleImageSelect = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 当图片列表为空时，重置 currentIndex
  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= images.length) {
      setCurrentIndex(images.length - 1);
    }
  }, [images.length, currentIndex]);

  // 当前图片
  const currentImage = images[currentIndex] || null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>水印大师</h1>
        <span className="subtitle">批量添加水印工具</span>
      </header>

      <main className="app-main">
        {/* 左侧：图片列表 */}
        <aside className="sidebar-left">
          <ImageUploader
            images={images}
            onImagesAdd={handleImagesAdd}
            onImageRemove={handleImageRemove}
            onImageSelect={handleImageSelect}
            currentIndex={currentIndex}
          />
        </aside>

        {/* 中间：编辑区 */}
        <section className="editor-area">
          <WatermarkEditor
            currentImage={currentImage}
            watermarks={watermarks}
            onWatermarksChange={setWatermarks}
          />
        </section>

        {/* 右侧：水印设计和导出 */}
        <aside className="sidebar-right">
          <WatermarkPanel
            watermarks={watermarks}
            onWatermarksChange={setWatermarks}
          />
          <ExportPanel
            images={images}
            watermarks={watermarks}
            settings={exportSettings}
            onSettingsChange={setExportSettings}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
