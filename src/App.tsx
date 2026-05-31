import { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { WatermarkEditor } from './components/WatermarkEditor';
import { WatermarkPanel } from './components/WatermarkPanel';
import { ExportPanel } from './components/ExportPanel';
import type { ImageItem, WatermarkConfig, ExportSettings, MobileTab, FrameConfig } from './types';
import './App.css';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watermarks, setWatermarks] = useState<WatermarkConfig[]>([]);
  const [selectedWatermarkId, setSelectedWatermarkId] = useState<string | null>(null);
  const [frameConfig, setFrameConfig] = useState<FrameConfig | null>(null);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'jpg',
    quality: 90,
    outputFolder: '',
    preserveOriginal: true,
  });

  // 移动端 Tab 状态
  const [mobileTab, setMobileTab] = useState<MobileTab>('watermark');
  const [isMobile, setIsMobile] = useState(false);

  // 检测屏幕宽度
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 添加图片
  const handleImagesAdd = useCallback((paths: string[]) => {
    const newImages: ImageItem[] = paths.map((path) => ({
      id: generateId(),
      path,
      name: path.split(/[/\\]/).pop() || '未命名',
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // 删除图片
  const handleImageRemove = useCallback((id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id);
      return newImages;
    });
  }, []);

  // 选择图片
  const handleImageSelect = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= images.length) {
      setCurrentIndex(images.length - 1);
    }
  }, [images.length, currentIndex]);

  const currentImage = images[currentIndex] || null;

  // 桌面端布局
  if (!isMobile) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>水印大师</h1>
          <span className="subtitle">批量添加水印工具</span>
        </header>

        <main className="app-main">
          <aside className="sidebar-left">
            <ImageUploader
              images={images}
              onImagesAdd={handleImagesAdd}
              onImageRemove={handleImageRemove}
              onImageSelect={handleImageSelect}
              currentIndex={currentIndex}
            />
          </aside>

          <section className="editor-area">
            <WatermarkEditor
              currentImage={currentImage}
              watermarks={watermarks}
              onWatermarksChange={setWatermarks}
              onSelectWatermark={setSelectedWatermarkId}
              frameConfig={frameConfig}
              onFrameConfigChange={setFrameConfig}
            />
          </section>

          <aside className="sidebar-right">
            <WatermarkPanel
              watermarks={watermarks}
              onWatermarksChange={setWatermarks}
              selectedWatermarkId={selectedWatermarkId}
              onSelectWatermark={setSelectedWatermarkId}
              frameConfig={frameConfig}
              onFrameConfigChange={setFrameConfig}
            />
            <ExportPanel
              images={images}
              watermarks={watermarks}
              frameConfig={frameConfig}
              settings={exportSettings}
              onSettingsChange={setExportSettings}
            />
          </aside>
        </main>
      </div>
    );
  }

  // 移动端布局
  return (
    <div className="app mobile">
      <header className="app-header mobile-header">
        <h1>水印大师</h1>
      </header>

      <main className="app-main-mobile">
        {/* 画布始终可见 */}
        <section className="editor-area-mobile">
          <WatermarkEditor
            currentImage={currentImage}
            watermarks={watermarks}
            onWatermarksChange={setWatermarks}
            onSelectWatermark={setSelectedWatermarkId}
            frameConfig={frameConfig}
            onFrameConfigChange={setFrameConfig}
          />
        </section>

        {/* 底部面板 */}
        <div className="mobile-panel">
          {mobileTab === 'images' && (
            <ImageUploader
              images={images}
              onImagesAdd={handleImagesAdd}
              onImageRemove={handleImageRemove}
              onImageSelect={handleImageSelect}
              currentIndex={currentIndex}
            />
          )}
          {mobileTab === 'watermark' && (
            <WatermarkPanel
              watermarks={watermarks}
              onWatermarksChange={setWatermarks}
              selectedWatermarkId={selectedWatermarkId}
              onSelectWatermark={setSelectedWatermarkId}
              frameConfig={frameConfig}
              onFrameConfigChange={setFrameConfig}
            />
          )}
          {mobileTab === 'export' && (
            <ExportPanel
              images={images}
              watermarks={watermarks}
              frameConfig={frameConfig}
              settings={exportSettings}
              onSettingsChange={setExportSettings}
            />
          )}
        </div>
      </main>

      {/* 底部 Tab 栏 */}
      <nav className="mobile-tabs">
        <button
          className={`tab-btn ${mobileTab === 'images' ? 'active' : ''}`}
          onClick={() => setMobileTab('images')}
        >
          <span className="tab-icon">🖼</span>
          <span>图片</span>
        </button>
        <button
          className={`tab-btn ${mobileTab === 'watermark' ? 'active' : ''}`}
          onClick={() => setMobileTab('watermark')}
        >
          <span className="tab-icon">✏️</span>
          <span>水印</span>
        </button>
        <button
          className={`tab-btn ${mobileTab === 'export' ? 'active' : ''}`}
          onClick={() => setMobileTab('export')}
        >
          <span className="tab-icon">📤</span>
          <span>导出</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
