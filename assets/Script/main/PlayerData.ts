import { WeaponEnum } from "./GameEnumAndConstants";
import { PlayerInfoMessage } from "./Message";

/**
 * 玩家数据
 */
export class PlayerData{

    private playerId:number;//玩家id
    private playerName:string;//玩家名称
    private favouriteWeapon:WeaponEnum;//玩家喜欢的武器
    private winRate:number;//玩家胜率
    private weaponWinRate:Map<number, number>;//玩家使用的武器

    constructor(){
        this.playerId = 0;
        this.playerName = "test";
        this.favouriteWeapon = 0;
        this.winRate = 0;
        this.weaponWinRate = new Map<number, number>();
    }

    init(playerInfoMessage: PlayerInfoMessage) {
        this.playerId = playerInfoMessage.playerId;
        this.playerName = playerInfoMessage.nickName;
    
        // 假设 favouriteWeapon 是使用次数最多的武器
        let maxUseCount = 0;
        // 计算总的使用次数
        let totalUses = 0;
        // 计算总的胜利次数
        let totalWins = 0;
        playerInfoMessage.weaponUseCountMap.forEach((weapon,count) => {
            if (count > maxUseCount) {
                maxUseCount = count;
                this.favouriteWeapon = weapon;
            }
            totalUses += count;
            let weaponWinCount = playerInfoMessage.weaponWinCountMap.get(weapon) ? playerInfoMessage.weaponWinCountMap.get(weapon) : 0;
            totalWins += weaponWinCount;
            this.weaponWinRate.set(weapon, weaponWinCount / count);
        });
    
        // 计算胜率
        this.winRate = totalUses > 0 ? totalWins / totalUses : 0;
    }

    setPlayerName(name:string){
        this.playerName = name;
    }

    setPlayerId(id:number){
        this.playerId = id;
    }

    getPlayerName():string{
        return this.playerName;
    }

    getPlayerId():number{
        return this.playerId;
    }

    setFavouriteWeapon(weapon:number){
        this.favouriteWeapon = weapon;
    }

    getFavouriteWeapon():number{
        return this.favouriteWeapon;
    }

    setWinRate(rate:number){
        this.winRate = rate;
    }

    getWinRate():number{
        return this.winRate;
    }

    getWeaponWinRate(weapon:number):number{
        return this.weaponWinRate.get(weapon) ? this.weaponWinRate.get(weapon) : 0;
    }
}