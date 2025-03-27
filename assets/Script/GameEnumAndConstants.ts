import { _decorator, Game } from 'cc';
import { GameConfig } from './JsonObject/GameConfig';

// export const ENVIRONMENT:string = 'dev';
export const ENVIRONMENT:string = 'prod';

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