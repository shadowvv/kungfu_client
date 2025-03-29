import { _decorator, Component, Label } from 'cc';
import { PlayerData } from './main/PlayerData';
import { WeaponEnum } from './main/GameEnumAndConstants';
const { ccclass, property } = _decorator;

/**
 * @description 玩家信息展示类
 * @author Drop
 * @date 2025年3月28日
 */
@ccclass('PlayerShow')
export class PlayerShow extends Component {

    @property(Label)
    private nameLabel:Label = null;
    @property(Label)
    private winRateLabel:Label = null;
    @property(Label)
    private favoriteWeaponLabel:Label = null;
    @property(Label)
    private bladeRateLabel:Label = null;
    @property(Label)
    private spearRateLabel:Label = null;
    @property(Label)
    private swordRateLabel:Label = null;
    @property(Label)
    private bowRateLabel:Label = null;
    @property(Label)
    private knifeRateLabel:Label = null;

    /**
     * @description 显示玩家信息
     * @param playerData 玩家数据
     */
    showPlayerInfo(playerData:PlayerData) {
        this.nameLabel.string = this.nameLabel.string + playerData.getPlayerName();
        this.winRateLabel.string = this.winRateLabel.string + playerData.getWinRate().toString();
        this.favoriteWeaponLabel.string = this.favoriteWeaponLabel.string + playerData.getFavouriteWeapon().toString();

        this.bladeRateLabel.string = this.bladeRateLabel.string + playerData.getWeaponWinRate(WeaponEnum.BLADE).toString();
        this.bowRateLabel.string = this.bowRateLabel.string + playerData.getWeaponWinRate(WeaponEnum.BOW).toString();
        this.knifeRateLabel.string = this.knifeRateLabel.string + playerData.getWeaponWinRate(WeaponEnum.KNIFE).toString();
        this.spearRateLabel.string = this.spearRateLabel.string + playerData.getWeaponWinRate(WeaponEnum.SPEAR).toString();
        this.swordRateLabel.string = this.swordRateLabel.string + playerData.getWeaponWinRate(WeaponEnum.SWORD).toString();
    }
}


