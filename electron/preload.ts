import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 选择图片
  selectImages: () => ipcRenderer.invoke('select-images'),
  // 选择水印图片
  selectWatermarkImage: () => ipcRenderer.invoke('select-watermark-image'),
  // 选择保存目录
  selectSaveFolder: () => ipcRenderer.invoke('select-save-folder'),
});
