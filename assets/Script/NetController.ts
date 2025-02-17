import { _decorator, Component } from 'cc';
import {
    ApplyBattleReqMessage, ApplyBattleRespMessage, BattleResultBroadMessage,
    BattleStateBroadMessage, CancelMatchReqMessage, ErrorMessage, LoginReqMessage,
    LoginRespMessage, MatchResultBroadMessage, MessageType, OperationReqMessage,
    OperationRespMessage
} from './Message';
import { GameManager } from './GameManager';
const { ccclass } = _decorator;

@ccclass('NetController')
export class NetController extends Component {

    private ws: WebSocket = null;
    private gameManager: GameManager = null;

    constructor(gameManager: GameManager) {
        super();
        this.gameManager = gameManager;
    }

    start() {
        this.connectWebSocket();
    }

    connectWebSocket() {
        if (this.ws) {
            this.ws.close();
        }

        // 从配置中获取 WebSocket URL
        // ws = new WebSocket("ws://193.112.97.237:8080/ws");
        const wsUrl = "ws://127.0.0.1:8080/ws"; // TODO: 替换为配置值
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log("WebSocket connected.");
        };

        this.ws.onmessage = (event) => this.onMessage(event);

        this.ws.onerror = (event) => {
            console.error("WebSocket encountered an error:", event);
        };

        this.ws.onclose = (event) => {
            console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
            setTimeout(() => this.connectWebSocket(), 3000); // 3秒后尝试重连
        };
    }

    /**
     * 发送消息到服务器
     * @param message 消息对象
     */
    private sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const json = message.message2JSON();
            this.ws.send(json);
            console.log("Sent message:", json);
        } else {
            console.error("WebSocket is not open.");
        }
    }

    login(userName: string): void {
        const loginReq = new LoginReqMessage();
        loginReq.userName = userName;
        this.sendMessage(loginReq);
    }

    applyBattle(weaponType: number) {
        const applyBattleReq = new ApplyBattleReqMessage();
        applyBattleReq.weaponType = weaponType;
        this.sendMessage(applyBattleReq);
    }

    cancelMatch() {
        const cancelMatchReq = new CancelMatchReqMessage();
        this.sendMessage(cancelMatchReq);
    }

    applyAttack(roleId: number, x: number, y: number, lastAngle: number) {
        const operationReq = new OperationReqMessage();
        operationReq.roleId = roleId;
        operationReq.setPositionX(x);
        operationReq.setPositionY(y);
        operationReq.setFaceAngle(lastAngle);
        this.sendMessage(operationReq);
    }

    onMessage(event: MessageEvent): void {
        console.log("Received message:", event.data);
        let jsonData = null;
        try {
            jsonData = JSON.parse(event.data);
        } catch (e) {
            console.error("Failed to parse message:", e);
            return;
        }

        switch (jsonData.id) {
            case MessageType.LOGIN_RESP:
                const loginRespMessage = LoginRespMessage.fromJSON<LoginRespMessage>(event.data, LoginRespMessage);
                this.onLoginResp(loginRespMessage);
                break;
            case MessageType.APPLY_BATTLE_RESP:
                const applyBattleRespMessage = ApplyBattleRespMessage.fromJSON<ApplyBattleRespMessage>(event.data, ApplyBattleRespMessage);
                this.onApplyBattleResp(applyBattleRespMessage);
                break;
            case MessageType.CANCEL_MATCH_RESP:
                this.onMatchCancel();
                break;
            case MessageType.OPERATION_RESP:
                const operationRespMessage = OperationRespMessage.fromJSON<OperationRespMessage>(event.data, OperationRespMessage);
                this.onOperationResp(operationRespMessage);
                break;
            case MessageType.MATCH_RESULT_BROAD:
                const matchResultBroadMessage = MatchResultBroadMessage.fromJSON<MatchResultBroadMessage>(event.data, MatchResultBroadMessage);
                this.onMatchResultBroad(matchResultBroadMessage);
                break;
            case MessageType.BATTLE_START_PUSH:
                this.onBattleStart();
                break;
            case MessageType.BATTLE_RESULT_BROAD:
                const battleResultBroadMessage = BattleResultBroadMessage.fromJSON<BattleResultBroadMessage>(event.data, BattleResultBroadMessage);
                this.onBattleResultBroad(battleResultBroadMessage);
                break;
            case MessageType.BATTLE_STATE_BROAD:
                const battleStateBroadMessage = BattleStateBroadMessage.fromJSON<BattleStateBroadMessage>(event.data, BattleStateBroadMessage);
                this.onBattleStateChange(battleStateBroadMessage.battleState);
                break;
            case MessageType.ERROR_MESSAGE:
                const errorMessage = ErrorMessage.fromJSON<ErrorMessage>(event.data, ErrorMessage);
                this.onError(errorMessage);
                break;
            default:
                console.warn("Unknown message received:", event.data);
                break;
        }
    }

    onError(errorMessage: ErrorMessage) {
        console.error(`Request ${errorMessage.reqId} failed with error code: ${errorMessage.errorCode}`);
        // TODO: 处理错误，例如通知用户或重试
    }

    onLoginResp(loginRespMessage: LoginRespMessage) {
        if (loginRespMessage.success) {
            console.log("Login successful for player:", loginRespMessage.playerId);
            this.gameManager.afterLogin(loginRespMessage.playerId);
        } else {
            console.error("Login failed.");
            // TODO: 处理登录失败
        }
    }

    onApplyBattleResp(applyBattleRespMessage: ApplyBattleRespMessage) {
        this.gameManager.onApplyBattleResp(applyBattleRespMessage.roleId, applyBattleRespMessage.weaponType);
    }

    onMatchCancel() {
        console.log("Match canceled.");
        // TODO: 实现取消匹配的逻辑
    }

    onMatchResultBroad(matchResultBroadMessage: MatchResultBroadMessage) {
        this.gameManager.onMatchResultBroad(matchResultBroadMessage.roles);
    }

    onBattleStart(): void {
        this.gameManager.battleStart();
    }

    onBattleStateChange(battleState: number) {
        this.gameManager.onBattleStateChange(battleState);
    }

    onOperationResp(operationRespMessage: OperationRespMessage) {
        console.log("Operation response received.");
        // TODO: 实现操作响应的逻辑
    }

    onBattleResultBroad(battleResultBroadMessage: BattleResultBroadMessage) {
        console.log("Battle result received:", battleResultBroadMessage);
        this.gameManager.onBattleOperation(battleResultBroadMessage.roles);
        // TODO: 处理战斗结果
    }
}