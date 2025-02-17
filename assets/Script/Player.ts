import { _decorator, Component, Node, Prefab, instantiate, Vec2,Vec3 } from 'cc';
import { Role } from './Role';
import { WeaponEnum } from './RoleFactory';
import { NetController } from './NetController';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    @property(Prefab)
    private role: Prefab = null; // 角色预制体
    private roleScript: Role = null; // 角色脚本
    private netController: NetController = null; // 网络控制器

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

        const emptyNode = new Node("emptyNode");
        this.node.addChild(emptyNode);

        if (this.role) {
            const roleNode = instantiate(this.role);
            emptyNode.addChild(roleNode);

            this.roleScript = roleNode.getComponent(Role); // 使用类名获取组件
            if (this.roleScript) {
                this.roleScript.init(roleId, userName, weaponType, active, this.netController);
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
            this.roleScript.action(x, y, faceAngle);
        } else {
            console.error("Role script is not initialized!");
        }
    }

    /**
     * 设置角色是否激活
     * @param active 是否激活
     */
    setActive(active: boolean): void {
        if (this.roleScript) {
            this.roleScript.setActive(active);
        } else {
            console.error("Role script is not initialized!");
        }
    }
}