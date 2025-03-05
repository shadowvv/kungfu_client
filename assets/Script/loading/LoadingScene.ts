import { _decorator, AudioClip, AudioSource, Component, director, Game, JsonAsset, Label, ProgressBar, resources, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
import { IResourceProgressUI, ResourceManager } from '../ResourceManager';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceTarget } from '../GameEnumAndConstants';
import { GameManager } from '../GameManager';
import { MarqueeManager } from '../MarqueeManager';
const { ccclass,property } = _decorator;

/**
 * 加载场景
 */
@ccclass('LoadingScene')
export class LoadingScene extends Component implements IResourceProgressUI {

    @property(Label)
    private loadingText:Label = null; // 加载文本
    @property(ProgressBar)
    private progressBar: ProgressBar = null; // 进度条组件
    @property(Sprite)
    private background: Sprite = null; // 背景图组件
    
    private nextScene: string = ""; // 当前场景
    private totalResources: number = 0; // 总资源数量
    private loadedResources: number = 0; // 已加载资源数量

    onLoad() {
        this.nextScene = "loginScene"; // 当前场景
        if(director["sceneParams"]){
            const params = director["sceneParams"];
            this.nextScene = params.targetScene;
        }
    }

    async start() {
        GameManager.showErrorLog("test error log");

        ResourceManager.setProgressUI(this);
        // 加载资源配置文件
        await ResourceManager.loadJson("config/resourceConfig");
        const resourceConfig = ResourceManager.getJson("config/resourceConfig");
        if(!resourceConfig){
            console.error("Failed to load resource config");
        }
        ResourceConfig.getInstance().loadConfig(resourceConfig);

        // 加载背景图片
        const loadingResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.LoadingScene);
        if(!loadingResourceConfig){
            console.error("Failed to load loading resource config");
        }
        ResourceManager.loadMultiple(loadingResourceConfig.backgroundFrameArray,SpriteFrame).then((spriteFrames) => {
            // 随机选择一个背景图片
            const randomIndex = Math.floor(Math.random() * spriteFrames.length);
            const randomBackground = spriteFrames[randomIndex];
            this.background.spriteFrame = randomBackground as SpriteFrame;
        })
        
        // 加载BGM
        const globalResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.Global);
        if(!globalResourceConfig){
            console.error("Failed to load global config");
        }
        ResourceManager.loadMultiple(globalResourceConfig.audioArray,AudioClip).then((audioClips) => {
            GameManager.playBgm(audioClips[0] as AudioClip);
        });

        await this.loadResource(ResourceTarget.Global);
        await this.loadResource(ResourceTarget.LoadingScene);
        await this.loadResource(ResourceTarget.LoginScene);
        
        //进入目标加载场景
        this.enterNextScene();
    }

    async loadResource(resourceTarget: ResourceTarget){
        const resourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(resourceTarget);
        if(!resourceConfig){
            console.error("Failed to load resource config");
        }   

        this.totalResources = resourceConfig.audioArray.length;
        this.totalResources += resourceConfig.spiritFrameArray.length;
        this.totalResources += resourceConfig.spiritAtlasArray.length;
        this.totalResources += resourceConfig.jsonArray.length;

        await ResourceManager.loadMultiple(resourceConfig.audioArray,AudioClip);
        await ResourceManager.loadMultiple(resourceConfig.spiritFrameArray,SpriteFrame);
        await ResourceManager.loadMultiple(resourceConfig.spiritAtlasArray,SpriteAtlas);
        await ResourceManager.loadMultiple(resourceConfig.jsonArray,JsonAsset);
    }

    enterNextScene() {
        MarqueeManager.reset();
        director.loadScene(this.nextScene); // 加载完成后切换到主场景
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
}

