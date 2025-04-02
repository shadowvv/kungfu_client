import { Asset, assetManager, AudioClip, JsonAsset, resources, SpriteAtlas, SpriteFrame } from "cc";
import { GameManager } from "./GameManager";

/**
 * 进度条UI接口
 */
export interface IResourceProgressUI {
    
    /**
     * 更新进度条
     */
    updateProgress(): void; // 更新进度条

    /**
     * 
     * @param text 更新加载资源名称
     */
    updateLoadingText(text: string): void; // 更新加载资源名称
}

/**
 * 资源管理器
 */
export class ResourceManager {

    /**
     * 资源缓存
     */
    private static cache: Map<string, any> = new Map();
    /**
     * 进度条 UI
     */
    private static progressUI: IResourceProgressUI | null = null;

    /**
     * 设置进度条 UI
     * @param ui 进度条 UI 实例
     */
    static setProgressUI(ui: IResourceProgressUI) {
        this.progressUI = ui;
    }

    /**
     * 加载单个资源
     * @param path 资源路径 (resources 目录下)
     * @param type 资源类型 (JsonAsset, AudioClip, SpriteFrame, SpriteAtlas 等)
     * @returns Promise<T>
     */
    static async load<T extends Asset>(path: string, type: typeof Asset): Promise<T> {

        if (this.progressUI) {
            this.progressUI.updateLoadingText(`Loading: ${path}`); // 更新加载资源名称
        }
        
        if (this.cache.has(path)) {
            const cachedAsset = this.cache.get(path);
            if (cachedAsset instanceof type) { // 检查类型是否匹配
                if (this.progressUI) {
                    this.progressUI.updateProgress(); // 更新进度条
                }
                return cachedAsset as T;
            }
        }
        if (type === SpriteFrame) {
            path = path + '/spriteFrame';
        }
        return new Promise<T>((resolve, reject) => {
            resources.load(path, type, (err, asset) => {
                if (err) {
                    GameManager.showErrorLog(`Failed to load resource:${path}`);
                    reject(err);
                } else {
                    if (this.progressUI) {
                        this.progressUI.updateProgress(); // 更新进度条
                    }
                    this.cache.set(path, asset);
                    console.log(`Loaded resource:${path}`);
                    resolve(asset as T);
                }
            });
        });
    }

    /**
     * 批量加载多个资源
     * @param paths 资源路径数组
     * @param type 资源类型
     * @returns Promise<T[]>
     */
    static async loadMultiple<T extends Asset>(paths: string[], type: typeof Asset): Promise<T[]> {
        const promises = paths.map(path => this.load<T>(path, type));
        return Promise.all(promises);
    }

    /**
     * 批量加载某个文件夹下的所有资源
     * @param dirPath 文件夹路径
     * @param type 资源类型
     * @returns Promise<T[]>
     */
    static async loadDir<T extends Asset>(dirPath: string, type: typeof Asset): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            resources.loadDir(dirPath, type, (err, assets) => {
                if (err) {
                    GameManager.showErrorLog(`Failed to load directory:${dirPath}`);
                    reject(err);
                } else {
                    assets.forEach(asset => this.cache.set(asset.name, asset));
                    resolve(assets as T[]);
                }
            });
        });
    }

    /**
     * 加载 JSON 文件
     * @param path JSON 文件路径
     * @returns Promise<any>
     */
    static async loadJson(path: string): Promise<any> {
        const jsonAsset = await this.load<JsonAsset>(path, JsonAsset);
        return jsonAsset.json;
    }

    /**
     * 加载音频
     * @param path 音频文件路径
     * @returns Promise<AudioClip>
     */
    static async loadAudio(path: string): Promise<AudioClip> {
        return this.load<AudioClip>(path, AudioClip);
    }

    /**
     * 加载 SpriteFrame
     * @param path 图片资源路径
     * @returns Promise<SpriteFrame>
     */
    static async loadSpriteFrame(path: string): Promise<SpriteFrame> {
        return this.load<SpriteFrame>(path, SpriteFrame);
    }

    /**
     * 加载 SpriteAtlas 图集
     * @param path 图集资源路径
     * @returns Promise<SpriteAtlas>
     */
    static async loadSpriteAtlas(path: string): Promise<SpriteAtlas> {
        return this.load<SpriteAtlas>(path, SpriteAtlas);
    }

    /**
     * 获取缓存的json资源
     * @param path 资源路径
     */
    static getJson(path: string): JsonAsset {
        return this.cache.get(path) as JsonAsset;
    }

    /**
     * 获取缓存的音频资源
     * @param path 音频资源路径
     * @returns 
     */
    static getAudio(path: string): AudioClip {
        return this.cache.get(path) as AudioClip;
    }

    /**
     * 获取缓存的SpriteFrame资源
     * @param path 资源路径
     */
    static getSpriteFrame(path: string): SpriteFrame {
        path = path + '/spriteFrame';
        return this.cache.get(path) as SpriteFrame;
    }

    /**
     * 获取缓存的SpriteAtlas资源
     * @param path 资源路径
     * @returns 
     */
    static getSpriteAtlas(path: string) {
        return this.cache.get(path) as SpriteAtlas;
    }

    /**
     * 释放单个资源
     * @param path 资源路径
     */
    static release(path: string) {
        if (this.cache.has(path)) {
            assetManager.releaseAsset(this.cache.get(path));
            this.cache.delete(path);
        }
    }

    /**
     * 释放所有缓存资源
     */
    static releaseAll() {
        this.cache.forEach(asset => assetManager.releaseAsset(asset));
        this.cache.clear();
    }
}