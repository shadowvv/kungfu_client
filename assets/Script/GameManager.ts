import { _decorator, Component, Node, Prefab, instantiate, Label, Color, Button } from 'cc';
import { Player } from './Player';
import { GameState, RoleFactory, WAIT_COMMAND_TICK } from './RoleFactory';
import { NetController } from './NetController';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    private rootNode:Node = null;

    private title: Label = null;
    private labelNode: Node = null;

    private tick: number = 0;
    private lastTick: number = 0;
    private countDownTick:number = 0;

    @property(Prefab)
    private left: Prefab = null;
    private leftScript: Player = null;
    @property(Prefab)
    private right: Prefab = null;
    private rightScript: Player = null;
    @property(Button)
    private bladeButton:Button = null;
    @property(Button)
    private bowButton:Button = null;
    @property(Button)
    private knifeButton:Button = null;
    @property(Button)
    private swordButton:Button = null;
    @property(Button)
    private spearButton:Button = null;

    private netContoller:NetController = null;


    private gameState:GameState = GameState.PREPARE;
    private weaponType:number = 0;

    start() {
        this.rootNode = new Node("rootNode");
        this.node.addChild(this.rootNode);

        this.labelNode = new Node('LabelNode');
        this.rootNode.addChild(this.labelNode);
        this.title = this.labelNode.addComponent(Label);
        this.title.string = "选择角色";
        this.title.fontSize = 30;
        this.title.color = Color.GREEN;
        this.labelNode.setPosition(0, 260);

        this.netContoller = new NetController();
        this.netContoller.start();
    }

    setWeaponType(event: Event, customEventData: string):void{
        this.weaponType = Number.parseInt(customEventData);
        
        this.bowButton.node.active = false;
        this.spearButton.node.active = false;
        this.knifeButton.node.active = false;
        this.swordButton.node.active = false;
        this.bladeButton.node.active = false;

        this.countDownTick = WAIT_COMMAND_TICK;
        this.title.string = "等待指令："+this.countDownTick+" 秒";

        if (this.left) {
            const bodyNode = instantiate(this.left);
            this.rootNode.addChild(bodyNode);
            this.leftScript = bodyNode.getComponent('Player') as Player;
            if (this.leftScript) {
                this.leftScript.draw(true,this.weaponType);
            }
            bodyNode.setPosition(-200, 0);
        }

        if (this.right) {
            const bodyNode = instantiate(this.right);
            this.rootNode.addChild(bodyNode);
            this.rightScript = bodyNode.getComponent('Player') as Player;
            if (this.rightScript) {
                this.rightScript.draw(false,this.weaponType);
            }
            bodyNode.setPosition(200, 0);
        }

        this.tick = performance.now();
        this.lastTick = this.tick;
        this.gameState = GameState.WAIT_COMMAND;
    }

    update(deltaTime: number) {
        if(this.gameState == GameState.PREPARE || this.gameState == GameState.END){
            return;
        }

        this.tick += deltaTime;
        if (this.tick - this.lastTick < 1) {
            return;
        }
        this.lastTick = this.tick;

        if(this.gameState == GameState.WAIT_COMMAND || this.gameState == GameState.WAIT_OTHER){
            this.countDownTick = this.countDownTick - 1;
            this.title.string = "等待指令："+this.countDownTick+" 秒";
            if(this.countDownTick <= 0){
                this.gameState = GameState.ACTION;
                this.title.string = "行动";
                this.leftScript.setActive(false);
                this.rightScript.setActive(false);

                let leftHp = 100;
                let rightHp = 100;
                const hit = this.leftScript.checkHit(this.rightScript.getBodyRect());
                if (hit) {
                    rightHp = this.rightScript.onBeHit(this.leftScript.getAttack());
                }
                const hit2 = this.rightScript.checkHit(this.leftScript.getBodyRect());
                if (hit2) {
                    leftHp = this.leftScript.onBeHit(this.rightScript.getAttack());
                }
                if(leftHp == 0 || rightHp == 0){
                    this.gameState = GameState.END;
                    this.title.string = "结束";
                }else{
                    this.scheduleOnce(()=>{
                        this.gameState = GameState.WAIT_COMMAND;
                        this.countDownTick = WAIT_COMMAND_TICK;
                        this.title.string = "等待指令："+this.countDownTick+" 秒";
                        this.leftScript.setActive(true);
                        this.rightScript.setActive(false);
                    },2)
                }
            }
        }
    }
}


