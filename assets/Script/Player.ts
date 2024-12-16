import { _decorator, Component, Node, Prefab, instantiate, Vec2 } from 'cc';
import { Role } from './Role';
import { WeaponEnum } from './RoleFactory';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    @property(Prefab)
    private role: Prefab = null;
    private roleScript: Role = null;

    @property({ type: WeaponEnum })
    private weaponType: WeaponEnum = WeaponEnum.BOW;

    draw(active: boolean,weaponType:number): void {
        this.weaponType = weaponType;

        const emptyNode = new Node("emptyNode");
        this.node.addChild(emptyNode);
        if (this.role) {
            const roleNode = instantiate(this.role);
            emptyNode.addChild(roleNode);

            this.roleScript = roleNode.getComponent('Role') as Role;
            if (this.roleScript) {
                this.roleScript.init(this.weaponType, active);
            }
        }
    }

    getBodyRect(): Vec2[] {
        return this.roleScript.getBodyRect();
    }

    checkHit(bodyRect: Vec2[]): boolean {
        return this.roleScript.checkHit(bodyRect);
    }

    setActive(active:boolean){
        this.roleScript.setActive(active);
    }

    getAttack():number{
        return this.roleScript.getAttack();
    }

    onBeHit(attack: number): number {
        return this.roleScript.onBeHit(attack);
    }
}


