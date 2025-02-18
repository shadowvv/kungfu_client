import { _decorator, Component, Node, Prefab, instantiate, input, Input, EventMouse, UITransform,Vec2,Vec3,Camera } from 'cc';
import { Role } from './Role';
import { ActionType, RoleFactory, WeaponEnum } from './RoleFactory';
import { NetController } from './NetController';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    @property(Prefab)
    private role: Prefab = null; // 角色预制体
    private roleScript: Role = null; // 角色脚本
    private netController: NetController = null; // 网络控制器

    private active: boolean = false; // 是否激活

    private camera: Camera = null;
    private center: Vec2 = new Vec2(0, 0);//世界坐标
    private moveCenter: Vec2 = new Vec2(0, 0);//移动世界坐标
    private lastAngle: number = 0;

    private actionType: ActionType = ActionType.MOVE; // 动作类型

    /**
     * 创建角色
     * @param userName 用户名
     * @param roleId 角色 ID
     * @param weaponType 武器类型
     * @param active 是否激活
     * @param netController 网络控制器
     */
    buildRole(userName: string, roleId: number, weaponType: WeaponEnum, active: boolean, netController: NetController): void {
        this.netController = netController;

        if (this.role) {
            const roleNode = instantiate(this.role);
            this.node.addChild(roleNode);

            this.roleScript = roleNode.getComponent(Role); // 使用类名获取组件
            if (this.roleScript) {
                this.roleScript.init(roleId, userName, weaponType);
            } else {
                console.error("Role component not found!");
            }
        } else {
            console.error("Role prefab is not assigned!");
        }
    }

    /**
     * 触发角色动作
     * @param x x 坐标
     * @param y y 坐标
     * @param faceAngle 面向角度
     */
    action(x: number, y: number, faceAngle: number): void {
        if (this.roleScript) {
            this.center.set(x, y);
            this.roleScript.action(x, y, faceAngle);
        } else {
            console.error("Role script is not initialized!");
        }
    }

    onLoad(): void {
        this.camera = this.node.scene.getComponentInChildren(Camera);
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
            if (this.actionType == ActionType.MOVE) {
                this.roleScript.updateBody(this.center);

                this.center = this.moveCenter;
                this.actionType = ActionType.ATTACK;
                this.roleScript.updatePosition(this.center);
            } else if (this.actionType == ActionType.ATTACK) {
                this.actionType = ActionType.WAIT;
                this.netController.applyAttack(this.roleScript.getRoleId(), this.center.x, this.center.y, this.lastAngle);
            }
        }
    }

    onMouseMove(event: EventMouse): void {
        if (!this.active) {
            return;
        }

        const mousePos = new Vec2(event.getLocationX(), event.getLocationY());
        const screenPos = new Vec3(mousePos.x, mousePos.y, 0);
        const tempCenter = this.center.clone();

        if (this.actionType == ActionType.ATTACK) {
            const dir = mousePos.subtract(tempCenter);
            let angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);
            this.lastAngle = (angle + 360) % 360;
            this.roleScript.rotateAttack(this.lastAngle);
        } else if (this.actionType == ActionType.MOVE) {
            let WorldPos = new Vec3();
            this.camera?.screenToWorld(screenPos, WorldPos);

            let finalWorldPos = WorldPos.toVec2();  
            const dir = finalWorldPos.clone().subtract(tempCenter);
            const distance = dir.length();
            if (distance > this.roleScript.getMoveRange()) {
                dir.normalize().multiplyScalar(this.roleScript.getMoveRange());
                finalWorldPos = dir.add(this.center);
            }

            this.moveCenter.set(finalWorldPos.x, finalWorldPos.y);
            this.roleScript.updateBody(this.moveCenter);
        }
    }

    /**
     * 设置角色是否激活
     * @param active 是否激活
     */
    setActive(active: boolean): void {
        this.active = active;
    }
}