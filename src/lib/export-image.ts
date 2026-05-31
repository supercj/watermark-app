import { calculatePosition } from './position';
import { formatDate } from './templates';
import type { WatermarkConfig, FrameConfig, ExportSettings, ImageItem } from '../types';

// 基准画布宽度（模板坐标的设计基准）
const BASE_WIDTH = 800;

/**
 * 加载图片为 HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`图片加载失败: ${src}`));
    img.src = src;
  });
}

/**
 * 在离屏 canvas 上合成图片 + 叠加水印 + 边框信息块
 * 返回合成后的 Blob
 */
export async function composeImage(
  image: ImageItem,
  watermarks: WatermarkConfig[],
  frameConfig: FrameConfig | null,
  settings: ExportSettings
): Promise<Blob> {
  const baseImg = await loadImage(image.path);

  const canvas = document.createElement('canvas');
  canvas.width = baseImg.naturalWidth;
  canvas.height = baseImg.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 canvas 上下文');

  // 绘制原图
  ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

  // 相对于基准宽度的缩放系数（保证导出与预览视觉一致）
  const scale = canvas.width / BASE_WIDTH;

  // 绘制叠加水印
  for (const wm of watermarks) {
    ctx.save();
    ctx.globalAlpha = wm.opacity;

    const itemWidth = (wm.width || 100) * scale;
    const itemHeight = (wm.height || 30) * scale;
    const { x, y } = calculatePosition(
      wm.anchor,
      wm.offsetX * scale,
      wm.offsetY * scale,
      canvas.width,
      canvas.height,
      itemWidth,
      itemHeight
    );

    if (wm.type === 'text') {
      const fontSize = (wm.fontSize || 32) * scale;
      const weight = wm.fontWeight === 'bold' ? 'bold' : 'normal';
      const style = wm.fontStyle === 'italic' ? 'italic' : 'normal';
      ctx.font = `${style} ${weight} ${fontSize}px ${wm.fontFamily || 'Microsoft YaHei'}`;
      ctx.fillStyle = wm.color || '#ffffff';
      ctx.textBaseline = 'top';

      // 旋转处理
      if (wm.rotation) {
        const cx = x + itemWidth / 2;
        const cy = y + itemHeight / 2;
        ctx.translate(cx, cy);
        ctx.rotate((wm.rotation * Math.PI) / 180);
        ctx.fillText(wm.text || '', -itemWidth / 2, -itemHeight / 2);
      } else {
        ctx.fillText(wm.text || '', x, y);
      }
    } else if (wm.type === 'image' && wm.imagePath) {
      try {
        const wmImg = await loadImage(wm.imagePath);
        if (wm.rotation) {
          const cx = x + itemWidth / 2;
          const cy = y + itemHeight / 2;
          ctx.translate(cx, cy);
          ctx.rotate((wm.rotation * Math.PI) / 180);
          ctx.drawImage(wmImg, -itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight);
        } else {
          ctx.drawImage(wmImg, x, y, itemWidth, itemHeight);
        }
      } catch {
        // 忽略加载失败的水印图片
      }
    }
    ctx.restore();
  }

  // 绘制边框信息块
  if (frameConfig) {
    drawFrameBlock(ctx, canvas.width, canvas.height, frameConfig, scale);
  }

  // 导出为 Blob
  const mimeType = settings.format === 'png'
    ? 'image/png'
    : settings.format === 'webp'
      ? 'image/webp'
      : 'image/jpeg';
  const quality = settings.quality / 100;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('图片导出失败'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * 绘制边框信息块（品牌 + 参数 + 日期）
 */
function drawFrameBlock(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  frame: FrameConfig,
  scale: number
) {
  const padding = frame.padding * scale;
  const isCenter = frame.layout === 'brand-center' || frame.layout === 'minimal';

  // 收集要绘制的文本行
  const lines: { text: string; fontSize: number; color: string; weight: string }[] = [];

  if (frame.brandText) {
    lines.push({
      text: frame.brandText,
      fontSize: frame.brandFontSize * scale,
      color: frame.brandColor,
      weight: frame.brandFontWeight === 'bold' ? 'bold' : 'normal',
    });
  }
  if (frame.showParams && frame.paramText) {
    lines.push({
      text: frame.paramText,
      fontSize: frame.paramFontSize * scale,
      color: frame.paramColor,
      weight: 'normal',
    });
  }
  if (frame.showDate) {
    lines.push({
      text: formatDate(frame.dateFormat),
      fontSize: frame.dateFontSize * scale,
      color: frame.dateColor,
      weight: 'normal',
    });
  }

  if (lines.length === 0) return;

  // 计算块尺寸
  let maxTextWidth = 0;
  let contentHeight = 0;
  const lineGap = 4 * scale;

  lines.forEach((line) => {
    ctx.font = `${line.weight} ${line.fontSize}px Arial, "Microsoft YaHei"`;
    const w = ctx.measureText(line.text).width;
    maxTextWidth = Math.max(maxTextWidth, w);
    contentHeight += line.fontSize + lineGap;
  });
  contentHeight -= lineGap;

  const blockWidth = maxTextWidth + padding * 2;
  const blockHeight = contentHeight + padding * 2;

  // 块位置（按锚点）
  const { x: blockX, y: blockY } = calculatePosition(
    frame.anchor,
    frame.offsetX * scale,
    frame.offsetY * scale,
    canvasWidth,
    canvasHeight,
    blockWidth,
    blockHeight
  );

  // 绘制背景（圆角矩形）
  const radius = frame.borderRadius * scale;
  ctx.save();
  ctx.fillStyle = frame.backgroundColor;
  roundRect(ctx, blockX, blockY, blockWidth, blockHeight, radius);
  ctx.fill();

  // 绘制文本
  let textY = blockY + padding;
  lines.forEach((line, idx) => {
    ctx.font = `${line.weight} ${line.fontSize}px Arial, "Microsoft YaHei"`;
    ctx.fillStyle = line.color;
    ctx.textBaseline = 'top';

    let textX: number;
    if (isCenter) {
      ctx.textAlign = 'center';
      textX = blockX + blockWidth / 2;
    } else {
      ctx.textAlign = 'left';
      textX = blockX + padding;
    }
    ctx.fillText(line.text, textX, textY);

    // 分隔线（品牌下方）
    if (idx === 0 && frame.showDivider && frame.brandText && lines.length > 1) {
      const dividerY = textY + line.fontSize + lineGap / 2;
      ctx.strokeStyle = frame.dividerColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(blockX + padding, dividerY);
      ctx.lineTo(blockX + blockWidth - padding, dividerY);
      ctx.stroke();
    }

    textY += line.fontSize + lineGap;
  });
  ctx.restore();
}

/**
 * 圆角矩形路径
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * 触发浏览器下载
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 生成导出文件名
 */
export function buildFilename(
  original: string,
  index: number,
  format: string,
  preserveOriginal: boolean
): string {
  const ext = format === 'jpg' ? 'jpg' : format;
  if (preserveOriginal) {
    const base = original.replace(/\.[^.]+$/, '');
    return `${base}_watermark.${ext}`;
  }
  return `watermark_${String(index + 1).padStart(3, '0')}.${ext}`;
}
