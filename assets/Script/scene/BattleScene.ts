import { _decorator, Component, instantiate, Prefab,Node, RichText } from 'cc';
import { Player } from '../battle/Player';
import { Role } from '../battle/Role';
import { BattleState, getWaitCommandTick, getWaitActionTick } from '../main/GameEnumAndConstants';
import { BattleResultBroadMessage, BattleStateBroadMessage, MessageType, OperationRespMessage, RoleMessage } from '../main/Message';
import { GameManager } from '../main/GameManager';
import { GlobalEventManager } from '../main/GlobalEventManager';
const { ccclass, property } = _decorator;

@ccclass('BattleScene')
export class BattleScene extends Component {

    // 计时器
    private tick: number = 0;
    private lastTick: number = 0;
    private countDownTick: number = 0;

    private gameState: BattleState = BattleState.PREPARE;// 战斗相关

    @property(RichText)
    private titleText: RichText = null; // UI 标题文本
    
    // 角色相关控件
    @property(Prefab)
    private selfPrefab: Prefab = null;
    private selfScript: Player = null;
    private selfNode: Node = null;
    @property(Prefab)
    private targetPrefab: Prefab = null;
    private targetScript: Role = null;
    private targetNode: Node = null;

    start() {
        GlobalEventManager.getInstance().on(MessageType.OPERATION_RESP, this.onOperationResp.bind(this));
        GlobalEventManager.getInstance().on(MessageType.BATTLE_RESULT_BROAD, this.onBattleResultBroad.bind(this));
        GlobalEventManager.getInstance().on(MessageType.BATTLE_STATE_BROAD, this.onBattleStateChange.bind(this));

        const roles: RoleMessage[] = GameManager.getRoles();
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].roleId !== GameManager.getPlayerData().getRoleId()) {
                this.createTargetPlayer(roles[i]);
            } else {
                this.createSelfPlayer(roles[i]);
            }
        }
        this.battleStart();
    }

    /**
     * @description 创建对手角色
     * @param roleData 角色数据
     */
    private createTargetPlayer(roleData: RoleMessage): void {
        if (this.targetPrefab) {
            this.targetNode = instantiate(this.targetPrefab);
            this.node.addChild(this.targetNode);

            if(this.targetScript == null){
                this.targetScript = this.targetNode.getComponent(Role);
                if (this.targetScript) {
                    this.targetScript.init(roleData.roleId, roleData.userName, roleData.weaponType,roleData.getPositionX(), roleData.getPositionY(), roleData.getFaceAngle(),roleData.getHp());
                } else {
                    console.error("Target Player component not found!");
                }
            }
        }
    }

    /**
     * @description 创建玩家角色
     * @param roleData 角色数据
     */
    private createSelfPlayer(roleData: RoleMessage): void {
        if (this.selfPrefab) {
            this.selfNode = instantiate(this.selfPrefab);
            this.node.addChild(this.selfNode);

            this.selfScript = this.selfNode.getComponent(Player);
            if (this.selfScript) {
                this.selfScript.init(roleData.userName, roleData.roleId, roleData.weaponType, roleData.getPositionX(), roleData.getPositionY(), roleData.getFaceAngle(),roleData.getHp());
            } else {
                console.error("Self Player component not found!");
            }
        }
    }

    /**
     * @description 战斗开始
     */
    battleStart(): void {
        this.gameState = BattleState.WAIT_COMMAND;
        this.countDownTick = getWaitCommandTick();

        this.tick = performance.now();
        this.lastTick = this.tick;
    }

    /**
     * @description 处理战斗操作广播
     * @param roles 角色信息数组
     */
    onBattleOperation(roles: RoleMessage[]): void {
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].roleId !== GameManager.getPlayerData().getRoleId()) {
                this.targetScript.action(roles[i].getPositionX(), roles[i].getPositionY(), roles[i].getFaceAngle(),roles[i].getHp());
            } else {
                this.selfScript.action(roles[i].getPositionX(), roles[i].getPositionY(), roles[i].getFaceAngle(),roles[i].getHp());
            }
        }
    }

    /**
     * @description 处理战斗状态变化
     * @param battleState 战斗状态
     */
    onBattleStateChange(battleState: BattleStateBroadMessage): void {
        this.gameState = battleState.battleState;
        switch (this.gameState) {
            case BattleState.WAIT_COMMAND:
                this.countDownTick = getWaitCommandTick();
                this.selfScript.waitCommand();
                break;
            case BattleState.WAIT_ACTION:
                this.countDownTick = getWaitActionTick();
                this.selfScript.waitAction();
                break;
            case BattleState.ACTION:
                break;
            case BattleState.END:
                break;
        }
    }

    /**
     * @description 处理战斗结束
     * @param winRoleId 胜利角色 ID
     */
    onBattleOver(winRoleId: number): void {
        // TODO: 实现战斗结束逻辑
    }

    /**
     * @description 重连后的回调
     */ 
    afterReconnect() {
        //TODO: 重连后的逻辑
    }

    update(deltaTime: number): void {
        this.updateUI();

        this.tick += deltaTime;
        if (this.tick - this.lastTick < 1) {
            return;
        }
        this.lastTick = this.tick;
        this.countDownTick = this.countDownTick - 1;
        if (this.countDownTick < 0) {
            this.countDownTick = 0;
        }
    }

    /**
     * @description 更新 UI 标题
     */
    private updateUI(): void {
        switch (this.gameState) {
            case BattleState.WAIT_COMMAND:
                this.titleText.string = `等待${GameManager.getPlayerData().getPlayerName()}指令：${this.countDownTick} 秒`;
                break;
            case BattleState.WAIT_ACTION:
                this.titleText.string = `等待${GameManager.getPlayerData().getPlayerName()}行动：${this.countDownTick} 秒`;
                break;
            case BattleState.ACTION:
                this.titleText.string = `${GameManager.getPlayerData().getPlayerName()}:行动`;
                break;
            case BattleState.END:
                this.titleText.string = "战斗结束";
                break;
        }
    }
    /**
     * @description 处理操作响应
     * @param operationRespMessage 操作响应消息对象
     */
    onOperationResp(operationRespMessage: OperationRespMessage): void {
        console.log("Operation response received.");  // 记录操作响应
        // TODO: 实现操作响应的逻辑，例如更新角色位置或操作结果
    }

    /**
     * @description 处理战斗结果广播
     * @param battleResultBroadMessage 战斗结果广播消息对象
     */
    onBattleResultBroad(battleResultBroadMessage: BattleResultBroadMessage): void {
        console.log("Battle result received:", battleResultBroadMessage);  // 记录战斗结果
        // 通知游戏管理器处理战斗结果，传递参与战斗的角色信息
        this.onBattleOperation(battleResultBroadMessage.roles);
        // TODO: 处理战斗结果，例如更新 UI 或显示战斗胜负
    }
}


