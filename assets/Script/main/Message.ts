import { _decorator } from 'cc';
import { getFloat2Int } from './GameEnumAndConstants';

/**
 * 消息基类
 */
export class BaseMessage {
    public id: number;

    /**
     * 将对象序列化为 JSON 字符串
     * @returns JSON 字符串
     */
    message2JSON(): string {
        return JSON.stringify(this);
    }

    /**
     * 从 JSON 字符串反序列化为对象
     * @param json JSON 字符串
     * @param ctor 构造函数
     * @returns 反序列化后的对象
     */
    static fromJSON<T extends BaseMessage>(json: string, ctor: new () => T): T {
        const template = new ctor(); // 实例化对象
        const plainObject = JSON.parse(json); // 解析 JSON

        // 遍历属性，手动处理数组或对象
        for (const key in plainObject) {
            if (Array.isArray(plainObject[key]) && key === 'roles') {
                // 将 roles 转换为 RoleMessage 数组
                template[key] = plainObject[key].map((item: any) => {
                    const role = new RoleMessage();
                    Object.assign(role, item);
                    return role;
                });
            } else if (key === 'playerInfo') {
                // 将普通对象转换为 Map
                const playerInfo = new PlayerInfoMessage();
                Object.assign(playerInfo, plainObject[key]);
                playerInfo.weaponUseCountMap = new Map<number, number>();
                playerInfo.weaponWinCountMap = new Map<number, number>();
                for (const weaponType in plainObject[key].weaponUseCountMap) {
                    playerInfo.weaponUseCountMap.set(Number(weaponType), plainObject[key].weaponUseCountMap[weaponType]);
                }
                for (const weaponType in plainObject[key].weaponWinCountMap) {
                    playerInfo.weaponWinCountMap.set(Number(weaponType), plainObject[key].weaponWinCountMap[weaponType]);
                }
                template[key] = playerInfo;
            } else if(Array.isArray(plainObject[key]) && key === 'playerInfoList'){
                // 将 playerInfoList 转换为 PlayerInfoMessage 数组
                template[key] = plainObject[key].map((item: any) => {
                    const playerInfo = new PlayerInfoMessage();
                    Object.assign(playerInfo, item);
                    playerInfo.weaponUseCountMap = new Map<number, number>();
                    playerInfo.weaponWinCountMap = new Map<number, number>();
                    for (const weaponType in item.weaponUseCountMap) {
                        playerInfo.weaponUseCountMap.set(Number(weaponType), item.weaponUseCountMap[weaponType]);
                    }
                    for (const weaponType in item.weaponWinCountMap) {
                        playerInfo.weaponWinCountMap.set(Number(weaponType), item.weaponWinCountMap[weaponType]);
                    }
                    return playerInfo;
                });
            } else  {
                // 普通属性直接赋值
                template[key] = plainObject[key];
            }
        }

        return template;
    }
}

/**
 * 注册请求消息
 */
export class RegisterReqMessage extends BaseMessage {
    
    public userName: string;
    public password: string;

    constructor() {
        super();
        this.id = MessageType.REGISTER_REQ;
    }
}

/**
 * 注册响应消息
 */
export class RegisterRespMessage extends BaseMessage {

    public playerInfo:PlayerInfoMessage = null;

    constructor() {
        super();
        this.id = MessageType.REGISTER_RESP;
    }
}

/**
 * 登录请求消息
 */
export class LoginReqMessage extends BaseMessage {

    public userName: string;
    public password: string;

    constructor() {
        super();
        this.id = MessageType.LOGIN_REQ;
    }
}

/**
 * 登录响应消息
 */
export class LoginRespMessage extends BaseMessage {

    public playerInfo:PlayerInfoMessage = null;

    constructor() {
        super();
        this.id = MessageType.LOGIN_RESP;
    }
}

/**
 * 修改昵称请求消息
 */
export class RenameReqMessage extends BaseMessage {
    public nickname: string;

    constructor() {
        super();
        this.id = MessageType.RENAME_REQ;
    }
}

/**
 * 修改昵称响应消息
 */
export class RenameRespMessage extends BaseMessage {

    constructor() {
        super();
        this.id = MessageType.RENAME_RESP;
    }
}

/**
 * 申请对战请求消息
 */
export class ApplyBattleReqMessage extends BaseMessage {
    public weaponType: number;

    constructor() {
        super();
        this.id = MessageType.APPLY_BATTLE_REQ;
    }
}

/**
 * 申请对战响应消息
 */
export class ApplyBattleRespMessage extends BaseMessage {
    public roleId: number;
    public weaponType: number;

    constructor() {
        super();
        this.id = MessageType.APPLY_BATTLE_RESP;
    }
}

/**
 * 取消匹配请求消息
 */
export class CancelMatchReqMessage extends BaseMessage {
    constructor() {
        super();
        this.id = MessageType.CANCEL_MATCH_REQ;
    }
}

/**
 * 取消匹配响应消息
 */
export class CancelMatchRespMessage extends BaseMessage {
    constructor() {
        super();
        this.id = MessageType.CANCEL_MATCH_RESP;
    }
}

/**
 * 操作请求消息
 */
export class OperationReqMessage extends BaseMessage {
    public roleId: number = 0;
    public x: number;
    public y: number;
    public faceAngle: number;

    constructor() {
        super();
        this.id = MessageType.OPERATION_REQ;
    }

    /**
     * 
     * @param x x坐标
     */
    setPositionX(x: number): void {
        this.x = Math.floor(x * getFloat2Int());
    }

    /**
     *  
     * @param y y坐标
     */
    setPositionY(y: number): void {
        this.y = Math.floor(y * getFloat2Int());
    }

    /**
     * 
     * @param faceAngle 面向角度
     */
    setFaceAngle(faceAngle: number): void {
        this.faceAngle = Math.floor(faceAngle * getFloat2Int());
    }
}

/**
 * 操作响应消息
 */
export class OperationRespMessage extends BaseMessage {
    public success: boolean;

    constructor() {
        super();
        this.id = MessageType.OPERATION_RESP;
    }
}

/**
 * 错误消息
 */
export class ErrorMessage extends BaseMessage {
    public reqId: number;
    public errorCode: number;

    constructor() {
        super();
        this.id = MessageType.ERROR_MESSAGE;
    }
}

/**
 * 匹配结果广播消息
 */
export class MatchResultBroadMessage extends BaseMessage {
    public playerInfoList: PlayerInfoMessage[];

    constructor() {
        super();
        this.id = MessageType.MATCH_RESULT_BROAD;
    }
}

/**
 * 战斗加载准备请求消息
 */
export class LoadBattleReadyReqMessage extends BaseMessage {
    constructor() {
        super();
        this.id = MessageType.BATTLE_LOAD_READY_REQ;
    }
}

/**
 * 战斗加载准备响应消息
 */
export class LoadBattleReadyRespMessage extends BaseMessage {
    constructor() {
        super();
        this.id = MessageType.BATTLE_LOAD_READY_RESP;
    }
}

/**
 * 战斗开始推送消息
 */
export class BattleStartBroadMessage extends BaseMessage {
    public roles: RoleMessage[];

    constructor() {
        super();
        this.id = MessageType.BATTLE_START_BROAD;
    }
}

/**
 * 战斗结果广播消息
 */
export class BattleResultBroadMessage extends BaseMessage {
    public roles: RoleMessage[];
    public winRoleId: number;

    constructor() {
        super();
        this.id = MessageType.BATTLE_RESULT_BROAD;
    }
}

/**
 * 战斗状态广播消息
 */
export class BattleStateBroadMessage extends BaseMessage {
    public battleState: number;

    constructor() {
        super();
        this.id = MessageType.BATTLE_STATE_BROAD;
    }
}

/**
 * 角色信息消息
 */
export class RoleMessage {
    public roleId: number;
    public userName: string;
    public weaponType: number;
    public x: number;
    public y: number;
    public faceAngle: number;
    public hp: number;

    /**
     * 
     * @returns x 坐标
     */
    getPositionX(): number {
        return this.x / getFloat2Int();
    }

    /**
     * 
     * @returns y 坐标
     */
    getPositionY(): number {
        return this.y / getFloat2Int();
    }

    /**
     * 
     * @returns 面向角度
     */
    getFaceAngle(): number {
        return this.faceAngle / getFloat2Int();
    }

    /**
     * 
     * @returns 血量
     */
    getHp(): number {
        return this.hp / getFloat2Int();
    }
}

/**
 * 玩家信息消息
 */
export class PlayerInfoMessage {
    public playerId: number;
    public userName: string;
    public nickName: string;
    public weaponUseCountMap: Map<number, number>;
    public weaponWinCountMap: Map<number, number>;
    public roleId: number;
    public weaponType: number;

    constructor() {
        this.playerId = 0;
        this.userName = "";
        this.nickName = "";
        this.weaponUseCountMap = new Map<number, number>();
        this.weaponWinCountMap = new Map<number, number>();
        this.roleId = 0;
        this.weaponType = 0;
    }
}

/**
 * 消息类型枚举
 */
export enum MessageType {
    LOGIN_REQ = 1001,
    LOGIN_RESP = 1002,
    REGISTER_REQ = 1003,
    REGISTER_RESP = 1004,
    RENAME_REQ = 1005,
    RENAME_RESP = 1006,

    APPLY_BATTLE_REQ = 2001,
    APPLY_BATTLE_RESP = 2002,
    CANCEL_MATCH_REQ = 3001,
    CANCEL_MATCH_RESP = 3002,
    BATTLE_LOAD_READY_REQ = 5001,
    BATTLE_LOAD_READY_RESP = 5002,

    OPERATION_REQ = 4001,
    OPERATION_RESP = 4002,

    ERROR_MESSAGE = 9999,

    MATCH_RESULT_BROAD = 10001,
    BATTLE_START_BROAD = 10002,
    BATTLE_RESULT_BROAD = 10003,
    BATTLE_STATE_BROAD = 10004,
}