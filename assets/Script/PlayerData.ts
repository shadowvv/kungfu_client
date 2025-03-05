
export class PlayerData{

    private playerName:string;
    private playerId:number;

    setPlayerName(name:string){
        this.playerName = name;
    }

    setPlayerId(id:number){
        this.playerId = id;
    }

    public getPlayerName():string{
        return this.playerName;
    }

    public getPlayerID():number{
        return this.playerId;
    }

}