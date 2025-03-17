import { _decorator, director} from 'cc';
import {
    ApplyBattleReqMessage, ApplyBattleRespMessage, BaseMessage, BattleResultBroadMessage,
    BattleStartPushMessage,
    BattleStateBroadMessage, CancelMatchReqMessage, CancelMatchRespMessage, ErrorMessage, LoginReqMessage,
    LoginRespMessage, MatchResultBroadMessage, MessageType, OperationReqMessage,
    OperationRespMessage
} from './Message';
import { ServerConfig } from './JsonObject/ServerConfig';
import { ENVIRONMENT } from './GameEnumAndConstants';
import { GlobalEventManager } from './GlobalEventManager';
import { MarqueeManager } from './MarqueeManager';

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
     * 建立 WebSocket 连接
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
            console.log("WebSocket connected.");
            if(isReconnect){
                // this.gameManager.afterReconnect();
            }
        };

        // 收到消息时触发
        this.ws.onmessage = (event) => this.onMessage(event);

        // 发生错误时触发
        this.ws.onerror = (event) => {
            MarqueeManager.addMessage(`WebSocket encountered an error:${event}`);
        };

        // 连接关闭时触发，3 秒后重连
        this.ws.onclose = (event) => {
            MarqueeManager.addMessage(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
            setTimeout(() => this.connectWebSocket(true), serverData.reconnectInterval);
        };
    }

    /**
     * 发送消息到服务器
     * @param message 消息对象
     */
    sendMessage(message: BaseMessage): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const json = message.message2JSON();
            this.ws.send(json);
        } else {
            MarqueeManager.addMessage("WebSocket is not open.");
        }
    }

    /**
     * 处理收到的服务器消息
     * @param event WebSocket 消息事件
     */
    onMessage(event: MessageEvent): void {
        let jsonData = null;
        try {
            jsonData = JSON.parse(event.data);
        } catch (e) {
            MarqueeManager.addMessage(`Failed to parse message:${e}`);
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
            case MessageType.BATTLE_START_PUSH:
                message = BattleStartPushMessage.fromJSON<BattleStartPushMessage>(event.data, BattleStartPushMessage);
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
                MarqueeManager.addMessage(`Unknown message received:${event.data}`);
                break;
        }

        if (message){
            GlobalEventManager.getInstance().emit(message);
        }
    }

    /**
     * 处理错误消息
     * @param errorMessage 错误消息对象
     */
    onError(errorMessage: ErrorMessage): void {
        // TODO: 处理错误，例如通知用户或重试
        MarqueeManager.addMessage(`Request ${errorMessage.reqId} failed with error code: ${errorMessage.errorCode}`);
    }











    /**
     * 申请战斗
     * @param weaponType 武器类型
     */
    applyBattle(weaponType: number): void {
        const applyBattleReq = new ApplyBattleReqMessage();
        applyBattleReq.weaponType = weaponType;
        this.sendMessage(applyBattleReq);  // 发送战斗申请消息
    }

    /**
     * 取消匹配
     */
    cancelMatch(): void {
        const cancelMatchReq = new CancelMatchReqMessage();
        this.sendMessage(cancelMatchReq);  // 发送取消匹配消息
    }

    /**
     * 申请攻击操作
     * @param roleId 角色 ID
     * @param x 坐标 X
     * @param y 坐标 Y
     * @param lastAngle 角色面向的角度
     */
    applyAttack(roleId: number, x: number, y: number, lastAngle: number): void {
        const operationReq = new OperationReqMessage();
        operationReq.roleId = roleId;
        operationReq.setPositionX(x);
        operationReq.setPositionY(y);
        operationReq.setFaceAngle(lastAngle);
        this.sendMessage(operationReq);  // 发送操作请求
    }

    /**
     * 处理登录响应
     * @param loginRespMessage 登录响应消息对象
     */
    onLoginResp(loginRespMessage: LoginRespMessage): void {
        console.log("Login successful for player:", loginRespMessage.playerId);
        director["sceneParams"] = {
            targetScene: "mainScene",
        }
        director.loadScene("loadingScene");
    }

    /**
     * 处理战斗申请响应
     * @param applyBattleRespMessage 战斗申请响应消息对象
     */
    onApplyBattleResp(applyBattleRespMessage: ApplyBattleRespMessage): void {
        // 通知游戏管理器处理战斗申请响应，传递角色 ID 和武器类型
        // this.gameManager.onApplyBattleResp(applyBattleRespMessage.roleId, applyBattleRespMessage.weaponType);
    }

    /**
     * 处理取消匹配的响应
     */
    onMatchCancel(): void {
        console.log("Match canceled.");  // 记录匹配取消
        // TODO: 实现取消匹配的逻辑，例如通知玩家或更新 UI
    }

    /**
     * 处理匹配结果广播
     * @param matchResultBroadMessage 匹配结果广播消息对象
     */
    onMatchResultBroad(matchResultBroadMessage: MatchResultBroadMessage): void {
        // 通知游戏管理器处理匹配结果，传递匹配到的角色信息
        // this.gameManager.onMatchResultBroad(matchResultBroadMessage.roles);
    }

    /**
     * 处理战斗开始的广播
     */
    onBattleStart(): void {
        // 通知游戏管理器战斗开始，更新游戏状态
        // this.gameManager.battleStart();
    }

    /**
     * 处理战斗状态的变化
     * @param battleState 当前战斗状态
     */
    onBattleStateChange(battleState: number): void {
        // 通知游戏管理器战斗状态发生变化
        // this.gameManager.onBattleStateChange(battleState);
    }

    /**
     * 处理操作响应
     * @param operationRespMessage 操作响应消息对象
     */
    onOperationResp(operationRespMessage: OperationRespMessage): void {
        console.log("Operation response received.");  // 记录操作响应
        // TODO: 实现操作响应的逻辑，例如更新角色位置或操作结果
    }

    /**
     * 处理战斗结果广播
     * @param battleResultBroadMessage 战斗结果广播消息对象
     */
    onBattleResultBroad(battleResultBroadMessage: BattleResultBroadMessage): void {
        console.log("Battle result received:", battleResultBroadMessage);  // 记录战斗结果
        // 通知游戏管理器处理战斗结果，传递参与战斗的角色信息
        // this.gameManager.onBattleOperation(battleResultBroadMessage.roles);
        // TODO: 处理战斗结果，例如更新 UI 或显示战斗胜负
    }

}