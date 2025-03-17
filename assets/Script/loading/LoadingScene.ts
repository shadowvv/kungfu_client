import { _decorator, AudioClip, Component, director, JsonAsset, Label, ProgressBar, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
import { IResourceProgressUI, ResourceManager } from '../ResourceManager';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceTarget, SceneEnum } from '../GameEnumAndConstants';
import { GameManager } from '../GameManager';
import { MarqueeManager } from '../MarqueeManager';
import { ServerConfig } from '../JsonObject/ServerConfig';
const { ccclass,property } = _decorator;

/**
 * 加载资源场景
 */
@ccclass('LoadingScene')
export class LoadingScene extends Component implements IResourceProgressUI {

    @property(Label)
    private loadingText:Label = null; // 加载文本
    @property(ProgressBar)
    private progressBar: ProgressBar = null; // 进度条
    @property(Sprite)
    private background: Sprite = null; // 背景图
    
    private static firstLoading:boolean = true;
    private nextScene: SceneEnum = null; // 目标场景
    private totalResources: number = 0; // 总资源数量
    private loadedResources: number = 0; // 已加载资源数量

    onLoad() {
        this.nextScene = SceneEnum.LoginScene;
        if(director["sceneParams"]){
            const params = director["sceneParams"];
            this.nextScene = params.targetScene;
        }
    }

    async start() {
        ResourceManager.setProgressUI(this);
        // 加载资源配置文件
        if(!ResourceConfig.getInstance().isLoaded()){
            await ResourceManager.loadJson("config/resourceConfig");
            const resourceConfig = ResourceManager.getJson("config/resourceConfig");
            if(!resourceConfig){
                MarqueeManager.addMessage("Failed to load resource config");
            }
            ResourceConfig.getInstance().loadConfig(resourceConfig);
        }

        const loadingResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.LoadingScene);
        if(!loadingResourceConfig){
            MarqueeManager.addMessage("Failed to load loading resource config");
        }

        // 加载背景图片
        const randomIndex = Math.floor(Math.random() * loadingResourceConfig.backgroundFrameArray.length);
        let background = ResourceManager.getSpriteFrame(loadingResourceConfig.backgroundFrameArray[randomIndex]);
        if(!background){
            await ResourceManager.load(loadingResourceConfig.backgroundFrameArray[randomIndex],SpriteFrame);
            background = ResourceManager.getSpriteFrame(loadingResourceConfig.backgroundFrameArray[randomIndex]);
        }
        this.background.spriteFrame = background;
        
        // 加载BGM
        const globalResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.Global);
        if(!globalResourceConfig){
            MarqueeManager.addMessage("Failed to load global config");
        }
        if(!GameManager.isPlayingBgm()){
            ResourceManager.loadMultiple(globalResourceConfig.audioArray,AudioClip).then((audioClips) => {
                GameManager.playBgm(audioClips[0] as AudioClip);
            });
        }

        // 创建网络连接
        if(!ServerConfig.getInstance().isLoaded()){
            await ResourceManager.load("config/serverConfig",JsonAsset);
            ServerConfig.getInstance().loadConfig(ResourceManager.getJson("config/serverConfig") as JsonAsset);
            GameManager.createNetController();
        }

        //加载全局资源
        if(LoadingScene.firstLoading){
            await this.loadResource(ResourceTarget.Global);
            await this.loadResource(ResourceTarget.LoadingScene);
            LoadingScene.firstLoading = false;
        }
        //加载目标场景资源
        await this.loadResource(this.nextScene.toString() as ResourceTarget);
        
        //进入目标加载场景
        this.enterNextScene();
    }

    /**
     * 加载资源
     * @param targetResource 加载目标资源
     */
    async loadResource(targetResource: ResourceTarget){
        const resourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(targetResource);
        if(!resourceConfig){
            MarqueeManager.addMessage("Failed to load resource config");
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

    updateProgress(): void {
        this.loadedResources++;
        this.progressBar.progress = this.loadedResources / this.totalResources;
    }

    updateLoadingText(text: string): void {
        this.scheduleOnce(() => {
            this.loadingText.string = text;
            this.loadingText.updateRenderData(true);
        });
    }

    /**
     * 进入下一个场景
     */
    private enterNextScene() {
        MarqueeManager.reset();
        director.loadScene(this.nextScene); // 加载完成后切换到主场景
    }
}

