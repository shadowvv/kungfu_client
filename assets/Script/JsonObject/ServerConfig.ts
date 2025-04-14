import { _decorator, resources, JsonAsset } from 'cc';
const { ccclass } = _decorator;

/**
 * 服务器配置类
 */
@ccclass('ServerConfig')
export class ServerConfig {
    public static readonly CONFIG_FILE: string = 'config/serverConfig';
    
    private static instance: ServerConfig = null;
    static getInstance(): ServerConfig {
        if (ServerConfig.instance == null) {
            ServerConfig.instance = new ServerConfig();
        }
        return ServerConfig.instance;
    }

    private resources: Map<string, ServerData> = new Map();
    private loaded:boolean = false;

    private constructor() {
    }

    /**
     * 加载配置文件
     */
    loadConfig(jsonAsset: JsonAsset): void {
        const json = jsonAsset.json;

        if (!Array.isArray(json)) {
            console.error("loadConfig 失败,json 不是数组", json);
            return;
        }

        for (let i = 0; i < json.length; i++) {
            let server = new ServerData(json[i].environment, json[i].serverHost, json[i].reconnectInterval);
            this.resources.set(json[i].environment, server);
        }
        this.loaded = true;
    }

    isLoaded() {
        return this.loaded;
    }

    /**
     * 
     * @param environment 环境
     * @returns 获取服务器数据
     */
    getServerData(environment: string): ServerData {
        return this.resources.get(environment);
    }

}

/**
 * 服务器数据
 * @param environment 环境
 * @param serverHost 服务器地址
 * @param reconnectInterval 重连间隔
 */
export class ServerData{

    public environment: string = '';
    public serverHost: string = '';
    public reconnectInterval: number = 0;

    constructor(environment: string, serverHost: string, reconnectInterval: number) {
        this.environment = environment;
        this.serverHost = serverHost;
        this.reconnectInterval = reconnectInterval;
    }
}