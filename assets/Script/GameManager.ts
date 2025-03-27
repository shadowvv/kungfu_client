import { _decorator, AudioClip, AudioSource, Component, director, Label, Node } from 'cc';
import { NetController } from './NetController';
import { PlayerData } from './PlayerData';
import { MarqueeManager } from './MarqueeManager';
import { BaseMessage, MatchResultBroadMessage, MessageType, PlayerInfoMessage } from './Message';
import { Debug } from './Debug';
import { GlobalEventManager } from './GlobalEventManager';
import { LoadingScene } from './loading/LoadingScene';
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

    onLoad() {
        if (GameManager.instance) {
            this.destroy();
            return;
        }
        GameManager.instance = this;
        director.addPersistRootNode(this.node);

        GlobalEventManager.getInstance().on(MessageType.MATCH_RESULT_BROAD, this.receiveMatchResult.bind(this));
    }

    receiveMatchResult(message: MatchResultBroadMessage) {
        this.opponentData = new PlayerData();
        for (let i = 0; i < message.roles.length; i++) {
            const role = message.roles[i];
            if (role.roleId != GameManager.getPlayerData().getPlayerId()) {
                this.opponentData.setPlayerName(role.userName);
            }
        }

        if(director.getScene().name === "loadingScene"){
            const loadingScene:LoadingScene = director.getScene().getChildByName("Root").getComponent(LoadingScene);
            if (loadingScene) {
                loadingScene.showOpponentInfo(this.opponentData);
            } else {
                GameManager.showErrorLog("LoadingScene not found in the scene");
            }
        }
    }

    destroy(): boolean {
        GameManager.instance = null;
        this.netController.closeWebSocket();
        GlobalEventManager.getInstance().off(MessageType.MATCH_RESULT_BROAD, this.receiveMatchResult.bind(this));
        return super.destroy();
    }

    /**
     * 创建网络控制器
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
     * @param audioClip 播放音频
     */
    static playBgm(audioClip: AudioClip) {
        // this.instance.audioSource.clip = audioClip;
        // this.instance.audioSource.loop = true;
        // this.instance.audioSource.play();
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
     * @param message 发送消息
     */
    static sendMessage(message: BaseMessage) {
        this.instance.netController.sendMessage(message);
    }

    /**
     * 显示错误日志
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
     * 进入场景前的处理
     */
    static beforeEnterScene() {
        MarqueeManager.reset();
    }
}


