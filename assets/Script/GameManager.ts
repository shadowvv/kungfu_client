import { _decorator, AudioClip, AudioSource, Component, director, Label, Node } from 'cc';
import { NetController } from './NetController';
import { PlayerData } from './main/PlayerData';
import { MarqueeManager } from './MarqueeManager';
import { BaseMessage, LoginReqMessage, PlayerInfoMessage } from './Message';
const { ccclass, property } = _decorator;

/**
 * 游戏管理器，负责游戏的全局控制
 */
@ccclass('GameManager')
export class GameManager extends Component {
    
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

    onLoad() {
        if (GameManager.instance) {
            this.destroy(); // 避免重复创建
            return;
        }
        GameManager.instance = this;
        director.addPersistRootNode(this.node); // 设置为全局节点，切换场景不会销毁
    }

    start() {
        
    }

    static createNetController() {
        //FIXME: 这里的 NetController 传入了 null，实际上应该传入一个 BattleManager 实例
        this.instance.netController = new NetController();
        this.instance.netController.connectWebSocket(false);
    }

    static initPlayerData(PlayerInfoMessage: PlayerInfoMessage) {
        this.instance.playerData = new PlayerData();
        this.instance.playerData.init(PlayerInfoMessage);
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

    static isPlayingBgm() {
        return this.instance.audioSource.playing;
    }

    static sendMessage(message: BaseMessage) {
        this.instance.netController.sendMessage(message);
    }

    static showErrorLog(log: string) {
        MarqueeManager.addMessage(log);
    }
}


