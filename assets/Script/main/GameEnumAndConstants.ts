import { _decorator } from 'cc';
import { GameConfig } from '../JsonObject/GameConfig';

export const ENVIRONMENT:string = 'dev';
// export const ENVIRONMENT:string = 'prod';

/**
 * 场景
 */
export enum SceneEnum {
    LoadingScene = "loadingScene",
    LoginScene = "loginScene",
    MainScene = "mainScene",
    BattleScene = "battleScene",
}

/**
 * 资源
 */
export enum ResourceTarget {
    Global = "global",
    LoadingScene = "loadingScene",
    LoginScene = "loginScene",
    MainScene = "mainScene",
    MatchScene = "matchScene",
    BattleScene = "battleScene",
    Blade = "blade",
    Knife = "knife",
    Spear = "spear",
    Bow = "bow",
    Sword = "sword",
}

/**
 * 角色动作类型
 */
export enum ActionType {
    IDLE,
    HELLO,
    MOVE,
    ATTACK,
    ASSISTANCE,
    SPECIAL_ATTACK,
    BLOCK,
    BEHIT,
    VICTORY,
    DEAD,
    REGRET,
}

/**
 * 角色动作方向
 */
export enum ActionDirection {
    LEFT,
    RIGHT,
    UP,
    DOWN,
    LEFT_UP,
    LEFT_DOWN,
    RIGHT_UP,
    RIGHT_DOWn
}

/**
 * 游戏状态
 */
export enum BattleState {
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
 * 武器类型对应的资源
 */
export const weaponToResourceMap: { [key:number]:string } = {
    [WeaponEnum.BLADE]: ResourceTarget.Blade,
    [WeaponEnum.KNIFE]: ResourceTarget.Knife,
    [WeaponEnum.SPEAR]: ResourceTarget.Spear,
    [WeaponEnum.SWORD]: ResourceTarget.Sword,
    [WeaponEnum.BOW]: ResourceTarget.Bow,
}

/**
 * 等待指令倒计时
 */
export function getWaitCommandTick(): number {
    return GameConfig.getInstance().getWaitCommandTick();
}

/**
 * 行动倒计时
 */
export function getWaitActionTick(): number {
    return GameConfig.getInstance().getWaitActionTick();
}

/**
 * 范围基数
 */
export function getBaseNumber(): number {
    return GameConfig.getInstance().getBaseNumber();
}

/**
 * 
 * @returns 浮点数转整数放大倍数
 */
export function getFloat2Int(): number {
    return GameConfig.getInstance().getFloat2Int();
}