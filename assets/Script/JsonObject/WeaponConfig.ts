import { _decorator, resources, JsonAsset } from 'cc';
import { GameManager } from '../main/GameManager';
const { ccclass } = _decorator;

/**
 * 武器配置类
 */
@ccclass('WeaponConfig')
export class WeaponConfig {
    private static instance: WeaponConfig = null;
    public static readonly CONFIG_FILE: string = 'config/weaponConfig';
    static getInstance(): WeaponConfig {
        if (WeaponConfig.instance == null) {
            WeaponConfig.instance = new WeaponConfig();
        }
        return WeaponConfig.instance;
    }

    private resources: Map<string, WeaponData> = new Map();
    private loaded:boolean = false;

    private constructor() {
    }

    /**
     * 加载配置文件
     */
    loadConfig(jsonAsset: JsonAsset): void {
        const json = jsonAsset.json;
    
        if (!Array.isArray(json)) {
            GameManager.errorLog("WeponConfig loadConfig 失败,json 不是数组"+json);
            return;
        }
    
        for (let i = 0; i < json.length; i++) {
            let weapon = new WeaponData(
                parseInt(json[i].id), // 将字符串转换为数字
                json[i].type,
                parseFloat(json[i].moveRange), // 将字符串转换为浮点数
                parseFloat(json[i].attack),
                parseFloat(json[i].innerRadius),
                parseFloat(json[i].outerRadius),
                parseFloat(json[i].startAngle),
                parseFloat(json[i].endAngle),
                parseFloat(json[i].hp),
                json[i].attackResource,
                json[i].actionResource,
                json[i].stateResource,
                parseInt(json[i].attackStartIndex),
                parseInt(json[i].attackCount),
                parseInt(json[i].assistancStartIndex),
                parseInt(json[i].assistanceCount),
                parseInt(json[i].specialAttackStartIndex),
                parseInt(json[i].specialAttackCount),
                parseInt(json[i].helloStartIndex),
                parseInt(json[i].helloCount),
                parseInt(json[i].regretStartIndex),
                parseInt(json[i].regretCount),
                parseInt(json[i].standStartIndex),
                parseInt(json[i].standCount),
                parseInt(json[i].victoryStartIndex),
                parseInt(json[i].victoryCount),
                parseInt(json[i].beHitStartIndex),
                parseInt(json[i].beHitCount),
                parseInt(json[i].blockStartIndex),
                parseInt(json[i].blockCount),
                parseInt(json[i].deadStartIndex),
                parseInt(json[i].deadCount),
                parseInt(json[i].moveStartIndex),
                parseInt(json[i].moveCount)
            );
            this.resources.set(json[i].id, weapon);
        }
    
        this.loaded = true;
    }

    /**
     * 
     * @param id 武器id
     * @returns 获取武器数据
     */
    getWeaponById(id: number): WeaponData {
        return this.resources.get(id.toString());
    }

    isLoaded() {
        return this.loaded;
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
    public attackResource: string;
    public actionResource: string;
    public stateResource: string;
    public clipStartIndex: number[];
    public clipCount: number[];

    constructor(
        id: number,
        type: string,
        moveRange: number,
        attack: number,
        innerRadius: number,
        outerRadius: number,
        startAngle: number,
        endAngle: number,
        hp: number,
        attackResource: string,
        actionResource: string,
        stateResource: string,
        attackStartIndex: number,
        attackCount: number,
        assistancStartIndex: number,
        assistanceCount: number,
        specialAttackStartIndex: number,
        specialAttackCount: number,
        helloStartIndex: number,
        helloCount: number,
        regretStartIndex: number,
        regretCount: number,
        standStartIndex: number,
        standCount: number,
        victoryStartIndex: number,
        victoryCount: number,
        beHitStartIndex: number,
        beHitCount: number,
        blockStartIndex: number,
        blockCount: number,
        deadStartIndex: number,
        deadCount: number,
        moveStartIndex: number,
        moveCount: number
    ) {
        this.id = id;
        this.type = type;
        this.moveRange = moveRange;
        this.attack = attack;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.hp = hp;
        this.attackResource = attackResource;
        this.actionResource = actionResource;
        this.stateResource = stateResource;
        this.clipStartIndex = [attackStartIndex, assistancStartIndex, specialAttackStartIndex, helloStartIndex, regretStartIndex, standStartIndex, victoryStartIndex, beHitStartIndex, blockStartIndex, deadStartIndex, moveStartIndex];
        this.clipCount = [attackCount, assistanceCount, specialAttackCount, helloCount, regretCount, standCount, victoryCount, beHitCount, blockCount, deadCount, moveCount];
    }
}