import { _decorator, resources, JsonAsset } from 'cc';
const { ccclass } = _decorator;

/**
 * 视图配置类
 */
@ccclass('ViewConfig')
export class ViewConfig {
    private static instance: ViewConfig = null;
    private static readonly CONFIG_FILE: string = 'config/viewConfig';
    static getInstance(): ViewConfig {
        if (ViewConfig.instance == null) {
            ViewConfig.instance = new ViewConfig();
        }
        return ViewConfig.instance;
    }

    private bodyStrockColor: string = null;
    private bodyFillColor: string = null;
    private bodyLineWidth: number = 0;
    private MoveStrockColor: string = null;
    private MoveFillColor: string = null;
    private MoveLineWidth: number = 0;
    private AttackStrockColor: string = null;
    private AttackFillColor: string = null;
    private AttackLineWidth: number = 0;

    private constructor() {
    }

    /**
     * 加载配置文件
     */
    loadConfig(): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.load(ViewConfig.CONFIG_FILE, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load config:', err);
                    reject(err);
                    return;
                }
                let json = jsonAsset.json;
                this.bodyStrockColor = json[0]["bodyStrockColor"];
                this.bodyFillColor = json[0]["bodyFillColor"];
                this.bodyLineWidth = json[0]["bodyLineWidth"];
                this.MoveStrockColor = json[0]["MoveStrockColor"];
                this.MoveFillColor = json[0]["MoveFillColor"];
                this.MoveLineWidth = json[0]["MoveLineWidth"];
                this.AttackStrockColor = json[0]["AttackStrockColor"];
                this.AttackFillColor = json[0]["AttackFillColor"];
                this.AttackLineWidth = json[0]["AttackLineWidth"];
                console.log("ViewConfig loaded successfully.");
                resolve();
            });
        });
    }

    /**
     *
     * @returns 获取身体描边颜色
     */
    getBodyStrockColor(): string {
        return this.bodyStrockColor;
    }

    /**
     *
     * @returns 获取身体填充颜色
     */
    getBodyFillColor(): string {
        return this.bodyFillColor;
    }

    /**
     *
     * @returns 获取身体描边宽度
     */
    getBodyLineWidth(): number {
        return this.bodyLineWidth;
    }

    /**
     *
     * @returns 获取移动范围描边颜色
     */
    getMoveStrockColor(): string {
        return this.MoveStrockColor;
    }

    /**
     *
     * @returns 获取移动范围填充颜色
     */
    getMoveFillColor(): string {
        return this.MoveFillColor;
    }

    /**
     *
     * @returns 获取移动范围描边宽度
     */
    getMoveLineWidth(): number {
        return this.MoveLineWidth;
    }

    /**
     *
     * @returns 获取攻击范围描边颜色
     */
    getAttackStrockColor(): string {
        return this.AttackStrockColor;
    }

    /**
     *
     * @returns 获取攻击范围填充颜色
     */
    getAttackFillColor(): string {
        return this.AttackFillColor;
    }

    /**
     *
     * @returns 获取攻击范围描边宽度
     */
    getAttackLineWidth(): number {
        return this.AttackLineWidth;
    }
}