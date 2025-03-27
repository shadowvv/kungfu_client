import { WeaponEnum } from "../GameEnumAndConstants";
import { PlayerInfoMessage } from "../Message";

/**
 * 玩家数据
 */
export class PlayerData{

    private playerId:number;//玩家id
    private playerName:string;//玩家名称
    private favouriteWeapon:WeaponEnum;//玩家喜欢的武器
    private winRate:number;//玩家胜率

    private bladeRate:number;//刀的胜率
    private swordRate:number;//剑的胜率
    private spearRate:number;//矛的胜率
    private bowRate:number;//弓的胜率
    private knifeRate:number;//刀的胜率

    constructor(){
        this.playerId = 0;
        this.playerName = "";
        this.favouriteWeapon = 0;
        this.winRate = 0;
        this.bladeRate = 0;
        this.swordRate = 0;
        this.spearRate = 0;
        this.bowRate = 0;
        this.knifeRate = 0;
    }

    init(PlayerInfoMessage: PlayerInfoMessage) {
        this.playerId = PlayerInfoMessage.playerId;
        this.playerName = PlayerInfoMessage.playerName;
        this.favouriteWeapon = PlayerInfoMessage.favouriteWeapon;
        this.winRate = PlayerInfoMessage.winRate;
        this.bladeRate = PlayerInfoMessage.bladeRate;
        this.swordRate = PlayerInfoMessage.swordRate;
        this.spearRate = PlayerInfoMessage.spearRate;
        this.bowRate = PlayerInfoMessage.bowRate;
        this.knifeRate = PlayerInfoMessage.knifeRate;
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

    setBladeRate(rate:number){
        this.bladeRate = rate;
    }

    getBladeRate():number{
        return this.bladeRate;
    }

    setSwordRate(rate:number){
        this.swordRate = rate;
    }

    getSwordRate():number{
        return this.swordRate;
    }

    setSpearRate(rate:number){
        this.spearRate = rate;
    }

    getSpearRate():number{
        return this.spearRate;
    }

    setBowRate(rate:number){
        this.bowRate = rate;
    }

    getBowRate():number{
        return this.bowRate;
    }

    setKnifeRate(rate:number){
        this.knifeRate = rate;
    }

    getKnifeRate():number{
        return this.knifeRate;
    }

}