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
    ATTACK = 0,
    ASSISTANCE = 1,
    SPECIAL_ATTACK = 2,

    HELLO = 3,
    REGRET = 4,
    STAND = 5,
    VICTORY = 6,
    
    BEHIT = 7,
    BLOCK = 8,
    DEAD = 9,
    MOVE = 10,
}

/**
 * 角色动作方向
 */
export enum ActionDirection {
    RIGHT = 0,
    RIGHT_DOWN = 1,
    DOWN = 2,
    LEFT_DOWN = 3,
    LEFT = 4,
    LEFT_UP = 5,
    UP = 6,
    RIGHT_UP = 7,
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
    blade,
    /**
     * 刀
     */
    sword,
    /**
     * 长矛
     */
    spear,
    /**
     * 匕首
     */
    knife,
    /**
     * 弓
     */
    bow,
}

/**
 * 武器类型对应的资源
 */
export const weaponToResourceMap: { [key:number]:string } = {
    [WeaponEnum.blade]: ResourceTarget.Blade,
    [WeaponEnum.knife]: ResourceTarget.Knife,
    [WeaponEnum.spear]: ResourceTarget.Spear,
    [WeaponEnum.sword]: ResourceTarget.Sword,
    [WeaponEnum.bow]: ResourceTarget.Bow,
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