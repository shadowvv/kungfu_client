import { _decorator, Component, instantiate, Node, Prefab, input, Input, EventMouse, __private, Vec2, UITransform, Label } from 'cc';
import { MoveCircle } from './MoveCircle';
import { AttackRange } from './AttackRange';
import { Body } from './Body';
import { AcitonType, BASENUMBER, RoleFactory, WeaponEnum } from './RoleFactory';
const { ccclass, property } = _decorator;

@ccclass('Role')
export class Role extends Component {

    private weaponType: WeaponEnum = WeaponEnum.BOW;
    private actionType: AcitonType = AcitonType.MOVE;

    private active: boolean = false;
    private hp: number = 0;
    private attack: number = 0;
    private center: Vec2 = new Vec2(0, 0);
    private moveCenter: Vec2 = new Vec2(0, 0);
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

    init(weapon: WeaponEnum, active: boolean): void {
        this.weaponType = weapon;
        this.radius = RoleFactory.getMoveRange(this.weaponType);
        this.active = active;
        this.draw();
    }

    draw(): void {
        this.hp = 5;
        this.attack = RoleFactory.getAattack(this.weaponType);

        const emptyNode = new Node("emptyNode");
        this.node.addChild(emptyNode);

        this.labelNode = new Node('LabelNode');
        emptyNode.addChild(this.labelNode);
        this.title = this.labelNode.addComponent(Label);
        this.title.string = "weaponType:" + WeaponEnum[this.weaponType] + " HP:" + this.hp;
        this.title.fontSize = 24;
        this.labelNode.setPosition(this.center.x, this.center.y + this.radius + BASENUMBER, 0);

        if (this.body) {
            const bodyNode = instantiate(this.body);
            emptyNode.addChild(bodyNode);
            this.bodyScript = bodyNode.getComponent('Body') as Body;
            if (this.bodyScript) {
                this.bodyScript.draw(this.center);
            }
        }
        if (this.moveCircle) {
            const circleNode = instantiate(this.moveCircle);
            emptyNode.addChild(circleNode);
            this.circleScript = circleNode.getComponent('MoveCircle') as MoveCircle;
            if (this.circleScript) {
                this.radius = RoleFactory.getMoveRange(this.weaponType);
                this.circleScript.draw(this.center, this.radius);
            }
        }
        if (this.attackRange) {
            const attackRangeNode = instantiate(this.attackRange);
            emptyNode.addChild(attackRangeNode);
            this.attackScript = attackRangeNode.getComponent('AttackRange') as AttackRange;
            if (this.attackScript) {
                const attackRangeParam = RoleFactory.getAttackRange(this.weaponType);
                this.attackScript.draw(this.center, attackRangeParam.innerRadius, attackRangeParam.outerRadius, attackRangeParam.startAngle, attackRangeParam.endAngle, this.lastAngle);  // 设置半径和颜色
            }
        }
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
            if (this.actionType == AcitonType.MOVE) {
                this.center = this.moveCenter;
                this.actionType = AcitonType.ATTACK;
                this.circleScript.draw(this.center, this.radius);
                this.labelNode.setPosition(this.center.x, this.center.y + this.radius + BASENUMBER, 0);
            } else if (this.actionType == AcitonType.ATTACK) {
                this.actionType = AcitonType.MOVE;
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

        if (this.actionType == AcitonType.ATTACK) {
            const worldVec = uiTrans.convertToWorldSpaceAR(this.center.toVec3());
            const dir = mousePos.subtract(worldVec.toVec2());
            let angle = -Math.atan2(dir.y, dir.x) * (180 / Math.PI);
            this.lastAngle = (angle + 360) % 360;

            if (this.attackScript) {
                this.attackScript.draw(this.center, attackRangeParam.innerRadius, attackRangeParam.outerRadius, attackRangeParam.startAngle, attackRangeParam.endAngle, this.lastAngle);
            }
        } else if (this.actionType == AcitonType.MOVE) {
            let localPos = uiTrans.convertToNodeSpaceAR(mousePos.toVec3());
            const dir = localPos.subtract(this.center.toVec3());
            const distance = dir.length();

            if (distance > this.radius) {
                dir.normalize().multiplyScalar(this.radius);
                localPos = dir.add(this.center.toVec3());
            }
            if (this.attackScript) {
                this.attackScript.draw(localPos.toVec2(), attackRangeParam.innerRadius, attackRangeParam.outerRadius, attackRangeParam.startAngle, attackRangeParam.endAngle, this.lastAngle);  // 设置半径和颜色
            }
            if (this.bodyScript) {
                this.bodyScript.draw(localPos.toVec2());
            }
            this.moveCenter = localPos.toVec2();
        }
    }

    /**
     * 
     * @returns body的矩形世界坐标
     */
    getBodyRect(): Vec2[] {
        const uiTrans = this.node.getComponent(UITransform);
        const worldVec = uiTrans.convertToWorldSpaceAR(this.center.toVec3());
        const rectVertices = [
            new Vec2(worldVec.x - BASENUMBER / 2, worldVec.y - BASENUMBER),
            new Vec2(worldVec.x + BASENUMBER / 2, worldVec.y - BASENUMBER),
            new Vec2(worldVec.x + BASENUMBER / 2, worldVec.y + BASENUMBER),
            new Vec2(worldVec.x - BASENUMBER / 2, worldVec.y + BASENUMBER)
        ];
        return rectVertices;
    }

    /**
     * 检测是否击中目标
     * @param bodyRect 目标的body矩形世界坐标
     * @returns 是否击中目标
     */
    checkHit(bodyRect: Vec2[]): boolean {
        const uiTrans = this.node.getComponent(UITransform);
        const localPos = uiTrans.convertToWorldSpaceAR(this.moveCenter.toVec3());
        const attackRangeParam = RoleFactory.getAttackRange(this.weaponType);
        return this.isSectorCollidingWithRect(localPos.toVec2(), attackRangeParam.innerRadius, attackRangeParam.outerRadius, attackRangeParam.startAngle - this.lastAngle, attackRangeParam.endAngle - this.lastAngle, bodyRect);
    }

    /**
     * 检查扇形和矩形碰撞
     */
    isSectorCollidingWithRect(center: Vec2, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, rectVertices: Vec2[]): boolean {
        startAngle = (startAngle + 360) % 360;
        endAngle = (endAngle + 360) % 360;
        for (const vertex of rectVertices) {
            if (this.isPointInSector(vertex, center, innerRadius, outerRadius, startAngle, endAngle)) {
                return true;
            }
        }

        const sectorEdges = [
            { start: center, end: center.add(new Vec2(outerRadius * Math.cos(startAngle * Math.PI / 180), outerRadius * Math.sin(startAngle * Math.PI / 180))) },
            { start: center, end: center.add(new Vec2(outerRadius * Math.cos(endAngle * Math.PI / 180), outerRadius * Math.sin(endAngle * Math.PI / 180))) }
        ];

        const innerArcPoints = [
            center.add(new Vec2(innerRadius * Math.cos(startAngle * Math.PI / 180), innerRadius * Math.sin(startAngle * Math.PI / 180))),
            center.add(new Vec2(innerRadius * Math.cos(endAngle * Math.PI / 180), innerRadius * Math.sin(endAngle * Math.PI / 180)))
        ];

        const outerArcPoints = [
            center.add(new Vec2(outerRadius * Math.cos(startAngle * Math.PI / 180), outerRadius * Math.sin(startAngle * Math.PI / 180))),
            center.add(new Vec2(outerRadius * Math.cos(endAngle * Math.PI / 180), outerRadius * Math.sin(endAngle * Math.PI / 180)))
        ];

        const rectEdges = [
            { start: rectVertices[0], end: rectVertices[1] },
            { start: rectVertices[1], end: rectVertices[2] },
            { start: rectVertices[2], end: rectVertices[3] },
            { start: rectVertices[3], end: rectVertices[0] }
        ];

        for (const edge1 of sectorEdges.concat([{ start: innerArcPoints[0], end: innerArcPoints[1] }, { start: outerArcPoints[0], end: outerArcPoints[1] }])) {
            for (const edge2 of rectEdges) {
                if (this.checkLineIntersection(edge1.start, edge1.end, edge2.start, edge2.end)) {
                    return true;
                }
            }
        }

        return this.isPointInRect(center, rectVertices);
    }

    /**
     * 判断点是否在扇形范围内
     */
    isPointInSector(point: Vec2, center: Vec2, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): boolean {
        const distance = point.clone().subtract(center).length();
        return distance >= innerRadius && distance <= outerRadius && this.isAngleWithinRange(point, center, startAngle, endAngle);
    }

    /**
     * 判断点是否在角度范围内
     */
    isAngleWithinRange(point: Vec2, center: Vec2, startAngle: number, endAngle: number): boolean {
        let angle = Math.atan2(point.y - center.y, point.x - center.x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        // 如果扇形跨越 360°，则需要考虑从 startAngle 到 endAngle 可能跨越 0°
        if (startAngle > endAngle) {
            // 角度大于 startAngle 或小于 endAngle 时在扇形区域内
            return (angle >= startAngle || angle <= endAngle);
        } else {
            // 角度在 startAngle 和 endAngle 之间
            return (angle >= startAngle && angle <= endAngle);
        }
    }

    /**
     * 判断线段是否相交
     */
    checkLineIntersection(p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2): boolean {
        const d1 = p2.subtract(p1);
        const d2 = q2.subtract(q1);
        const cross = d1.cross(d2);

        if (cross === 0) {
            return false;
        }

        const t = (q1.subtract(p1)).cross(d2) / cross;
        const u = (q1.subtract(p1)).cross(d1) / cross;

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    /**
     * 判断点是否在矩形内部
     */
    isPointInRect(point: Vec2, rectVertices: Vec2[]): boolean {
        const [topLeft, topRight, bottomRight, bottomLeft] = rectVertices;

        const cross1 = (topRight.subtract(topLeft)).cross(point.subtract(topLeft));
        const cross2 = (bottomRight.subtract(topRight)).cross(point.subtract(topRight));
        const cross3 = (bottomLeft.subtract(bottomRight)).cross(point.subtract(bottomRight));
        const cross4 = (topLeft.subtract(bottomLeft)).cross(point.subtract(bottomLeft));

        return cross1 >= 0 && cross2 >= 0 && cross3 >= 0 && cross4 >= 0;
    }

    setActive(active:boolean){
        this.active = active;
    }

    getAttack():number{
        return this.attack;
    }

    onBeHit(attack: number): number {
        this.hp = this.hp - attack;
        if(this.hp < 0){
            this.hp = 0;
        }
        this.title.string = "weaponType:" + WeaponEnum[this.weaponType] + " HP:" + this.hp;
        return this.hp;
    }
}


