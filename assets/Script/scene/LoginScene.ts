import { _decorator, Button, Component, EditBox, Sprite } from 'cc';
import { ResourceTarget, SceneEnum } from '../main/GameEnumAndConstants';
import { ResourceConfig, resourceData } from '../JsonObject/ResourceConfig';
import { ResourceManager } from '../main/ResourceManager';
import { GameManager } from '../main/GameManager';
import { GlobalEventManager } from '../main/GlobalEventManager';
import { LoginReqMessage, LoginRespMessage, MessageType, RegisterReqMessage, RegisterRespMessage,PlayerInfoMessage } from '../main/Message';
const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends Component {

    @property(Sprite)
    private background: Sprite = null;
    @property(Button)
    private loginButton: Button = null;
    @property(Button)
    private registerButton: Button = null;
    @property(EditBox)
    private userNameInputText: EditBox = null;
    @property(EditBox)
    private passwordInputText: EditBox = null;

    onLoad(): void {
        const loginResourceConfig:resourceData = ResourceConfig.getInstance().getResourceConfig(ResourceTarget.LoginScene);
        if(!loginResourceConfig){
            GameManager.showErrorLog("Failed to load login resource config");
        }

        const backgroundFrame = ResourceManager.getSpriteFrame(loginResourceConfig.backgroundFrameArray[0]);
        if(!backgroundFrame){
            GameManager.showErrorLog("Failed to load background frame: "+loginResourceConfig.backgroundFrameArray[0]);
        }
        this.background.spriteFrame = backgroundFrame;

        GlobalEventManager.getInstance().on(MessageType.LOGIN_RESP, this.afterLogin.bind(this));
        GlobalEventManager.getInstance().on(MessageType.REGISTER_RESP, this.registerSuccess.bind(this));
    }

    /**
     * 注册按钮点击事件
     * @param event 
     * @param customEventData 
     * @returns 
     */
    register(event: Event, customEventData: string): void {
        if (this.userNameInputText.string === "") {
            GameManager.showErrorLog("用户名不能为空！");
            return;
        }
        if (this.passwordInputText.string === "") {
            GameManager.showErrorLog("密码不能为空！");
            return;
        }
        const registerReq = new RegisterReqMessage();
        registerReq.userName = this.userNameInputText.string;
        registerReq.password = this.passwordInputText.string;
        GameManager.sendMessage(registerReq);
    }

    /**
     * 注册成功后的回调
     * @param registerRespMessage 注册响应消息
     */
    registerSuccess(registerRespMessage:RegisterRespMessage): void {
        this.operationSuccess(registerRespMessage.playerInfo);
    }

    /**
     * 处理登录按钮点击事件
     */
    login(event: Event, customEventData: string): void {
        if (this.userNameInputText.string === "") {
            GameManager.showErrorLog("用户名不能为空！");
            return;
        }
        if (this.passwordInputText.string === "") {
            GameManager.showErrorLog("密码不能为空！");
            return;
        }

        const loginReq = new LoginReqMessage();
        loginReq.userName = this.userNameInputText.string;
        loginReq.password = this.passwordInputText.string;
        GameManager.sendMessage(loginReq);
    }

    /**
     * 登录成功后的回调
     * @param playerId 玩家 ID
     */
    afterLogin(loginRespMessage: LoginRespMessage): void {
        this.operationSuccess(loginRespMessage.playerInfo)
    }

    /**
     * 操作成功后的回调
     * @param PlayerInfoMessage 玩家信息
     */
    operationSuccess(PlayerInfoMessage: PlayerInfoMessage){
        GameManager.initPlayerData(PlayerInfoMessage);

        this.loginButton.node.active = false;
        this.registerButton.node.active = false;
        this.userNameInputText.node.active = false;
        this.passwordInputText.node.active = false;
        
        GameManager.enterNextScene(SceneEnum.MainScene);
    }

    destroy(): boolean {
        GlobalEventManager.getInstance().off(MessageType.LOGIN_RESP, this.afterLogin.bind(this));
        GlobalEventManager.getInstance().off(MessageType.REGISTER_RESP, this.registerSuccess.bind(this));
        return super.destroy();
    }
}


