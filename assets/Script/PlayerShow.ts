import { _decorator, Component, Label, Node } from 'cc';
import { GameManager } from './main/GameManager';
import { PlayerData } from './main/PlayerData';
const { ccclass, property } = _decorator;

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

    showPlayerInfo(playerData:PlayerData) {
        this.nameLabel.string = this.nameLabel.string + playerData.getPlayerName();
        this.winRateLabel.string = this.winRateLabel.string + playerData.getWinRate().toString();
        this.favoriteWeaponLabel.string = this.favoriteWeaponLabel.string + playerData.getFavouriteWeapon().toString();

        this.bladeRateLabel.string = this.bladeRateLabel.string + playerData.getBladeRate().toString();
        this.bowRateLabel.string = this.bowRateLabel.string + playerData.getBowRate().toString();
        this.knifeRateLabel.string = this.knifeRateLabel.string + playerData.getKnifeRate().toString();
        this.spearRateLabel.string = this.spearRateLabel.string + playerData.getSpearRate().toString();
        this.swordRateLabel.string = this.swordRateLabel.string + playerData.getSwordRate().toString();
    }
}


