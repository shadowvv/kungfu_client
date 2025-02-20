import { _decorator, resources, JsonAsset } from 'cc';
const { ccclass } = _decorator;

/**
 * 武器配置类
 */
@ccclass('WeaponConfig')
export class WeaponConfig {
    private static instance: WeaponConfig = null;
    private static readonly CONFIG_FILE: string = 'config/weaponConfig';
    static getInstance(): WeaponConfig {
        if (WeaponConfig.instance == null) {
            WeaponConfig.instance = new WeaponConfig();
        }
        return WeaponConfig.instance;
    }

    private weapons: WeaponData[] = [];

    private constructor() {
    }

    /**
     * 加载配置文件
     */
    loadConfig(): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.load(WeaponConfig.CONFIG_FILE, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load config:', err);
                    reject(err);
                    return;
                }
                let json = jsonAsset.json;
                for (let i = 0; i < json.length; i++) {
                    let weapon = new WeaponData(json[i].id, json[i].type, json[i].moveRange, json[i].attack, json[i].innerRadius, json[i].outerRadius, json[i].startAngle, json[i].endAngle, json[i].hp);
                    this.weapons[json[i].id] = weapon;
                }
                console.log("WeaponConfig loaded successfully.");
                resolve();
            });
        });

    }

    /**
     * 
     * @param id 武器id
     * @returns 获取武器数据
     */
    getWeaponById(id: number): WeaponData {
        return this.weapons[id];
    }
}

/**
 * 武器数据
 * @param id 武器id
 * @param type 武器类型
 * @param moveRange 移动范围
 * @param attack 攻击力
 * @param innerRadius 内半径
 * @param outerRadius 外半径
 * @param startAngle 开始角度
 * @param endAngle 结束角度
 */
export class WeaponData {

    public id: number;
    public type: string;
    public moveRange: number;
    public attack: number;
    public innerRadius: number;
    public outerRadius: number;
    public startAngle: number;
    public endAngle: number;
    public hp: number;


    constructor(id: number, type: string, moveRange: number, attack: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, hp: number) {
        this.id = id;
        this.type = type;
        this.moveRange = moveRange;
        this.attack = attack;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.hp = hp;
    }
}