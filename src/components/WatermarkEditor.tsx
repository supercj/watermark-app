import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, Textbox, Image as FabricImage, Rect, Group, Line } from 'fabric';
import { calculatePosition, reversePosition } from '../lib/position';
import { formatDate } from '../lib/templates';
import type { WatermarkConfig, ImageItem, FrameConfig } from '../types';

interface Props {
  currentImage: ImageItem | null;
  watermarks: WatermarkConfig[];
  onWatermarksChange: (watermarks: WatermarkConfig[]) => void;
  onSelectWatermark: (id: string | null) => void;
  frameConfig: FrameConfig | null;
  onFrameConfigChange?: (config: FrameConfig | null) => void;
}

export function WatermarkEditor({
  currentImage,
  watermarks,
  onWatermarksChange,
  onSelectWatermark,
  frameConfig,
  onFrameConfigChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
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

  // 监听容器大小
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
        setCanvasSize({ width, height });
        canvas.renderAll();
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      setCanvasSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      canvas.renderAll();
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 将本地路径转换为 URL
  const getLocalFileUrl = useCallback((filePath: string): string => {
    if (filePath.startsWith('blob:') || filePath.startsWith('file://') || filePath.startsWith('local-file://')) {
      return filePath;
    }
    return `local-file://${filePath}`;
  }, []);

  // 加载当前图片
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = '#2a2a3e';
    setImageLoaded(false);

    if (!currentImage?.path) return;

    const imageUrl = getLocalFileUrl(currentImage.path);

    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
      .then((img) => {
        const canvasW = canvasSize.width;
        const canvasH = canvasSize.height;
        const imgW = img.width || 1;
        const imgH = img.height || 1;
        const scale = Math.min(canvasW / imgW, canvasH / imgH);

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvasW - imgW * scale) / 2,
          top: (canvasH - imgH * scale) / 2,
          selectable: false,
          evented: false,
          originX: 'left',
          originY: 'top',
        });

        canvas.insertAt(0, img);
        canvas.renderAll();
        setImageLoaded(true);
      })
      .catch((err) => {
        console.error('加载图片失败:', err);
      });
  }, [currentImage, canvasSize, getLocalFileUrl]);

  // 渲染水印
  const renderWatermarks = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // 移除水印对象（保留第一个即背景图）
    const objects = canvas.getObjects();
    for (let i = objects.length - 1; i >= 1; i--) {
      canvas.remove(objects[i]);
    }

    const scale = canvasSize.width / 800;

    // 渲染边框信息块（作为可拖拽的 Group）
    if (frameConfig) {
      const padding = frameConfig.padding * scale;
      const isCenter = frameConfig.layout === 'brand-center' || frameConfig.layout === 'minimal';

      // 构建组内元素
      const groupItems: any[] = [];
      let contentHeight = 0;
      let maxWidth = 0;

      // 品牌文字
      if (frameConfig.brandText) {
        const brand = new Textbox(frameConfig.brandText, {
          left: 0,
          top: contentHeight,
          fontSize: frameConfig.brandFontSize * scale,
          fontFamily: 'Arial, Microsoft YaHei',
          fontWeight: frameConfig.brandFontWeight,
          fill: frameConfig.brandColor,
          width: 300 * scale,
          textAlign: isCenter ? 'center' : 'left',
          splitByGrapheme: false,
        });
        groupItems.push(brand);
        contentHeight += frameConfig.brandFontSize * scale + 4 * scale;
        maxWidth = Math.max(maxWidth, brand.width || 0);
      }

      // 分隔线
      if (frameConfig.showDivider && frameConfig.brandText) {
        const divider = new Line([0, 0, 280 * scale, 0], {
          top: contentHeight,
          left: 0,
          stroke: frameConfig.dividerColor,
          strokeWidth: 1,
        });
        groupItems.push(divider);
        contentHeight += 6 * scale;
      }

      // 拍摄参数
      if (frameConfig.showParams && frameConfig.paramText) {
        const params = new Textbox(frameConfig.paramText, {
          left: 0,
          top: contentHeight,
          fontSize: frameConfig.paramFontSize * scale,
          fontFamily: 'Arial, Microsoft YaHei',
          fill: frameConfig.paramColor,
          width: 300 * scale,
          textAlign: isCenter ? 'center' : 'left',
          splitByGrapheme: false,
        });
        groupItems.push(params);
        contentHeight += frameConfig.paramFontSize * scale + 3 * scale;
        maxWidth = Math.max(maxWidth, params.width || 0);
      }

      // 日期
      if (frameConfig.showDate) {
        const dateStr = formatDate(frameConfig.dateFormat);
        const dateText = new Textbox(dateStr, {
          left: 0,
          top: contentHeight,
          fontSize: frameConfig.dateFontSize * scale,
          fontFamily: 'Arial, Microsoft YaHei',
          fill: frameConfig.dateColor,
          width: 300 * scale,
          textAlign: isCenter ? 'center' : 'left',
          splitByGrapheme: false,
        });
        groupItems.push(dateText);
        contentHeight += frameConfig.dateFontSize * scale;
        maxWidth = Math.max(maxWidth, dateText.width || 0);
      }

      if (groupItems.length > 0) {
        const blockWidth = maxWidth + padding * 2;
        const blockHeight = contentHeight + padding * 2;

        // 背景矩形
        const bg = new Rect({
          left: -padding,
          top: -padding,
          width: blockWidth,
          height: blockHeight,
          fill: frameConfig.backgroundColor,
          rx: frameConfig.borderRadius * scale,
          ry: frameConfig.borderRadius * scale,
        });

        // 创建 Group
        const group = new Group([bg, ...groupItems], {
          selectable: true,
          evented: true,
          originX: 'left',
          originY: 'top',
        });

        // 计算位置
        const { x, y } = calculatePosition(
          frameConfig.anchor,
          frameConfig.offsetX * scale,
          frameConfig.offsetY * scale,
          canvasSize.width,
          canvasSize.height,
          blockWidth,
          blockHeight
        );
        group.set({ left: x, top: y });
        (group as any).isFrameBlock = true;

        canvas.add(group);
      }
    }

    // 渲染叠加水印
    watermarks.forEach(async (wm) => {
      const itemWidth = wm.width || 100;
      const itemHeight = wm.height || 30;
      const { x, y } = calculatePosition(
        wm.anchor, wm.offsetX, wm.offsetY,
        canvasSize.width, canvasSize.height,
        itemWidth, itemHeight
      );

      if (wm.type === 'text') {
        const text = new Textbox(wm.text || '', {
          left: x,
          top: y,
          fontSize: wm.fontSize || 32,
          fontFamily: wm.fontFamily || 'Microsoft YaHei',
          fontWeight: wm.fontWeight || 'normal',
          fontStyle: wm.fontStyle || 'normal',
          fill: wm.color || '#ffffff',
          opacity: wm.opacity,
          angle: wm.rotation || 0,
          originX: 'left',
          originY: 'top',
        });
        (text as any).watermarkId = wm.id;
        canvas.add(text);
      } else if (wm.type === 'image' && wm.imagePath) {
        try {
          const img = await FabricImage.fromURL(getLocalFileUrl(wm.imagePath), { crossOrigin: 'anonymous' });
          img.set({
            left: x,
            top: y,
            scaleX: wm.width / (img.width || 1),
            scaleY: wm.height / (img.height || 1),
            opacity: wm.opacity,
            angle: wm.rotation || 0,
            originX: 'left',
            originY: 'top',
          });
          (img as any).watermarkId = wm.id;
          canvas.add(img);
        } catch {
          console.error('加载水印图片失败');
        }
      }
    });

    canvas.renderAll();
  }, [watermarks, canvasSize, getLocalFileUrl, frameConfig]);

  // 水印变化时重新渲染
  useEffect(() => {
    if (imageLoaded) {
      renderWatermarks();
    }
  }, [renderWatermarks, imageLoaded]);

  // 监听对象选中
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleSelection = (e: any) => {
      const obj = e.selected?.[0];
      if (obj && (obj as any).watermarkId) {
        onSelectWatermark((obj as any).watermarkId);
      }
    };

    const handleDeselection = () => {
      onSelectWatermark(null);
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleDeselection);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleDeselection);
    };
  }, [onSelectWatermark]);

  // 监听拖拽结束，反推锚点
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleObjectModified = (e: any) => {
      const obj = e.target;
      if (!obj) return;

      // 边框块拖拽
      if ((obj as any).isFrameBlock && frameConfig && onFrameConfigChange) {
        const objWidth = (obj.width || 0) * (obj.scaleX || 1);
        const objHeight = (obj.height || 0) * (obj.scaleY || 1);
        const scale = canvasSize.width / 800;
        const { anchor, offsetX, offsetY } = reversePosition(
          obj.left, obj.top,
          canvasSize.width, canvasSize.height,
          objWidth, objHeight
        );
        onFrameConfigChange({
          ...frameConfig,
          anchor,
          offsetX: Math.round(offsetX / scale),
          offsetY: Math.round(offsetY / scale),
        });
        return;
      }

      // 叠加水印拖拽
      if (!(obj as any).watermarkId) return;

      const wmId = (obj as any).watermarkId;
      const objWidth = (obj.width || 0) * (obj.scaleX || 1);
      const objHeight = (obj.height || 0) * (obj.scaleY || 1);

      const { anchor, offsetX, offsetY } = reversePosition(
        obj.left, obj.top,
        canvasSize.width, canvasSize.height,
        objWidth, objHeight
      );

      const newWatermarks = watermarks.map((wm) => {
        if (wm.id === wmId) {
          return {
            ...wm,
            anchor,
            offsetX,
            offsetY,
            rotation: obj.angle || 0,
            width: Math.round(objWidth),
            height: Math.round(objHeight),
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
  }, [watermarks, onWatermarksChange, canvasSize, frameConfig, onFrameConfigChange]);

  return (
    <div className="watermark-editor">
      <div className="editor-header">
        <h3>编辑区</h3>
        <span className="tip">
          {currentImage ? currentImage.name : '请先添加图片'}
        </span>
      </div>
      <div className="canvas-container" ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
