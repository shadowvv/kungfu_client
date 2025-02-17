import { _decorator } from 'cc';
const { ccclass } = _decorator;

/**
 * 等待指令倒计时
 */
export const WAIT_COMMAND_TICK:number = 10;

/**
 * 行动倒计时
 */
export const WAIT_ACTION_TICK: number = 5;

/**
 * 范围基数
 */
export const BASE_NUMBER: number = 35;

/**
 * 角色动作类型
 */
export enum ActionType {
    /**
     * 移动
     */
    MOVE,
    /**
     * 攻击
     */
    ATTACK,
    /**
     * 等待
     */
    WAIT,
    /**
     * 行动
     */
    ACTION,
}

/**
 * 游戏状态
 */
export enum GameState {
    /**
     * 登录
     */
    LOGIN,
    /**
     * 选择武器
     */
    CHOOSE_WEAPON,
    /**
     * 准备
     */
    PREPARE,
    /**
     * 等待指令
     */
    WAIT_COMMAND,
    /**
     * 行动
     */
    ACTION,
    /**
     * 等待行动结束
     */
    WAIT_ACTION,
    /**
     * 结束
     */
    END,
}

/**
 * 武器类型
 */
export enum WeaponEnum {
    /**
     * 剑
     */
    BLADE,
    /**
     * 刀
     */
    SWORD,
    /**
     * 长矛
     */
    SPEAR,
    /**
     * 匕首
     */
    KNIFE,
    /**
     * 弓
     */
    BOW,
}

/**
 * 攻击范围配置
 */
type AttackRange = {
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
};

/**
 * 武器参数配置
 */
const WeaponParameter = {
    [WeaponEnum.BLADE]: {
        moveRange: BASE_NUMBER * 3,
        attackRange: { innerRadius: 0, outerRadius: BASE_NUMBER * 1.5, startAngle: 0, endAngle: 90 },
        attack: 1,
    },
    [WeaponEnum.SWORD]: {
        moveRange: BASE_NUMBER * 3,
        attackRange: { innerRadius: 0, outerRadius: BASE_NUMBER * 1.5, startAngle: 0, endAngle: 60 },
        attack: 1.5,
    },
    [WeaponEnum.SPEAR]: {
        moveRange: BASE_NUMBER * 2,
        attackRange: { innerRadius: BASE_NUMBER * 4, outerRadius: BASE_NUMBER * 5, startAngle: 0, endAngle: 45 },
        attack: 1,
    },
    [WeaponEnum.KNIFE]: {
        moveRange: BASE_NUMBER * 4,
        attackRange: { innerRadius: 0, outerRadius: BASE_NUMBER * 1, startAngle: 0, endAngle: 90 },
        attack: 2,
    },
    [WeaponEnum.BOW]: {
        moveRange: BASE_NUMBER * 4,
        attackRange: { innerRadius: BASE_NUMBER * 3, outerRadius: BASE_NUMBER * 7, startAngle: 0, endAngle: 45 },
        attack: 1,
    },
};

@ccclass('RoleFactory')
export class RoleFactory {
    /**
     * 获得攻击范围
     * @param weaponType 武器类型
     * @returns 攻击范围
     */
    static getAttackRange(weaponType: WeaponEnum): AttackRange {
        return WeaponParameter[weaponType].attackRange;
    }

    /**
     * 获得移动范围
     * @param weaponType 武器类型
     * @returns 移动范围
     */
    static getMoveRange(weaponType: WeaponEnum): number {
        return WeaponParameter[weaponType].moveRange;
    }

    /**
     * 获得攻击力
     * @param weaponType 武器类型
     * @returns 攻击力
     */
    static getAttack(weaponType: WeaponEnum): number {
        return WeaponParameter[weaponType].attack;
    }
}