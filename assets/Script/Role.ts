import { _decorator, Component, instantiate, Node, Prefab, input, Input, EventMouse, __private, Vec2, UITransform, Label, Vec3 } from 'cc';
import { MoveCircle } from './MoveCircle';
import { AttackRange } from './AttackRange';
import { Body } from './Body';
import { ActionType, BASE_NUMBER, RoleFactory, WeaponEnum } from './RoleFactory';
import { NetController } from './NetController';
const { ccclass, property } = _decorator;

@ccclass('Role')
export class Role extends Component {

    private weaponType: WeaponEnum;
    private actionType: ActionType;

    private username: string;
    private roleId: number;
    private netController: NetController;

    private active: boolean = false;
    private hp: number = 0;
    private attack: number = 0;

    private center: Vec2 = new Vec2(0, 0);//世界坐标
    private moveCenter: Vec2 = new Vec2(0, 0);//移动世界坐标
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

    init(roleId: number, username: string, weapon: WeaponEnum, active: boolean, netContoller: NetController): void {
        this.roleId = roleId;
        this.username = username;
        this.weaponType = weapon;
        this.active = active;
        this.netController = netContoller;
        this.hp = 5;
        this.actionType = ActionType.MOVE;
        this.attack = RoleFactory.getAttack(this.weaponType);
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
        // this.labelNode.setPosition(this.center.x, this.center.y + this.radius + BASE_NUMBER, 0);

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

    action(x: number, y: number, faceAngle: number) {
        this.node.worldPosition = new Vec3(x, y, 0);
        this.actionType = ActionType.ACTION;
        this.center = new Vec2(x, y);
        this.lastAngle = faceAngle;
        this.draw();

        this.actionType = ActionType.MOVE
    }

    onLoad(): void {
        this.center.set(this.node.position.x, this.node.position.y);

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
                this.center = this.moveCenter;
                this.actionType = ActionType.ATTACK;
                this.node.worldPosition = new Vec3(this.center.x, this.center.y, 0);
                if (this.bodyScript) {
                    this.bodyScript.draw();
                }
            } else if (this.actionType == ActionType.ATTACK) {
                this.actionType = ActionType.WAIT;
                this.netController.applyAttack(this.roleId, this.center.x, this.center.y, this.lastAngle);
            }
        }
    }

    onMouseMove(event: EventMouse): void {
        if (!this.active) {
            return;
        }
        const mousePos = new Vec2(event.getLocationX(), event.getLocationY());
        const uiTrans = this.node.getComponent(UITransform);

        const attackRangeParam = RoleFactory.getAttackRange(this.weaponType);

        if (this.actionType == ActionType.ATTACK) {
            const worldVec = this.center.clone();
            const dir = mousePos.subtract(worldVec);
            let angle = Math.atan2(-dir.y, dir.x) * (180 / Math.PI);
            this.lastAngle = (angle + 360) % 360;

            if (this.attackScript) {
                this.attackScript.draw(attackRangeParam.innerRadius, attackRangeParam.outerRadius, attackRangeParam.startAngle, attackRangeParam.endAngle, this.lastAngle);
            }
        } else if (this.actionType == ActionType.MOVE) {
            // 获取鼠标的屏幕坐标
            const mousePos = new Vec2(event.getUILocationX(), event.getUILocationY());
            // 将屏幕坐标转换为节点本地坐标
            const uiTrans = this.node.getComponent(UITransform);
            let localPos = uiTrans.convertToNodeSpaceAR(mousePos.toVec3());
            let nodePos = uiTrans.convertToNodeSpaceAR(this.center.toVec3());

            const dir = localPos.clone().subtract(nodePos);
            const distance = dir.length();
            if (distance > this.radius) {
                dir.normalize().multiplyScalar(this.radius);
                localPos = dir.add(nodePos);
            }
            if (this.attackScript) {
                this.attackScript.draw(attackRangeParam.innerRadius, attackRangeParam.outerRadius, attackRangeParam.startAngle, attackRangeParam.endAngle, this.lastAngle,localPos.toVec2());  // 设置半径和颜色
            }
            if (this.bodyScript) {
                this.bodyScript.draw(localPos.toVec2());
            }
            this.moveCenter = uiTrans.convertToWorldSpaceAR(localPos).toVec2();
        }
    }

    setActive(active: boolean) {
        this.active = active;
    }
}


