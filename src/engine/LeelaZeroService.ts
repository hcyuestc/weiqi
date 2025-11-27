// import { Move } from "../types/weiqi";

export class LeelaZeroService {
  private static instance: LeelaZeroService;
  private worker: Worker | null = null;
  private initialized = false;

  private constructor() {
    // 私有构造函数，防止直接实例化
    this.worker = new Worker(new URL('../workers/leela-zero-worker.ts', import.meta.url));
  }

  public static getInstance(): LeelaZeroService {
    if (!LeelaZeroService.instance) {
      LeelaZeroService.instance = new LeelaZeroService();
    }
    return LeelaZeroService.instance;
  }

  /**
   * 初始化Leela Zero服务
   * @param wasmPath WebAssembly文件路径
   * @param weightsPath 权重文件路径
   */
  public async initialize(wasmPath: string, weightsPath: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 创建Web Worker来运行Leela Zero
      this.worker = this.worker || new Worker(new URL('../workers/leela-zero-worker.ts', import.meta.url));
      
      // 等待初始化完成的消息
      await new Promise<void>((resolve, reject) => {
        if (this.worker) {
          this.worker.onmessage = (event) => {
            if (event.data.type === 'initialized') {
              this.initialized = true;
              resolve();
            } else if (event.data.type === 'error') {
              reject(new Error(event.data.message));
            }
          };
          
          this.worker.onerror = (error) => {
            reject(error);
          };
          
          // 发送初始化消息
          this.worker.postMessage({
            type: 'initialize',
            wasmPath,
            weightsPath
          });
        }
      });
    } catch (error) {
      console.error('Failed to initialize Leela Zero:', error);
      throw error;
    }
  }

  /**
   * 获取AI下一步落子位置
   * @param boardState 当前棋盘状态
   * @param player 当前玩家
   * @returns Promise<{row: number, col: number}> 下一步落子位置
   */
  public async getNextMove(boardState: number[][], player: number): Promise<{row: number, col: number}> {
    if (!this.initialized || !this.worker) {
      throw new Error('Leela Zero service is not initialized');
    }

    return new Promise<{row: number, col: number}>((resolve, reject) => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'move') {
          // 移除事件监听器
          if (this.worker) {
            this.worker.removeEventListener('message', handleMessage);
          }
          resolve(event.data.move);
        } else if (event.data.type === 'error') {
          if (this.worker) {
            this.worker.removeEventListener('message', handleMessage);
          }
          reject(new Error(event.data.message));
        }
      };

      if (this.worker) {
        this.worker.addEventListener('message', handleMessage);
        
        // 发送获取下一步的消息
        this.worker.postMessage({
          type: 'getMove',
          boardState,
          player
        });
      }
    });
  }

  /**
   * 终止Leela Zero服务
   */
  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }
}
