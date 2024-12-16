import { _decorator } from 'cc';
const { ccclass } = _decorator;

/**
 * 角色动作
 */
export enum AcitonType {
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
}

/**
 * 游戏状态
 */
export enum GameState {
    /**
     * 准备
     */
    PREPARE,
    /**
     * 等待指令
     */
    WAIT_COMMAND,
    /**
     * 等待其他人
     */
    WAIT_OTHER,
    /**
     * 行动
     */
    ACTION,
    /**
     * 结束
     */
    END,
}

/**
 * 等待指令倒计时
 */
export const WAIT_COMMAND_TICK = 10;

/**
 * 范围基数
 */
export const BASENUMBER: number = 35;

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
 * 武器的详细参数
 */
const WeaponParameter = {
    /**
     * moveRange:移动范围
     * attackRange:攻击范围（扇形区域）
     * attack:攻击力
     */
    [WeaponEnum.BLADE]: { moveRange: BASENUMBER * 3, attackRange: { innerRadius: 0, outerRadius: BASENUMBER * 1.5, startAngle: 0, endAngle: 90 }, attack: 1 },
    [WeaponEnum.SWORD]: { moveRange: BASENUMBER * 3, attackRange: { innerRadius: 0, outerRadius: BASENUMBER * 1.5, startAngle: 0, endAngle: 60 }, attack: 1.5 },
    [WeaponEnum.SPEAR]: { moveRange: BASENUMBER * 2, attackRange: { innerRadius: BASENUMBER * 4, outerRadius: BASENUMBER * 5, startAngle: 0, endAngle: 45 }, attack: 1 },
    [WeaponEnum.KNIFE]: { moveRange: BASENUMBER * 4, attackRange: { innerRadius: 0, outerRadius: BASENUMBER * 1, startAngle: 0, endAngle: 90 }, attack: 2 },
    [WeaponEnum.BOW]: { moveRange: BASENUMBER * 4, attackRange: { innerRadius: BASENUMBER * 3, outerRadius: BASENUMBER * 7, startAngle: 0, endAngle: 45 }, attack: 1 },
};

@ccclass('RoleFactory')
export class RoleFactory {

    /**
     * 获得攻击范围
     * @param weaponType 武器类型
     * @returns 攻击范围
     */
    static getAttackRange(weaponType: WeaponEnum) {
        return WeaponParameter[weaponType].attackRange;
    }

    /**
     * 获得移动范围
     * @param weaponType 武器类型
     * @returns 移动范围
     */
    static getMoveRange(weaponType: WeaponEnum) {
        return WeaponParameter[weaponType].moveRange;
    }

    /**
     * 获得攻击力
     * @param weaponType 武器类型
     * @returns 攻击力 
     */
    static getAattack(weaponType: WeaponEnum) {
        return WeaponParameter[weaponType].attack;
    }

}


