import { _decorator, AudioClip, Button, Component, director, JsonAsset, Label, ProgressBar, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
import { IResourceProgressUI, ResourceManager } from '../main/ResourceManager';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceTarget, SceneEnum, weaponToResourceMap } from '../main/GameEnumAndConstants';
import { GameManager } from '../main/GameManager';
import { ServerConfig } from '../JsonObject/ServerConfig';
import { PlayerData } from '../main/PlayerData';
import { PlayerShow } from '../PlayerShow';
import { GlobalEventManager } from '../main/GlobalEventManager';
import { CancelMatchReqMessage, CancelMatchRespMessage, LoadBattleReadyReqMessage, MessageType } from '../main/Message';
import { GameConfig } from '../JsonObject/GameConfig';
import { ViewConfig } from '../JsonObject/ViewConfig';
import { WeaponConfig } from '../JsonObject/WeaponConfig';
const { ccclass,property } = _decorator;

/**
 * 加载资源场景
 */
@ccclass('LoadingScene')
export class LoadingScene extends Component implements IResourceProgressUI {

    private static firstLoading:boolean = true;//首次加载

    @property(Label)
    private loadingText:Label = null; // 加载文本
    @property(ProgressBar)
    private progressBar: ProgressBar = null; // 进度条
    @property(Sprite)
    private background: Sprite = null; // 背景图

    private nextScene: SceneEnum = null; // 目标场景
    private totalResources: number = 0; // 总资源数量
    private loadedResources: number = 0; // 已加载资源数量

    //*************************************匹配相关的组件
    @property(PlayerShow)
    private selfShow: PlayerShow = null;
    @property(PlayerShow)
    private opponentShow: PlayerShow = null;
    @property(Button)
    private cancelMatchBtn:Button = null;

    private isMatch:boolean = false; // 是否匹配
    //*************************************匹配相关的组件

    onLoad() {
        this.nextScene = SceneEnum.LoginScene;
        if(director["sceneParams"]){
            const params = director["sceneParams"];
            if(params.isMatch){
                this.isMatch = params.isMatch;
            }
            this.nextScene = params.targetScene;
        }

        this.selfShow.node.active = false;
        this.opponentShow.node.active = false;
        if(!this.isMatch){
            this.cancelMatchBtn.node.active = false;
        }

        GlobalEventManager.getInstance().on(MessageType.CANCEL_MATCH_RESP, this.onCancelMatch.bind(this));
    }

    async start() {
        ResourceManager.setProgressUI(this);
        // 加载资源配置文件
        if(!ResourceConfig.getInstance().isLoaded()){
            GameManager.infoLog("ResourceConfig is not loaded, loading now...");
            await ResourceManager.loadJson("config/resourceConfig");
            const resourceConfig = ResourceManager.getJson("config/resourceConfig");
            if(!resourceConfig){
                GameManager.errorLog("Failed to load resource config");
            }
            ResourceConfig.getInstance().loadConfig(resourceConfig);
        }
        const loadingResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.LoadingScene);
        if(!loadingResourceConfig){
            GameManager.errorLog("Failed to load loading resource config");
        }

        // 加载背景图片
        const randomIndex = Math.floor(Math.random() * loadingResourceConfig.backgroundFrameArray.length);
        let background = ResourceManager.getSpriteFrame(loadingResourceConfig.backgroundFrameArray[randomIndex]);
        if(!background){
            GameManager.infoLog("Background not found, loading now...");
            await ResourceManager.load(loadingResourceConfig.backgroundFrameArray[randomIndex],SpriteFrame);
            background = ResourceManager.getSpriteFrame(loadingResourceConfig.backgroundFrameArray[randomIndex]);
        }
        this.background.spriteFrame = background;

        // 加载全局资源
        if(LoadingScene.firstLoading){
            await this.loadGlobalResource();
        }
        // 加载场景资源
        await this.loadResource(ResourceTarget.LoadingScene);
        // 加载目标场景资源
        await this.loadResource(this.nextScene.toString() as ResourceTarget);

        // 是匹配，则显示玩家信息
        if(this.isMatch){
            await this.showSelfInfo();
            const opponentData = GameManager.getOpponentData();
            if(opponentData){
                await this.showOpponentInfo(opponentData);
            }
        }else{
            //进入目标加载场景
            this.enterNextScene();
        }
    }

    /**
     * @description 首次加载资源
     * @returns 
     */
    private async loadGlobalResource() {
        GameManager.infoLog("Loading global resources...");
        //加载全局资源
        await this.loadResource(ResourceTarget.Global);

        GameManager.infoLog("initial Config files...");
        const gameConfig:JsonAsset = ResourceManager.getJson(GameConfig.CONFIG_FILE);
        if(!gameConfig){
            GameManager.errorLog("Failed to load game config");
        }
        GameConfig.getInstance().loadConfig(gameConfig);

        const serverConfig:JsonAsset = ResourceManager.getJson(ServerConfig.CONFIG_FILE);
        if(!serverConfig){
            GameManager.errorLog("Failed to load server config");
        }
        ServerConfig.getInstance().loadConfig(serverConfig);

        const viewConfig:JsonAsset = ResourceManager.getJson(ViewConfig.CONFIG_FILE);
        if(!viewConfig){
            GameManager.errorLog("Failed to load view config");
        }
        ViewConfig.getInstance().loadConfig(viewConfig);

        const weaponConfig:JsonAsset = ResourceManager.getJson(WeaponConfig.CONFIG_FILE);
        if(!weaponConfig){
            GameManager.errorLog("Failed to load weapon config");
        }
        WeaponConfig.getInstance().loadConfig(weaponConfig);

        // 加载BGM
        GameManager.infoLog("initial BGM...");
        const globalResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.Global);
        if(!globalResourceConfig){
            GameManager.errorLog("Failed to load global config");
        }
        if(!GameManager.isPlayingBgm()){
            ResourceManager.loadMultiple(globalResourceConfig.audioArray,AudioClip).then((audioClips) => {
                GameManager.playBgm(audioClips[0] as AudioClip);
            });
        }

        // 创建网络连接
        GameManager.createNetController();

        LoadingScene.firstLoading = false;
    }

    /**
     * @description 加载资源
     * @param targetResource 加载目标资源
     */
    private async loadResource(targetResource: ResourceTarget){
        GameManager.infoLog(`Loading resources for ${targetResource}...`);
        const resourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(targetResource);
        if(!resourceConfig){
            GameManager.errorLog("Failed to load resource config");
        }   

        this.totalResources = resourceConfig.audioArray.length;
        this.totalResources += resourceConfig.spiritFrameArray.length;
        this.totalResources += resourceConfig.spiritAtlasArray.length;
        this.totalResources += resourceConfig.jsonArray.length;

        await ResourceManager.loadMultiple(resourceConfig.audioArray,AudioClip);
        await ResourceManager.loadMultiple(resourceConfig.spiritFrameArray,SpriteFrame);
        await ResourceManager.loadMultiple(resourceConfig.spiritAtlasArray,SpriteAtlas);
        await ResourceManager.loadMultiple(resourceConfig.jsonArray,JsonAsset);
        await ResourceManager.loadMultiple(resourceConfig.backgroundFrameArray,SpriteFrame);
    }

    /**
     * @description 显示玩家信息
     */
    async showSelfInfo() {
        GameManager.infoLog("Showing self info...");
        this.selfShow.node.active = true;

        const playerData:PlayerData = GameManager.getPlayerData();
        this.selfShow.showPlayerInfo(playerData);

        await this.loadResource(weaponToResourceMap[playerData.getWeaponType()] as ResourceTarget);
    }

    /**
     * @description 显示对手信息
     * @param opponentData 对手数据
     */
    async showOpponentInfo(opponentData: PlayerData) {
        GameManager.infoLog("Showing opponent info...");
        this.opponentShow.node.active = true;

        this.opponentShow.showPlayerInfo(opponentData);
        await this.loadResource(weaponToResourceMap[opponentData.getWeaponType()] as ResourceTarget);

        GameManager.sendMessage(new LoadBattleReadyReqMessage());
    }

    /**
     * @description 取消匹配
     * @param event 
     * @param customEventData 
     */
    cancelMatch(event: Event, customEventData: string) {
        GameManager.infoLog("Cancel match button clicked...");
        const messaeg:CancelMatchReqMessage = new CancelMatchReqMessage();
        GameManager.sendMessage(messaeg);
    }

    /**
     * 
     * @param message 取消匹配响应消息
     */
    onCancelMatch(message:CancelMatchRespMessage) {
        GameManager.infoLog("Received cancel match response...");
        if(director["sceneParams"]){
            const sourceScene = director["sourceScene"];
            director.loadScene(sourceScene);
        }else{
            director.loadScene(SceneEnum.MainScene);
        }
    }

    /**
     * @description 进入下一个场景
     */
    enterNextScene() {
        GameManager.infoLog(`Entering next scene: ${this.nextScene}...`);
        GameManager.beforeEnterScene();
        director.loadScene(this.nextScene); 
    }

    updateProgress(): void {
        this.loadedResources++;
        this.progressBar.progress = this.loadedResources / this.totalResources;
    }

    updateLoadingText(text: string): void {
        if(this.loadingText){
            this.loadingText.string = text;
            this.loadingText.updateRenderData(true);
        }
    }

    destroy(): boolean {
        GlobalEventManager.getInstance().off(MessageType.CANCEL_MATCH_RESP, this.onCancelMatch.bind(this));
        return super.destroy();
    }
}

