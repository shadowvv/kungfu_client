import { _decorator, Component, __private, Vec2, Label, Vec3, Tween, tween } from 'cc';
import { MoveCircle } from './MoveCircle';
import { AttackRange } from './AttackRange';
import { Body } from './Body';
import { ActionType, getBaseNumber, WeaponEnum } from '../main/GameEnumAndConstants';
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

    @property(Label)
    private title: Label = null;
    @property(Body)
    private body: Body = null;
    @property(MoveCircle)
    private moveCircle: MoveCircle = null;
    @property(AttackRange)
    private attackRange: AttackRange = null;

    /**
     * @description 初始化角色
     * @param roleId 角色 ID
     * @param username 用户名 
     * @param weapon 武器类型 
     */
    init(roleId: number, username: string, weapon: WeaponEnum,positionX: number,positionY: number,faceAngle: number,hp: number): void {
        this.roleId = roleId;
        this.username = username;
        this.weaponType = weapon;

        const WeaponData = WeaponConfig.getInstance().getWeaponById(weapon);
        this.hp = WeaponData.hp;
        this.radius = WeaponConfig.getInstance().getWeaponById(weapon).moveRange * getBaseNumber();

        this.buildGraph();
        this.action(positionX, positionY, faceAngle, hp);
    }

    /**
     * @description 构建角色图形
     */
    private buildGraph(): void {
        this.title.fontSize = 24;
        this.draw();
    }

    /**
     * @description 绘制角色图形
     */
    private draw(): void {
        this.title.string = this.username + ": weaponType:" + WeaponEnum[this.weaponType] + " HP:" + this.hp;
        // this.title.node.setPosition(-getBaseNumber(), this.radius + getBaseNumber(), 0);

        this.moveCircle.draw(this.radius);
        this.body.initBody(this.weaponType,this.faceAngle); 
        const attackRangeParam = WeaponConfig.getInstance().getWeaponById(this.weaponType);
        this.attackRange.draw(attackRangeParam.innerRadius * getBaseNumber(), attackRangeParam.outerRadius * getBaseNumber(), attackRangeParam.startAngle, attackRangeParam.endAngle, this.faceAngle);  // 设置半径和颜色
    }

    /**
     * @description 更新角色世界坐标位置
     * @param center 圆心坐标
     */
    updatePosition(center: Vec2) {
        this.node.worldPosition = new Vec3(center.x, center.y, 0);
    }

    /**
     * @description 更新角色移动范围
     * @param center 圆心坐标
     */
    updateBody(center: Vec2) {
        this.body.updatePosition(center);
    }

    /**
     * @description 更新角色攻击范围
     * @param center 圆心坐标
     */
    updateAttack(center: Vec2) {
        this.attackRange.updatePosition(center);
    }

    /**
     * @description 旋转角色攻击范围
     * @param lastAngle 旋转角度
     */
    rotateAttack(lastAngle: number) {
        this.attackRange.rotate(lastAngle);
        this.body.rotate(lastAngle);
    }

    /**
     * @description 触发角色动作
     * @param x x 坐标
     * @param y y 坐标
     * @param faceAngle 面向角度
     * @param hp 血量
     */
    action(x: number, y: number, faceAngle: number,hp:number) {
        const center = new Vec2(x, y);
        this.rotateAttack(faceAngle);

        // this.node.worldPosition = ;
        this.faceAngle = faceAngle;
        this.hp = hp;

        this.title.string = this.username + ": weaponType:" + WeaponEnum[this.weaponType] + " HP:" + this.hp;
        this.body.moveTo(x,y);
        
        // 使用 Tween 实现平滑移动
        Tween.stopAllByTarget(this.node); // 停止所有针对该节点的Tween动画
        tween(this.node)
            .to(1, { worldPosition: new Vec3(x, y, 0) }) // 在1秒内移动到目标位置
            .call(() => {
                // 移动结束后播放攻击动画
                this.body.attack(faceAngle);
            })
            .start();
        // this.body.idle(faceAngle);
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


