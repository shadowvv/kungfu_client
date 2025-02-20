import { _decorator, resources, JsonAsset } from 'cc';
const { ccclass } = _decorator;

/**
 * 游戏配置类
 */
@ccclass('GameConfig')
export class GameConfig {
    private static instance: GameConfig = null;
    private static readonly CONFIG_FILE: string = 'config/gameConfig';
    static getInstance(): GameConfig {
        if (GameConfig.instance == null) {
            GameConfig.instance = new GameConfig();
        }
        return GameConfig.instance;
    }

    private baseNumber: number = 0;
    private waitCommandTick: number = 0;
    private waitActionTick: number = 0;

    private constructor() {
    }

    /**
     * 加载配置文件
     */
    loadConfig(): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.load(GameConfig.CONFIG_FILE, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load config:', err);
                    reject(err);
                    return;
                }
                let json = jsonAsset.json;
                this.baseNumber = json[0]["baseNumber"];
                this.waitCommandTick = json[0]["waitCommandTick"];
                this.waitActionTick = json[0]["waitActionTick"];
                console.log("GameConfig loaded successfully.");
                resolve();
            });
        });
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

}