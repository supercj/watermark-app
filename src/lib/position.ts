import type { AnchorPosition } from '../types';

/**
 * 根据锚点和偏移计算实际像素坐标
 */
export function calculatePosition(
  anchor: AnchorPosition,
  offsetX: number,
  offsetY: number,
  canvasWidth: number,
  canvasHeight: number,
  itemWidth: number,
  itemHeight: number
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  // 水平定位
  if (anchor.includes('left')) {
    x = offsetX;
  } else if (anchor.includes('right')) {
    x = canvasWidth - itemWidth - offsetX;
  } else {
    // center
    x = (canvasWidth - itemWidth) / 2 + offsetX;
  }

  // 垂直定位
  if (anchor.includes('top')) {
    y = offsetY;
  } else if (anchor.includes('bottom')) {
    y = canvasHeight - itemHeight - offsetY;
  } else {
    // center
    y = (canvasHeight - itemHeight) / 2 + offsetY;
  }

  return { x, y };
}

/**
 * 根据像素坐标反推锚点和偏移（用于拖拽后更新）
 */
export function reversePosition(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  itemWidth: number,
  itemHeight: number
): { anchor: AnchorPosition; offsetX: number; offsetY: number } {
  // 判断水平区域
  const centerX = (canvasWidth - itemWidth) / 2;
  let hPos: 'left' | 'center' | 'right';
  let offsetX: number;

  if (x < canvasWidth / 3) {
    hPos = 'left';
    offsetX = x;
  } else if (x > canvasWidth * 2 / 3 - itemWidth) {
    hPos = 'right';
    offsetX = canvasWidth - itemWidth - x;
  } else {
    hPos = 'center';
    offsetX = x - centerX;
  }

  // 判断垂直区域
  const centerY = (canvasHeight - itemHeight) / 2;
  let vPos: 'top' | 'center' | 'bottom';
  let offsetY: number;

  if (y < canvasHeight / 3) {
    vPos = 'top';
    offsetY = y;
  } else if (y > canvasHeight * 2 / 3 - itemHeight) {
    vPos = 'bottom';
    offsetY = canvasHeight - itemHeight - y;
  } else {
    vPos = 'center';
    offsetY = y - centerY;
  }

  // 组合锚点
  let anchor: AnchorPosition;
  if (vPos === 'center' && hPos === 'center') {
    anchor = 'center';
  } else if (vPos === 'center') {
    anchor = `center-${hPos}` as AnchorPosition;
  } else if (hPos === 'center') {
    anchor = `${vPos}-center` as AnchorPosition;
  } else {
    anchor = `${vPos}-${hPos}` as AnchorPosition;
  }

  return { anchor, offsetX: Math.round(offsetX), offsetY: Math.round(offsetY) };
}

/**
 * 锚点中文名称
 */
export const anchorNames: Record<AnchorPosition, string> = {
  'top-left': '左上',
  'top-center': '顶部居中',
  'top-right': '右上',
  'center-left': '左中',
  'center': '居中',
  'center-right': '右中',
  'bottom-left': '左下',
  'bottom-center': '底部居中',
  'bottom-right': '右下',
};
