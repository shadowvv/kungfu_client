import { _decorator, Component, instantiate, Node, Prefab, __private, Vec2, Label, Vec3 } from 'cc';
import { MoveCircle } from './MoveCircle';
import { AttackRange } from './AttackRange';
import { Body } from './Body';
import { getBaseNumber, WeaponEnum } from '../GameEnumAndConstants';
import { WeaponConfig } from '../JsonObject/WeaponConfig';
const { ccclass, property } = _decorator;

/**
 * 角色组件
 */
@ccclass('Role')
export class Role extends Component {

    private username: string;
    private roleId: number;
    private hp: number = 0;

    private weaponType: WeaponEnum;
    private radius: number;
    private faceAngle: number = 0;

    private title: Label = null;
    private labelNode: Node = null;
    @property(Prefab)
    private body: Prefab = null;
    private bodyScript: Body = null;
    @property(Prefab)
    private moveCircle: Prefab = null;
    private circleScript: MoveCircle = null;
    @property(Prefab)
    private attackRange: Prefab = null;
    private attackScript: AttackRange = null;

    /**
     * 初始化角色
     * @param roleId 角色 ID
     * @param username 用户名 
     * @param weapon 武器类型 
     */
    init(roleId: number, username: string, weapon: WeaponEnum): void {
        this.roleId = roleId;
        this.username = username;
        this.weaponType = weapon;

        const WeaponData = WeaponConfig.getInstance().getWeaponById(weapon);
        this.hp = WeaponData.hp;
        this.radius = WeaponConfig.getInstance().getWeaponById(weapon).moveRange * getBaseNumber();

        this.buildGraph();
    }

    /**
     * 构建角色图形
     */
    private buildGraph(): void {
        const emptyNode = new Node("emptyNode");
        this.node.addChild(emptyNode);

        this.labelNode = new Node('LabelNode');
        emptyNode.addChild(this.labelNode);
        this.title = this.labelNode.addComponent(Label);
        this.title.fontSize = 24;

        if (this.body) {
            const bodyNode = instantiate(this.body);
            emptyNode.addChild(bodyNode);
            this.bodyScript = bodyNode.getComponent(Body);
        }
        if (this.moveCircle) {
            const circleNode = instantiate(this.moveCircle);
            emptyNode.addChild(circleNode);
            this.circleScript = circleNode.getComponent(MoveCircle);
        }
        if (this.attackRange) {
            const attackRangeNode = instantiate(this.attackRange);
            emptyNode.addChild(attackRangeNode);
            this.attackScript = attackRangeNode.getComponent(AttackRange);
        }
        this.draw();
    }

    /**
     * 绘制角色图形
     */
    private draw(): void {
        this.title.string = this.username + ": weaponType:" + WeaponEnum[this.weaponType] + " HP:" + this.hp;
        this.labelNode.setPosition(-getBaseNumber(), this.radius + getBaseNumber(), 0);
        if (this.bodyScript) {
            this.bodyScript.draw();
        }
        if (this.circleScript) {
            this.circleScript.draw(this.radius);
        }
        if (this.attackScript) {
            const attackRangeParam = WeaponConfig.getInstance().getWeaponById(this.weaponType);
            this.attackScript.draw(attackRangeParam.innerRadius * getBaseNumber(), attackRangeParam.outerRadius * getBaseNumber(), attackRangeParam.startAngle, attackRangeParam.endAngle, this.faceAngle);  // 设置半径和颜色
        }
    }

    /**
     * 更新角色世界坐标位置
     * @param center 圆心坐标
     */
    updatePosition(center: Vec2) {
        this.node.worldPosition = new Vec3(center.x, center.y, 0);
    }

    /**
     * 更新角色移动范围
     * @param center 圆心坐标
     */
    updateBody(center: Vec2) {
        this.bodyScript.updatePosition(center);
    }

    /**
     * 更新角色攻击范围
     * @param center 圆心坐标
     */
    updateAttack(center: Vec2) {
        this.attackScript.updatePosition(center);
    }

    /**
     * 旋转角色攻击范围
     * @param lastAngle 旋转角度
     */
    rotateAttack(lastAngle: number) {
        this.attackScript.rotate(lastAngle);
    }

    /**
     * 触发角色动作
     * @param x x 坐标
     * @param y y 坐标
     * @param faceAngle 面向角度
     * @param hp 血量
     */
    action(x: number, y: number, faceAngle: number,hp:number) {
        const center = new Vec2(x, y);
        this.rotateAttack(faceAngle);

        this.node.worldPosition = new Vec3(x, y, 0);
        this.faceAngle = faceAngle;
        this.hp = hp;
    }

    /**
     * @returns 获取角色 ID
     */
    getRoleId(): number {
        return this.roleId;
    }

    /**
     * @returns 获取角色移动范围
     */
    getMoveRange(): number {
        return this.radius;
    }

    /**
     * @returns 获取角色武器类型
     */
    getWeaponType(): WeaponEnum {
        return this.weaponType;
    }
}


