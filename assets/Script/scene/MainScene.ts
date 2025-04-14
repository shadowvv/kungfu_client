import { _decorator, Component, Label, Sprite } from 'cc';
import { GameManager } from '../main/GameManager';
import { ResourceManager } from '../main/ResourceManager';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceTarget, SceneEnum, WeaponEnum } from '../main/GameEnumAndConstants';
import { PlayerData } from '../main/PlayerData';
import { ApplyBattleReqMessage, ApplyBattleRespMessage, MessageType } from '../main/Message';
import { GlobalEventManager } from '../main/GlobalEventManager';
import { PlayerShow } from '../PlayerShow';
const { ccclass,property } = _decorator;

@ccclass('MainScene')
export class MainScene extends Component {

    @property(Sprite)
    private background: Sprite = null;

    @property(PlayerShow)
    private playerShow: PlayerShow = null;

    @property(Label)
    private weaponDescription:Label = null;
    private choosedWeapon:WeaponEnum = WeaponEnum.sword;

    start() {
        const mainResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.MainScene);
        if(!mainResourceConfig){
            GameManager.showErrorLog("Failed to load main resource config");
        }
        const backgroundFrame = ResourceManager.getSpriteFrame(mainResourceConfig.backgroundFrameArray[0]);
        if(!backgroundFrame){
            GameManager.showErrorLog("Failed to load background frame");
        }
        this.background.spriteFrame = backgroundFrame;

        this.showPlayerInfo();
        this.changeWeaponDescription();

        GlobalEventManager.getInstance().on(MessageType.APPLY_BATTLE_RESP, this.afterApplyBattle.bind(this));
    }

    private changeWeaponDescription() {
        this.weaponDescription.string = `武器介绍 移动距离，攻击距离，攻击力 当前选择武器: ${WeaponEnum[this.choosedWeapon]}`;
    }

    private showPlayerInfo() {
        const playerData:PlayerData = GameManager.getPlayerData();
        this.playerShow.showPlayerInfo(playerData);
    }

    /**
    * @description 选择武器按钮点击事件
    * @param event 事件对象
    * @param customEventData 自定义事件数据
    */
    chooseWeapon(event: Event, customEventData: string) {
        const index:number = parseInt(customEventData);
        this.choosedWeapon = index;
        this.changeWeaponDescription();
    }

    /**
     * @description 申请对战按钮点击事件
     * @param event 
     * @param customEventData 
     */
    onStartBattle(event: Event, customEventData: string) {
        const message:ApplyBattleReqMessage = new ApplyBattleReqMessage();
        message.weaponType = this.choosedWeapon;
        GameManager.sendMessage(message);
    }

    /**
     * @description 申请对战响应事件
     * @param message 申请对战响应消息
     */
    afterApplyBattle(message:ApplyBattleRespMessage) {
        GameManager.setRoleInfo(message.roleId,message.weaponType);
        GameManager.enterNextScene(SceneEnum.BattleScene,true);
    }

    destroy(): boolean {
        GlobalEventManager.getInstance().off(MessageType.APPLY_BATTLE_RESP, this.afterApplyBattle.bind(this));
        return super.destroy();
    }
}

