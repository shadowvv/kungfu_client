import { _decorator, Component, instantiate, Prefab,Node, RichText, Game } from 'cc';
import { Player } from '../battle/Player';
import { Role } from '../battle/Role';
import { GameState, getWaitCommandTick, getWaitActionTick } from '../main/GameEnumAndConstants';
import { RoleMessage } from '../main/Message';
import { GameManager } from '../main/GameManager';
const { ccclass, property } = _decorator;

@ccclass('BattleScene')
export class BattleScene extends Component {
// 玩家数据
    private username: string;
    private playerId: number;
    private roleId: number;

    // 计时器
    private tick: number = 0;
    private lastTick: number = 0;
    private countDownTick: number = 0;

    private gameState: GameState = GameState.WAIT_COMMAND;// 战斗相关

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
        const roles: RoleMessage[] = GameManager.getRoles();
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].roleId !== this.roleId) {
                this.createTargetPlayer(roles[i]);
            } else {
                this.createSelfPlayer(roles[i]);
            }
        }
        this.battleStart();
    }

    /**
     * 重连后的回调
     */ 
    afterReconnect() {
        //TODO: 重连后的逻辑
    }

    /**
     * 创建对手角色
     * @param roleData 角色数据
     */
    private createTargetPlayer(roleData: RoleMessage): void {
        if (this.targetPrefab) {
            this.targetNode = instantiate(this.targetPrefab);
            this.node.addChild(this.targetNode);

            if(this.targetScript == null){
                this.targetScript = this.targetNode.getComponent(Role);
                if (this.targetScript) {
                    this.targetScript.init(roleData.roleId, roleData.userName, roleData.weaponType);
                    this.targetScript.action(roleData.getPositionX(), roleData.getPositionY(), roleData.getFaceAngle(),roleData.getHp());
                } else {
                    console.error("Target Player component not found!");
                }
            }
        }
    }

    /**
     * 创建玩家角色
     * @param roleData 角色数据
     */
    private createSelfPlayer(roleData: RoleMessage): void {
        if (this.selfPrefab) {
            this.selfNode = instantiate(this.selfPrefab);
            this.node.addChild(this.selfNode);

            this.selfScript = this.selfNode.getComponent(Player);
            if (this.selfScript) {
                this.selfScript.buildRole(roleData.userName, roleData.roleId, roleData.weaponType, true, null);
                this.selfScript.action(roleData.getPositionX(), roleData.getPositionY(), roleData.getFaceAngle(),roleData.getHp());
            } else {
                console.error("Self Player component not found!");
            }
        }
    }

    /**
     * 战斗开始
     */
    battleStart(): void {
        this.gameState = GameState.WAIT_COMMAND;
        this.countDownTick = getWaitCommandTick();

        this.tick = performance.now();
        this.lastTick = this.tick;
    }

    /**
     * 处理战斗操作广播
     * @param roles 角色信息数组
     */
    onBattleOperation(roles: RoleMessage[]): void {
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].roleId !== this.roleId) {
                this.targetScript.action(roles[i].getPositionX(), roles[i].getPositionY(), roles[i].getFaceAngle(),roles[i].getHp());
            } else {
                this.selfScript.action(roles[i].getPositionX(), roles[i].getPositionY(), roles[i].getFaceAngle(),roles[i].getHp());
            }
        }
    }

    /**
     * 处理战斗状态变化
     * @param battleState 战斗状态
     */
    onBattleStateChange(battleState: number): void {
        this.gameState = battleState;
        switch (this.gameState) {
            case GameState.WAIT_COMMAND:
                this.countDownTick = getWaitCommandTick();
                this.selfScript.waitCommand();
                break;
            case GameState.WAIT_ACTION:
                this.countDownTick = getWaitActionTick();
                this.selfScript.waitAction();
                break;
            case GameState.ACTION:
                break;
            case GameState.END:
                break;
        }
    }

    /**
     * 处理战斗结束
     * @param winRoleId 胜利角色 ID
     */
    onBattleOver(winRoleId: number): void {
        // TODO: 实现战斗结束逻辑
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
     * 更新 UI 标题
     */
    private updateUI(): void {
        switch (this.gameState) {
            case GameState.LOGIN:
                this.titleText.string = "等待登录";
                break;
                case GameState.CHOOSE_WEAPON:
                this.titleText.string = `${this.username}: 选择角色`;
                break;
            case GameState.PREPARE:
                this.titleText.string = `${this.username}: 正在匹配`;
                break;
            case GameState.WAIT_COMMAND:
                this.titleText.string = `等待${this.username}指令：${this.countDownTick} 秒`;
                break;
            case GameState.WAIT_ACTION:
                this.titleText.string = `等待${this.username}行动：${this.countDownTick} 秒`;
                break;
            case GameState.ACTION:
                this.titleText.string = `${this.username}:行动`;
                break;
            case GameState.END:
                this.titleText.string = "战斗结束";
                break;
        }
    }
}


