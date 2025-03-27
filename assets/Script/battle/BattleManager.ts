import { _decorator, Component, Node, Prefab, instantiate, Button, RichText, EditBox} from 'cc';
import { Player } from './Player';
import { GameState, getWaitActionTick, getWaitCommandTick } from '../GameEnumAndConstants';
import { NetController } from '../NetController';
import { RoleMessage } from '../Message';
import { Role } from './Role';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class BattleManager extends Component {

    // 玩家数据
    private username: string;
    private playerId: number;
    private roleId: number;

    // 计时器
    private tick: number = 0;
    private lastTick: number = 0;
    private countDownTick: number = 0;

    private netController: NetController = null;// 网络通信
    private gameState: GameState = GameState.LOGIN;// 战斗相关

    // 武器选择按钮
    @property(RichText)
    private titleText: RichText = null;
    @property(Button)
    private bladeButton: Button = null;
    @property(Button)
    private bowButton: Button = null;
    @property(Button)
    private knifeButton: Button = null;
    @property(Button)
    private swordButton: Button = null;
    @property(Button)
    private spearButton: Button = null;

    // 登录相关控件
    @property(Button)
    private loginButton: Button = null;
    @property(EditBox)
    private userNameInputText: EditBox = null;

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
        this.netController = new NetController(this);
        this.netController.connectWebSocket(false);

        this.setWeaponButtonsVisible(false);
    }

    /**
     * 设置武器选择按钮的可见性
     * @param visible 是否可见
     */
    private setWeaponButtonsVisible(visible: boolean): void {
        this.bowButton.node.active = visible;
        this.spearButton.node.active = visible;
        this.knifeButton.node.active = visible;
        this.swordButton.node.active = visible;
        this.bladeButton.node.active = visible;
    }

    /**
     * 重连后的回调
     */ 
    afterReconnect() {
        //TODO: 重连后的逻辑
    }

    /**
     * 处理登录按钮点击事件
     */
    login(): void {
        if (this.userNameInputText.string === "") {
            console.error("用户名不能为空！");
            return;
        }
        this.username = this.userNameInputText.string;
        this.netController.login(this.username);
    }

    /**
     * 登录成功后的回调
     * @param playerId 玩家 ID
     */
    afterLogin(playerId: number): void {
        this.playerId = playerId;

        this.gameState = GameState.CHOOSE_WEAPON;
        this.loginButton.node.active = false;
        this.userNameInputText.node.active = false;
        this.setWeaponButtonsVisible(true);
    }

    /**
     * 处理武器选择按钮点击事件
     * @param event 事件
     * @param weaponType 武器类型
     */
    setWeaponType(event: Event, weaponType: string): void {
        if (this.gameState !== GameState.CHOOSE_WEAPON) {
            return;
        }
        if (this.netController) {
            this.netController.applyBattle(Number.parseInt(weaponType));
        }
    }

    /**
     * 处理申请对战响应
     * @param roleId 角色 ID
     * @param weaponType 武器类型
     */
    onApplyBattleResp(roleId: number, weaponType: number): void {
        this.gameState = GameState.PREPARE;

        this.roleId = roleId;
        this.setWeaponButtonsVisible(false);
    }

    /**
     * 处理匹配结果广播
     * @param roles 角色信息数组
     */
    onMatchResultBroad(roles: RoleMessage[]): void {
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].roleId !== this.roleId) {
                this.createTargetPlayer(roles[i]);
            } else {
                this.createSelfPlayer(roles[i]);
            }
        }
    }

    /**
     * 创建对手角色
     * @param roleData 角色数据
     */
    private createTargetPlayer(roleData: RoleMessage): void {
        if (this.targetPrefab) {
            this.targetNode = instantiate(this.targetPrefab);
            this.node.addChild(this.targetNode);

            this.targetScript = this.targetNode.getComponent(Role);
            if (this.targetScript) {
                this.targetScript.init(roleData.roleId, roleData.userName, roleData.weaponType);
                this.targetScript.action(roleData.getPositionX(), roleData.getPositionY(), roleData.getFaceAngle(),roleData.getHp());
            } else {
                console.error("Target Player component not found!");
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
                this.selfScript.buildRole(roleData.userName, roleData.roleId, roleData.weaponType, true, this.netController);
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
