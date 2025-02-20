import { _decorator, Component, resources, JsonAsset, director } from 'cc';
import { ViewConfig } from './JsonObject/ViewConfig';
import { GameConfig } from './JsonObject/GameConfig';
import { ServerConfig } from './JsonObject/ServerConfig';
import { WeaponConfig } from './JsonObject/WeaponConfig';
const { ccclass } = _decorator;

/**
 * 加载场景
 */
@ccclass('LoadingScene')
export class LoadingScene extends Component {

    onLoad() {
        // 加载所有配置文件
        Promise.all([
            ViewConfig.getInstance().loadConfig(),
            GameConfig.getInstance().loadConfig(),
            ServerConfig.getInstance().loadConfig(),
            WeaponConfig.getInstance().loadConfig(),
        ]).then(() => {
            console.log("All configs loaded successfully.");
            director.loadScene("newScene"); // 加载完成后切换到主场景
        }).catch((err) => {
            console.error("Error loading configs:", err);
        });
    }
}
