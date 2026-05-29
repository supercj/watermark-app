import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, Textbox, Image as FabricImage } from 'fabric';
import type { WatermarkConfig, ImageItem } from '../types';

interface Props {
  currentImage: ImageItem | null;
  watermarks: WatermarkConfig[];
  onWatermarksChange: (watermarks: WatermarkConfig[]) => void;
}

export function WatermarkEditor({
  currentImage,
  watermarks,
  onWatermarksChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 初始化 Fabric 画布
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#2a2a3e',
      selection: true,
    });
    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // 监听容器大小变化并更新画布
  useEffect(() => {
    const container = containerRef.current;
    const canvas = fabricRef.current;
    if (!container || !canvas) return;

    const updateSize = (entries: ResizeObserverEntry[]) => {
      const rect = entries[0]?.contentRect || container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      
      if (width > 0 && height > 0) {
        canvas.setDimensions({ width, height });
        canvas.renderAll();
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // 初始设置
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      canvas.renderAll();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 将本地路径转换为可用的 URL
  const getLocalFileUrl = useCallback((filePath: string): string => {
    if (filePath.startsWith('blob:') || filePath.startsWith('file://') || filePath.startsWith('local-file://')) {
      return filePath;
    }
    // 使用 local-file:// 协议
    return `local-file://${filePath}`;
  }, []);

  // 加载当前图片到画布
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // 清除旧内容
    canvas.clear();
    canvas.backgroundColor = '#2a2a3e';
    setImageLoaded(false);

    if (!currentImage?.path) return;

    const imageUrl = getLocalFileUrl(currentImage.path);

    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
      .then((img) => {
        // 计算缩放比例以填满画布（保持比例）
        const canvasW = canvasSize.width;
        const canvasH = canvasSize.height;
        const imgW = img.width || 1;
        const imgH = img.height || 1;

        // 计算缩放比例，让图片尽可能填满画布
        const scale = Math.min(canvasW / imgW, canvasH / imgH);

        img.scale(scale);
        
        // 居中显示
        img.set({
          left: (canvasW - imgW * scale) / 2,
          top: (canvasH - imgH * scale) / 2,
          selectable: false,
          evented: false,
        });

        canvas.backgroundImage = img;
        canvas.renderAll();
        setImageLoaded(true);

        // 渲染水印
        renderWatermarks();
      })
      .catch((err) => {
        console.error('加载图片失败:', err);
      });
  }, [currentImage, canvasSize]);

  // 渲染水印对象
  const renderWatermarks = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // 移除旧的水印对象（保留背景图）
    const objects = canvas.getObjects();
    objects.forEach((obj) => canvas.remove(obj));

    // 添加新的水印对象
    watermarks.forEach(async (wm) => {
      if (wm.type === 'text') {
        const text = new Textbox(wm.text || '', {
          left: wm.x,
          top: wm.y,
          fontSize: wm.fontSize || 32,
          fontFamily: wm.fontFamily || 'Arial',
          fontWeight: wm.fontWeight || 'normal',
          fontStyle: wm.fontStyle || 'normal',
          fill: wm.color || '#ffffff',
          opacity: wm.opacity,
          angle: wm.rotation || 0,
        });

        (text as any).watermarkId = wm.id;
        canvas.add(text);
        canvas.renderAll();
      } else if (wm.type === 'image' && wm.imagePath) {
        try {
          const img = await FabricImage.fromURL(getLocalFileUrl(wm.imagePath), { crossOrigin: 'anonymous' });
          img.set({
            left: wm.x,
            top: wm.y,
            scaleX: wm.width / (img.width || 1),
            scaleY: wm.height / (img.height || 1),
            opacity: wm.opacity,
            angle: wm.rotation || 0,
          });
          (img as any).watermarkId = wm.id;
          canvas.add(img);
          canvas.renderAll();
        } catch {
          console.error('加载水印图片失败');
        }
      }
    });

    canvas.renderAll();
  }, [watermarks, getLocalFileUrl]);

  // 监听对象移动，更新水印位置
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleObjectModified = (e: any) => {
      const obj = e.target;
      if (!obj || !(obj as any).watermarkId) return;

      const wmId = (obj as any).watermarkId;
      const newWatermarks = watermarks.map((wm) => {
        if (wm.id === wmId) {
          return {
            ...wm,
            x: obj.left,
            y: obj.top,
            rotation: obj.angle,
            width: obj.width * obj.scaleX,
            height: obj.height * obj.scaleY,
          };
        }
        return wm;
      });
      onWatermarksChange(newWatermarks);
    };

    canvas.on('object:modified', handleObjectModified);
    return () => {
      canvas.off('object:modified', handleObjectModified);
    };
  }, [watermarks, onWatermarksChange]);

  // 当水印配置变化时重新渲染
  useEffect(() => {
    if (imageLoaded) {
      renderWatermarks();
    }
  }, [renderWatermarks, imageLoaded]);

  return (
    <div className="watermark-editor">
      <div className="editor-header">
        <h3>水印编辑区</h3>
        <span className="tip">
          {currentImage ? `当前图片: ${currentImage.name}` : '请先添加图片'}
        </span>
      </div>
      <div className="canvas-container" ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
