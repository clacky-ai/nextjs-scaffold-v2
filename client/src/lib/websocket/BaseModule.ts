import { type BaseMessage, type WebSocketModule } from '@/lib/websocket/types';


export abstract class BaseModule<TStore = any> implements WebSocketModule {
  protected store: TStore;
  protected moduleName: string;

  constructor(store: TStore) {
    this.store = store;
    this.moduleName = this.constructor.name;
  }

  // 子类必须实现：返回消息类型到处理方法的映射
  abstract getMessageHandlers(): Record<string, (messageData: BaseMessage) => void>;

  // 子类可以重写：返回需要订阅的事件类型列表
  getSubscriptions(): string[] {
    return [];
  }

  // 工具方法：记录日志
  protected log(message: string, data?: any) {
    console.log(`[${this.moduleName}] ${message}`, data || '');
  }

  // 工具方法：记录错误
  protected error(message: string, error?: any) {
    console.error(`[${this.moduleName}] ${message}`, error || '');
  }

  // 工具方法：记录警告
  protected warn(message: string, data?: any) {
    console.warn(`[${this.moduleName}] ${message}`, data || '');
  }

  // 工具方法：获取消息数据
  protected getMessageData<T = any>(messageData: BaseMessage): T {
    return messageData.data as T;
  }

  // 工具方法：验证消息数据
  protected validateMessageData(messageData: BaseMessage, requiredFields: string[]): boolean {
    const data = this.getMessageData(messageData);
    
    if (!data) {
      this.warn('消息缺少 data 字段', messageData);
      return false;
    }

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.warn(`消息缺少必需字段: ${field}`, messageData);
        return false;
      }
    }

    return true;
  }

  // 工具方法：安全执行处理器
  protected safeExecute(handler: () => void | Promise<void>, errorMessage?: string) {
    try {
      const result = handler();
      // 如果返回 Promise，处理异步错误
      if (result instanceof Promise) {
        result.catch((error) => {
          const msg = errorMessage || '执行异步处理器时出错';
          this.error(msg, error);
        });
      }
    } catch (error) {
      const msg = errorMessage || '执行处理器时出错';
      this.error(msg, error);
    }
  }
}
