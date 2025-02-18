import { _decorator, Component, instantiate, Node, Prefab, __private, Vec2, Label, Vec3 } from 'cc';
import { MoveCircle } from './MoveCircle';
import { AttackRange } from './AttackRange';
import { Body } from './Body';
import { ActionType, BASE_NUMBER, RoleFactory, WeaponEnum } from './RoleFactory';
const { ccclass, property } = _decorator;

@ccclass('Role')
export class Role extends Component {
    private weaponType: WeaponEnum;

    private username: string;
    private roleId: number;
    private hp: number = 0;

    private radius: number = 200;
    private lastAngle: number = 0;

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

    init(roleId: number, username: string, weapon: WeaponEnum): void {
        this.roleId = roleId;
        this.username = username;
        this.weaponType = weapon;
        this.hp = 5;
        this.radius = RoleFactory.getMoveRange(this.weaponType);

        this.buildGraph();
    }

    buildGraph(): void {
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

    draw(): void {
        this.title.string = this.username + ": weaponType:" + WeaponEnum[this.weaponType] + " HP:" + this.hp;
        this.labelNode.setPosition(-BASE_NUMBER, this.radius + BASE_NUMBER, 0);
        if (this.bodyScript) {
            this.bodyScript.draw();
        }
        if (this.circleScript) {
            this.radius = RoleFactory.getMoveRange(this.weaponType);
            this.circleScript.draw(this.radius);
        }
        if (this.attackScript) {
            const attackRangeParam = RoleFactory.getAttackRange(this.weaponType);
            this.attackScript.draw(attackRangeParam.innerRadius, attackRangeParam.outerRadius, attackRangeParam.startAngle, attackRangeParam.endAngle, this.lastAngle);  // 设置半径和颜色
        }
    }

    updatePosition(center: Vec2) {
        this.node.worldPosition = new Vec3(center.x, center.y, 0);
    }

    updateBody(center?: Vec2) {
        if (center) {
            this.bodyScript.updatePosition(center);
        }
    }

    updateAttack(lastAngle: number, center?: Vec2) {
        if (this.attackScript) {
            this.attackScript.rotate(lastAngle);
            if (center) {
                this.attackScript.updatePosition(center);
            }
        }
    }

    rotateAttack(lastAngle: number) {
        this.attackScript.rotate(lastAngle);
    }

    action(x: number, y: number, faceAngle: number) {
        this.node.worldPosition = new Vec3(x, y, 0);
        this.lastAngle = faceAngle;
        this.updateAttack(this.lastAngle);
    }

    getRoleId(): number {
        return this.roleId;
    }

    getWeaponType(): WeaponEnum {
        return this.weaponType;
    }

    getMoveRange(): number  {
        return this.radius;
    }
}


