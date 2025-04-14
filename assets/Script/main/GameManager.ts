import { _decorator, AudioClip, AudioSource, Component, director } from 'cc';
import { NetController } from './NetController';
import { PlayerData } from './PlayerData';
import { MarqueeManager } from '../MarqueeManager';
import { BaseMessage, BattleStartBroadMessage, MatchResultBroadMessage, MessageType, PlayerInfoMessage, RoleMessage } from './Message';
import { Debug } from './Debug';
import { GlobalEventManager } from '../main/GlobalEventManager';
import { LoadingScene } from '../scene/LoadingScene';
import { SceneEnum } from './GameEnumAndConstants';
const { ccclass, property } = _decorator;

/**
 * 游戏管理器，负责游戏的全局控制
 */
@ccclass('GameManager')
export class GameManager extends Component {
    
    /**
     * 单例
     */
    private static instance: GameManager = null;

    /**
     * 音频源
     */
    @property(AudioSource)
    private audioSource: AudioSource = null;
    /**
     * 网络控制器
     */
    private netController: NetController = null;
    /**
     * 玩家数据
     */
    private playerData:PlayerData = null;
    /**
     * 对手数据
     * 仅在匹配成功后使用
     */
    private opponentData:PlayerData = null;
    /**
     * 角色战斗数据
     */
    private roles: RoleMessage[] = [];

    onLoad() {
        if (GameManager.instance) {
            this.destroy();
            return;
        }
        GameManager.instance = this;
        director.addPersistRootNode(this.node);

        GlobalEventManager.getInstance().on(MessageType.MATCH_RESULT_BROAD, this.receiveMatchResult.bind(this));
        GlobalEventManager.getInstance().on(MessageType.BATTLE_START_BROAD, this.battleStart.bind(this));
    }

    /**
     * @description 战斗开始
     */
    battleStart(message: BattleStartBroadMessage) {
        this.roles = message.roles;
        if(director.getScene().name === "loadingScene"){
            const loadingScene:LoadingScene = director.getScene().getChildByName("Root").getComponent(LoadingScene);
            if (loadingScene) {
                loadingScene.enterNextScene();
            } else {
                GameManager.showErrorLog("LoadingScene not found in the scene");
            }
        }
    }

    /**
     * @description 接收匹配结果
     * @param message 匹配结果消息
     */
    async receiveMatchResult(message: MatchResultBroadMessage) {
        this.opponentData = new PlayerData();
        for (let i = 0; i < message.playerInfoList.length; i++) {
            const playerInfo = message.playerInfoList[i];
            if (playerInfo.playerId != GameManager.getPlayerData().getPlayerId()) {
                this.opponentData.init(playerInfo);
            }
        }

        if(director.getScene().name === "loadingScene"){
            const loadingScene:LoadingScene = director.getScene().getChildByName("Root").getComponent(LoadingScene);
            if (loadingScene) {
                await loadingScene.showOpponentInfo(this.opponentData);
            } else {
                GameManager.showErrorLog("LoadingScene not found in the scene");
            }
        }
    }

    /**
     * @description 创建网络控制器
     */
    static createNetController() {
        this.instance.netController = new NetController();
        this.instance.netController.connectWebSocket(false);
    }

    /**
     * 
     * @param PlayerInfoMessage 初始化玩家数据
     */
    static initPlayerData(PlayerInfoMessage: PlayerInfoMessage) {
        this.instance.playerData = new PlayerData();
        this.instance.playerData.init(PlayerInfoMessage);
    }

    /**
     * @description 设置玩家战斗角色数据
     * @param roleId 角色 ID
     * @param weaponType 武器
     */
    static setRoleInfo(roleId: number, weaponType: number) {
        this.instance.playerData.setRoleId(roleId);
        this.instance.playerData.setWeaponType(weaponType);
    }

    /**
     * 
     * @param audioClip 播放音频
     */
    static playBgm(audioClip: AudioClip) {
        this.instance.audioSource.clip = audioClip;
        this.instance.audioSource.loop = true;
        this.instance.audioSource.play();
    }

    /**
     * 
     * @returns 是否正在播放音频
     */
    static isPlayingBgm() {
        return this.instance.audioSource.playing;
    }

    /**
     * 
     * @returns 玩家数据
     */
    static getPlayerData() : PlayerData {
        return this.instance.playerData;
    }

    /**
     * 
     * @returns 对手数据
     */
    static getOpponentData() : PlayerData {
        return this.instance.opponentData;
    }

    /**
     * 
     * @returns 角色战斗数据
     */
    static getRoles(): RoleMessage[] {
        return this.instance.roles;
    }

    /**
     * 
     * @param message 发送消息
     */
    static sendMessage(message: BaseMessage) {
        this.instance.netController.sendMessage(message);
    }

    /**
     * @description 显示错误日志
     * @param log 日志
     */
    static showErrorLog(log: string) {
        if (Debug.isDebug) {
            MarqueeManager.addMessage(log);
        }else{  
            console.error(log);
        }
    }

    /**
     * @description 进入场景前的处理
     */
    static beforeEnterScene() {
        MarqueeManager.reset();
    }

    /** 
    * @description 进入下一个场景
    * @param scene 下一个场景
    * @param isMatch 是否匹配成功
    */
    static enterNextScene(scene:SceneEnum,isMatch:boolean = false) {
        director["sceneParams"] = {
            sourceScene: director.getScene().name,
            targetScene: scene,
            isMatch: isMatch,
        }
        director.loadScene(SceneEnum.LoadingScene);
    }

    destroy(): boolean {
        GameManager.instance = null;
        this.netController.closeWebSocket();
        GlobalEventManager.getInstance().off(MessageType.MATCH_RESULT_BROAD, this.receiveMatchResult.bind(this));
        GlobalEventManager.getInstance().off(MessageType.BATTLE_START_BROAD, this.battleStart.bind(this));
        return super.destroy();
    }
}


