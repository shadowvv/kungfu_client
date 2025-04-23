import { _decorator, Component, Prefab, instantiate, input, Input, EventMouse, Vec2, Vec3, Camera, director } from 'cc';
import { Role } from './Role';
import { ActionType, BattleState, PlayerOperation, WeaponEnum } from '../main/GameEnumAndConstants';
import { GameManager } from '../main/GameManager';
import { OperationReqMessage } from '../main/Message';
const { ccclass, property } = _decorator;

/**
 * 玩家组件
 */
@ccclass('Player')
export class Player extends Component {

    
    @property(Prefab)
    private role: Prefab = null; // 角色预制体
    private roleScript: Role = null; // 角色脚本
    private camera: Camera = null;

    private active: boolean = true; // 是否激活
    private center: Vec2 = new Vec2(0, 0);//世界坐标
    private moveCenter: Vec2 = new Vec2(0, 0);//移动世界坐标
    private currentAngle: number = 0; // 最后角度

    private playerOperation: PlayerOperation = PlayerOperation.STAND;// 战斗相关


    /**
     * @description 创建角色
     * @param userName 用户名
     * @param roleId 角色 ID
     * @param weaponType 武器类型
     * @param active 是否激活
     * @param netController 网络控制器
     */
    init(userName: string, roleId: number, weaponType: WeaponEnum,positionX: number,positionY: number,faceAngle: number,hp: number): void {
        if (this.role) {
            const roleNode = instantiate(this.role);
            this.node.addChild(roleNode);

            this.roleScript = roleNode.getComponent(Role); // 使用类名获取组件
            if (this.roleScript) {
                this.roleScript.init(roleId, userName, weaponType,positionX,positionY,faceAngle,hp);

                // 初始化圆心为角色初始位置
                const initialPos = this.roleScript.node.worldPosition;
                this.center.set(initialPos.x, initialPos.y);
                this.moveCenter.set(initialPos.x, initialPos.y);
                this.currentAngle = faceAngle;
            } else {
                GameManager.errorLog("Role component not found!");
            }
        } else {
            GameManager.errorLog("Role prefab is not assigned!");
        }
    }

    /**
     * @description 等待命令
     */
    waitCommand() {
        this.active = true;
        this.playerOperation = PlayerOperation.MOVE;
    }

    /**
     * @description 触发角色动作
     * @param x x 坐标
     * @param y y 坐标
     * @param faceAngle 面向角度
     * @param hp 血量
     */
    action(x: number, y: number, faceAngle: number,hp:number): void {
        if (this.roleScript) {
            this.center.set(x, y);
            this.moveCenter.set(x, y);
            this.currentAngle = faceAngle;

            this.roleScript.action(x, y, faceAngle,hp);
        } else {
            GameManager.errorLog("Role script is not initialized!");
        }
    }

    /**
     * @description 等待操作
     */
    waitAction() {
        this.roleScript.updateBody(this.center);
        this.roleScript.updateAttack(this.center);
        this.roleScript.rotateAttack(this.currentAngle);
    }

    onLoad(): void {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onDestroy(): void {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onMouseDown(event: EventMouse): void {
        if (!this.active) {
            return;
        }
        if (event.getButton() == 0) {
            if (this.playerOperation == PlayerOperation.MOVE) {
                this.playerOperation = PlayerOperation.ATTACK;
                this.roleScript.updateBody(this.center);
                this.roleScript.updateAttack(this.center);

                this.center.set(this.moveCenter.x, this.moveCenter.y);
                this.roleScript.updatePosition(this.center);
            } else if (this.playerOperation == PlayerOperation.ATTACK) {
                this.playerOperation = PlayerOperation.ACTION;
                this.active = false;
                this.applyAttack(this.roleScript.getRoleId(), this.center.x, this.center.y, this.currentAngle);
            }
        }
        if (event.getButton() == 2) {
            if (this.playerOperation == PlayerOperation.ATTACK) {
                this.playerOperation = PlayerOperation.MOVE;
            }
        }
    }

    /**
     * @description 申请攻击操作
     * @param roleId 角色 ID
     * @param x 坐标 X
     * @param y 坐标 Y
     * @param lastAngle 角色面向的角度
     */
    private applyAttack(roleId: number, x: number, y: number, lastAngle: number): void {
        const operationReq = new OperationReqMessage();
        operationReq.roleId = roleId;
        operationReq.setPositionX(x);
        operationReq.setPositionY(y);
        operationReq.setFaceAngle(lastAngle);
        GameManager.sendMessage(operationReq);  // 发送操作请求
    }

    onMouseMove(event: EventMouse): void {
        if (!this.active) {
            return;
        }

        const mousePos = new Vec2(event.getLocationX(), event.getLocationY());
        const screenPos = new Vec3(mousePos.x, mousePos.y, 0);

        if (this.playerOperation == PlayerOperation.ATTACK) {
            const dir = mousePos.subtract(this.center);
            let angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);
            this.currentAngle = (angle + 360) % 360;
            this.roleScript.rotateAttack(this.currentAngle);
        } else if (this.playerOperation == PlayerOperation.MOVE) {
            let WorldPos = new Vec3();
            this.camera = director.getScene().getComponentInChildren(Camera);
            this.camera?.screenToWorld(screenPos, WorldPos);

            let finalWorldPos = WorldPos.toVec2();
            const dir = finalWorldPos.clone().subtract(this.center);
            const distance = dir.length();
            if (distance > this.roleScript.getMoveRange()) {
                dir.normalize().multiplyScalar(this.roleScript.getMoveRange());
                finalWorldPos = dir.add(this.center);
            }

            this.moveCenter.set(finalWorldPos.x, finalWorldPos.y);

            this.roleScript.updateBody(this.moveCenter);
            this.roleScript.updateAttack(this.moveCenter);
        }
    }

}