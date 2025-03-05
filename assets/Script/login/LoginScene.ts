import { _decorator, Button, Component, EditBox, Node, Sprite } from 'cc';
import { ResourceTarget } from '../GameEnumAndConstants';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceManager } from '../ResourceManager';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends Component {

    @property(Sprite)
    private background: Sprite = null;
    @property(Button)
    private loginButton: Button = null;
    @property(EditBox)
    private userNameInputText: EditBox = null;

    private username: string;

    onLoad(): void {
        const loginResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.LoginScene);
        if(!loginResourceConfig){
            console.error("Failed to load login resource config");
        }

        const backgroundFrame = ResourceManager.getSpriteFrame(loginResourceConfig.backgroundFrameArray[0]);
        if(!backgroundFrame){
            console.error("Failed to load background frame");
        }
        // this.background.spriteFrame = backgroundFrame;
    }

    start() {
        GameManager.showErrorLog("test login log");
    }

    /**
     * 处理登录按钮点击事件
     */
    login(): void {
        if (this.userNameInputText.string === "") {
            GameManager.showErrorLog("用户名不能为空！");
            return;
        }
        this.username = this.userNameInputText.string;
        GameManager.sendLoginMessage(this.username);
    }

    // /**
    //  * 登录成功后的回调
    //  * @param playerId 玩家 ID
    //  */
    // afterLogin(playerId: number): void {
    //     this.playerId = playerId;

    //     this.loginButton.node.active = false;
    //     this.userNameInputText.node.active = false;
    // }
}


