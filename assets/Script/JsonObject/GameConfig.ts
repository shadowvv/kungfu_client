import { _decorator, resources, JsonAsset } from 'cc';
const { ccclass } = _decorator;

/**
 * 游戏配置类
 */
@ccclass('GameConfig')
export class GameConfig {

    private static instance: GameConfig = null;
    public static readonly CONFIG_FILE: string = 'config/gameConfig';
    static getInstance(): GameConfig {
        if (GameConfig.instance == null) {
            GameConfig.instance = new GameConfig();
        }
        return GameConfig.instance;
    }

    private baseNumber: number = 0;
    private waitCommandTick: number = 0;
    private waitActionTick: number = 0;
    private float2Int: number = 0;
    private loaded:boolean = false;

    private constructor() {
    }

    /**
     * 加载配置文件
     */
    loadConfig(jsonAsset: JsonAsset): void {
        const json = jsonAsset.json;
        this.baseNumber = json[0]["baseNumber"];
        this.waitCommandTick = json[0]["waitCommandTick"];
        this.waitActionTick = json[0]["waitActionTick"];
        this.float2Int = json[0]["float2Int"];
        this.loaded = true;
    }

    /**
     * 
     * @returns 获取基础数值
     */
    getBaseNumber(): number {
        return this.baseNumber;
    }

    /**
     * 
     * @returns 获取等待命令的tick
     */
    getWaitCommandTick(): number {
        return this.waitCommandTick;
    }

    /**
     * 
     * @returns 等待动作的tick
     */
    getWaitActionTick(): number {
        return this.waitActionTick;
    }

    /**
     *
     * @returns 浮点数转整数放大倍数
     */
    getFloat2Int(): number {
        return this.float2Int;
    }

    isLoaded() {
        return this.loaded;
    }
}