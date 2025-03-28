import { _decorator, Component, director, Label, Sprite } from 'cc';
import { GameManager } from '../main/GameManager';
import { ResourceManager } from '../main/ResourceManager';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceTarget, SceneEnum, WeaponEnum } from '../main/GameEnumAndConstants';
import { PlayerData } from '../main/PlayerData';
import { ApplyBattleReqMessage, ApplyBattleRespMessage, MessageType } from '../main/Message';
import { GlobalEventManager } from '../main/GlobalEventManager';
import { PlayerShow } from '../PlayerShow';
import { WeaponConfig } from '../JsonObject/WeaponConfig';
import { ViewConfig } from '../JsonObject/ViewConfig';
import { GameConfig } from '../JsonObject/GameConfig';
const { ccclass,property } = _decorator;

@ccclass('MainScene')
export class MainScene extends Component {

    @property(Sprite)
    private background: Sprite = null;

    @property(PlayerShow)
    private playerShow: PlayerShow = null;

    @property(Label)
    private weaponDescription:Label = null;
    private choosedWeapon:WeaponEnum = WeaponEnum.SWORD;

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

        if(!WeaponConfig.getInstance().isLoaded()){
            WeaponConfig.getInstance().loadConfig(ResourceManager.getJson(WeaponConfig.CONFIG_FILE));
        }
        if(!ViewConfig.getInstance().isLoaded()){
            ViewConfig.getInstance().loadConfig(ResourceManager.getJson(ViewConfig.CONFIG_FILE));
        }
        if(!GameConfig.getInstance().isLoaded()){
            GameConfig.getInstance().loadConfig(ResourceManager.getJson(GameConfig.CONFIG_FILE));
        }
        this.showPlayerInfo();
        this.changeWeaponDescription();

        GlobalEventManager.getInstance().on(MessageType.APPLY_BATTLE_RESP, this.afterApplyBattle.bind(this));
    }

    changeWeaponDescription() {
        this.weaponDescription.string = `武器介绍 当前选择武器: ${WeaponEnum[this.choosedWeapon]}`;
    }

    showPlayerInfo() {
        const playerData:PlayerData = GameManager.getPlayerData();
        this.playerShow.showPlayerInfo(playerData);
    }

    chooseWeapon(event: Event, customEventData: string) {
        const index:number = parseInt(customEventData);
        this.choosedWeapon = index;
        this.changeWeaponDescription();
    }

    onStartBattle() {
        const message:ApplyBattleReqMessage = new ApplyBattleReqMessage();
        message.weaponType = this.choosedWeapon;
        GameManager.sendMessage(message);
    }

    afterApplyBattle(message:ApplyBattleRespMessage) {
        GameManager.showErrorLog("匹配成功");

        GameManager.beforeEnterScene();
        director["sceneParams"] = {
            targetScene: "battleScene",
            isMatch: true,
        }
        director.loadScene(SceneEnum.LoadingScene);
    }

    destroy(): boolean {
        GlobalEventManager.getInstance().off(MessageType.APPLY_BATTLE_RESP, this.afterApplyBattle.bind(this));
        return super.destroy();
    }
}

