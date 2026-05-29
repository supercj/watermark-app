import type { IpcRenderer } from 'electron';

interface ElectronAPI {
  selectImages: () => Promise<string[]>;
  selectWatermarkImage: () => Promise<string | null>;
  selectSaveFolder: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
