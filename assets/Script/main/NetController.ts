import { _decorator } from 'cc';
import {
    ApplyBattleRespMessage, BaseMessage, BattleResultBroadMessage,
    BattleStartBroadMessage,
    BattleStateBroadMessage, CancelMatchRespMessage, ErrorMessage,
    LoginRespMessage, MatchResultBroadMessage, MessageType,
    OperationRespMessage
} from './Message';
import { ServerConfig } from '../JsonObject/ServerConfig';
import { ENVIRONMENT } from './GameEnumAndConstants';
import { GlobalEventManager } from './GlobalEventManager';
import { GameManager } from './GameManager';

/**
 * 网络控制器，负责处理 WebSocket 连接和消息的发送和接收
 */
export class NetController {

    /**
     * WebSocket 连接对象
     */
    private ws: WebSocket = null;

    constructor() {
        GlobalEventManager.getInstance().on(MessageType.ERROR_MESSAGE, this.onError.bind(this));
    }

    /**
     * @description 建立 WebSocket 连接
     */
    connectWebSocket(isReconnect:boolean): void {
        if (this.ws) {
            this.ws.close();  // 如果已有连接，关闭它
        }

        // 获取服务器配置
        const serverData = ServerConfig.getInstance().getServerData(ENVIRONMENT);

        // WebSocket 连接的 URL
        const wsUrl = `ws://${serverData.serverHost}/ws`;
        this.ws = new WebSocket(wsUrl);  // 创建新的 WebSocket 连接

        // 连接成功时触发
        this.ws.onopen = () => {
            GameManager.infoLog("WebSocket connected.");
            if(isReconnect){
                // this.gameManager.afterReconnect();
            }
        };

        // 收到消息时触发
        this.ws.onmessage = (event) => this.onMessage(event);

        // 发生错误时触发
        this.ws.onerror = (event) => {
            GameManager.errorLog(`WebSocket encountered an error:${event}`);
        };

        // 连接关闭时触发，3 秒后重连
        this.ws.onclose = (event) => {
            GameManager.errorLog(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
            setTimeout(() => this.connectWebSocket(true), serverData.reconnectInterval);
        };
    }

    /**
     * @description 发送消息到服务器
     * @param message 消息对象
     */
    sendMessage(message: BaseMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const json = message.message2JSON();
            this.ws.send(json);
        } else {
            GameManager.errorLog("WebSocket is not open.");
        }
    }

    /**
     * @description 处理收到的服务器消息
     * @param event WebSocket 消息事件
     */
    onMessage(event: MessageEvent): void {
        let jsonData = null;
        try {
            jsonData = JSON.parse(event.data);
        } catch (e) {
            GameManager.errorLog(`Failed to parse message:${e}`);
            return;
        }

        // 根据消息类型进行处理
        let message: BaseMessage = null;
        switch (jsonData.id) {
            case MessageType.LOGIN_RESP:
                message = LoginRespMessage.fromJSON<LoginRespMessage>(event.data, LoginRespMessage);
                break;
            case MessageType.APPLY_BATTLE_RESP:
                message = ApplyBattleRespMessage.fromJSON<ApplyBattleRespMessage>(event.data, ApplyBattleRespMessage);
                break;
            case MessageType.CANCEL_MATCH_RESP:
                message = CancelMatchRespMessage.fromJSON<CancelMatchRespMessage>(event.data, CancelMatchRespMessage);
                break;
            case MessageType.OPERATION_RESP:
                message = OperationRespMessage.fromJSON<OperationRespMessage>(event.data, OperationRespMessage);
                break;
            case MessageType.MATCH_RESULT_BROAD:
                message = MatchResultBroadMessage.fromJSON<MatchResultBroadMessage>(event.data, MatchResultBroadMessage);
                break;
            case MessageType.BATTLE_START_BROAD:
                message = BattleStartBroadMessage.fromJSON<BattleStartBroadMessage>(event.data, BattleStartBroadMessage);
                break;
            case MessageType.BATTLE_RESULT_BROAD:
                message = BattleResultBroadMessage.fromJSON<BattleResultBroadMessage>(event.data, BattleResultBroadMessage);
                break;
            case MessageType.BATTLE_STATE_BROAD:
                message = BattleStateBroadMessage.fromJSON<BattleStateBroadMessage>(event.data, BattleStateBroadMessage);
                break;
            case MessageType.ERROR_MESSAGE:
                message = ErrorMessage.fromJSON<ErrorMessage>(event.data, ErrorMessage);
                break;
            default:
                GameManager.errorLog(`Unknown message received:${event.data}`);
                break;
        }

        if (message){
            GlobalEventManager.getInstance().emit(message);
        }
    }

    /**
     * @description 处理错误消息
     * @param errorMessage 错误消息对象
     */
    onError(errorMessage: ErrorMessage): void {
        // TODO: 处理错误，例如通知用户或重试
        GameManager.errorLog(`Request ${errorMessage.reqId} failed with error code: ${errorMessage.errorCode}`);
    }

    closeWebSocket() {
        
    }

}