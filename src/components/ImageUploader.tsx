import { useCallback, useEffect, useState } from 'react';
import { electronAPI } from '../lib/electron-api';
import type { ImageItem } from '../types';

interface Props {
  images: ImageItem[];
  onImagesAdd: (paths: string[]) => void;
  onImageRemove: (id: string) => void;
  onImageSelect: (index: number) => void;
  currentIndex: number;
}

export function ImageUploader({
  images,
  onImagesAdd,
  onImageRemove,
  onImageSelect,
  currentIndex,
}: Props) {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());

  // 将本地路径转换为可用的 URL
  const getLocalFileUrl = useCallback((filePath: string): string => {
    if (filePath.startsWith('blob:') || filePath.startsWith('file://') || filePath.startsWith('local-file://')) {
      return filePath;
    }
    // 使用 local-file:// 协议
    return `local-file://${filePath}`;
  }, []);

  // 为每个图片生成预览
  useEffect(() => {
    images.forEach((img) => {
      if (!previews.has(img.id) && img.path) {
        const url = getLocalFileUrl(img.path);
        setPreviews((prev) => new Map(prev).set(img.id, url));
      }
    });
  }, [images, getLocalFileUrl]);

  // 选择图片
  const handleSelectImages = useCallback(async () => {
    const paths = await electronAPI.selectImages();
    if (paths.length > 0) {
      onImagesAdd(paths);
    }
  }, [onImagesAdd]);

  return (
    <div className="image-uploader">
      <div className="uploader-header">
        <h3>图片列表 ({images.length})</h3>
        <button onClick={handleSelectImages} className="btn-primary">
          + 添加图片
        </button>
      </div>
      
      <div className="image-list">
        {images.length === 0 ? (
          <div className="empty-tip">
            <p>暂无图片，点击上方按钮添加</p>
          </div>
        ) : (
          images.map((img, index) => (
            <div
              key={img.id}
              className={`image-item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onImageSelect(index)}
            >
              <div className="image-preview">
                {previews.get(img.id) ? (
                  <img src={previews.get(img.id)} alt={img.name} />
                ) : (
                  <div className="placeholder">加载中...</div>
                )}
              </div>
              <div className="image-name">{img.name}</div>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageRemove(img.id);
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
