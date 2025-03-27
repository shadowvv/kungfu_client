import { EventTarget } from 'cc';
import { BaseMessage, MessageType } from './Message';
import { MarqueeManager } from './MarqueeManager';

/**
 * 全局事件管理器
 */
export class GlobalEventManager {

    private static instance: GlobalEventManager;

    /**
     * 事件目标
     */
    private eventTarget = new EventTarget();

    private constructor() {}

    static getInstance(): GlobalEventManager {
        if (!GlobalEventManager.instance) {
            GlobalEventManager.instance = new GlobalEventManager();
        }
        return GlobalEventManager.instance;
    }

    /** 
     * 发送事件 
     * @param message 消息
     */
    emit(message: BaseMessage): void {
        if (!message || message.id === undefined) {
            MarqueeManager.addMessage(`Invalid message:${message}`);
            return;
        }
        this.eventTarget.emit(message.id.toString(), message);
    }

    /** 
     * 监听事件 
     * @param messageType 消息类型
     * @param callback 回调函数
     */
    on(messageType: MessageType, callback: (message: BaseMessage) => void): void {
        this.eventTarget.on(messageType.toString(), callback);
    }

    /**
     * 解绑事件
     * @param messageType 消息类型
     * @param callback 回调函数 
     */
    off(messageType: MessageType, callback: (message: BaseMessage) => void): void {
        this.eventTarget.off(messageType.toString(), callback);
    }
}
