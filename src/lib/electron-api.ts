// Electron API 封装
// 在浏览器环境提供模拟实现，在 Electron 环境使用真实 API

const isElectron = typeof window !== 'undefined' && window.electronAPI;

// 模拟 API（浏览器环境使用）
const mockApi = {
  selectImages: async (): Promise<string[]> => {
    // 使用 input file 选择文件
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          const paths: string[] = [];
          Array.from(files).forEach((file) => {
            // 创建本地预览 URL
            const url = URL.createObjectURL(file);
            paths.push(url);
          });
          resolve(paths);
        } else {
          resolve([]);
        }
      };
      input.click();
    });
  },
  selectWatermarkImage: async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files[0]) {
          resolve(URL.createObjectURL(files[0]));
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  },
  selectSaveFolder: async (): Promise<string | null> => {
    // 浏览器环境无法选择文件夹，提示用户
    alert('请在 Electron 环境中使用此功能');
    return null;
  },
};

// 导出统一的 API
export const electronAPI = isElectron ? window.electronAPI : mockApi;
