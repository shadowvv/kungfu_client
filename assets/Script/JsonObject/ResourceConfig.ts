import { _decorator, JsonAsset } from 'cc';
import { GameManager } from '../main/GameManager';
const { ccclass } = _decorator;

/**
 * 资源配置类
 */
@ccclass('ResourceConfig')
export class ResourceConfig {
    public static readonly CONFIG_FILE: string = 'config/resourceConfig';

    private static instance: ResourceConfig = null;

    static getInstance(): ResourceConfig {
        if (ResourceConfig.instance == null) {
            ResourceConfig.instance = new ResourceConfig();
        }
        return ResourceConfig.instance;
    }

    private resources: Map<string, resourceData> = new Map();
    private loaded: boolean = false;

    private constructor() {}

    /**
     * 初始化
     */
    loadConfig(jsonAsset: JsonAsset): void {
        const json = jsonAsset.json;

        if (!Array.isArray(json)) {
            GameManager.errorLog("ResourceCOnfig loadConfig 失败,json 不是数组"+json);
            return;
        }

        for (let i = 0; i < json.length; i++) {
            const data = json[i];

            if (!data.name) {
                GameManager.infoLog(`资源缺少 name,跳过`+data);
                continue;
            }

            let resource = new resourceData(
                data.name,
                Array.isArray(data.audioArray) ? data.audioArray : [],
                Array.isArray(data.spiritFrameArray) ? data.spiritFrameArray : [],
                Array.isArray(data.spiritAtlasArray) ? data.spiritAtlasArray : [],
                Array.isArray(data.jsonArray) ? data.jsonArray : [],
                Array.isArray(data.backgroundFrameArray) ? data.backgroundFrameArray : [],
            );

            this.resources.set(data.name, resource);
        }
        this.loaded = true;
    }

    isLoaded() {
        return this.loaded;
    }

    /**
     * 获取资源
     * @param name 资源名称
     * @returns 资源数据
     */
    getResourceConfig(name: string): resourceData | undefined {
        return this.resources.get(name);
    }
}

/**
 * 游戏资源
 */
export class resourceData {
    public name: string;
    public audioArray: string[];
    public spiritFrameArray: string[];
    public spiritAtlasArray: string[];
    public jsonArray: string[];
    public backgroundFrameArray: string[];

    constructor(name: string, audioArray: string[], spiritFrameArray: string[], spiritAtlasArray: string[], jsonArray: string[], backgroundFrameArray: string[]) {
        this.name = name;
        this.audioArray = audioArray;
        this.spiritFrameArray = spiritFrameArray;
        this.spiritAtlasArray = spiritAtlasArray;
        this.jsonArray = jsonArray;
        this.backgroundFrameArray = backgroundFrameArray;
    }
}
