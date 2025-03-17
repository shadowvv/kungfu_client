import { _decorator, Button, Component, director, EditBox, Sprite } from 'cc';
import { ResourceTarget, SceneEnum } from '../GameEnumAndConstants';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceManager } from '../ResourceManager';
import { GameManager } from '../GameManager';
import { MarqueeManager } from '../MarqueeManager';
import { GlobalEventManager } from '../GlobalEventManager';
import { LoginReqMessage, LoginRespMessage, MessageType } from '../Message';
const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends Component {

    @property(Sprite)
    private background: Sprite = null;
    @property(Button)
    private loginButton: Button = null;
    @property(EditBox)
    private userNameInputText: EditBox = null;

    onLoad(): void {
        const loginResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.LoginScene);
        if(!loginResourceConfig){
            MarqueeManager.addMessage("Failed to load login resource config");
        }

        const backgroundFrame = ResourceManager.getSpriteFrame(loginResourceConfig.backgroundFrameArray[0]);
        if(!backgroundFrame){
            MarqueeManager.addMessage("Failed to load background frame");
        }
        this.background.spriteFrame = backgroundFrame;

        GlobalEventManager.getInstance().on(MessageType.LOGIN_RESP, this.afterLogin.bind(this));
    }

    /**
     * 处理登录按钮点击事件
     */
    login(): void {
        if (this.userNameInputText.string === "") {
            GameManager.showErrorLog("用户名不能为空！");
            return;
        }

        const loginReq = new LoginReqMessage();
        loginReq.userName = this.userNameInputText.string;
        GameManager.sendMessage(loginReq);
    }

    /**
     * 登录成功后的回调
     * @param playerId 玩家 ID
     */
    afterLogin(loginRespMessage: LoginRespMessage): void {
        // this.playerId = playerId;

        this.loginButton.node.active = false;
        this.userNameInputText.node.active = false;
        
        MarqueeManager.reset();
        director["sceneParams"] = {
            targetScene: "mainScene",
        }
        director.loadScene(SceneEnum.LoadingScene);
    }

    destroy(): boolean {
        const result = super.destroy();
        GlobalEventManager.getInstance().off(MessageType.LOGIN_RESP, this.afterLogin.bind(this));
        return result;
    }
}


