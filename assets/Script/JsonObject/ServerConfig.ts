import { _decorator, resources, JsonAsset } from 'cc';
const { ccclass } = _decorator;

/**
 * 服务器配置类
 */
@ccclass('ServerConfig')
export class ServerConfig {
    private static instance: ServerConfig = null;
    private static readonly CONFIG_FILE: string = 'config/serverConfig';
    static getInstance(): ServerConfig {
        if (ServerConfig.instance == null) {
            ServerConfig.instance = new ServerConfig();
        }
        return ServerConfig.instance;
    }

    private servers: ServerData[] = [];

    private constructor() {
    }

    /**
     * 加载配置文件
     */
    loadConfig(): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.load(ServerConfig.CONFIG_FILE, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load config:', err);
                    reject(err);
                    return;
                }
                let json = jsonAsset.json;
                for (let i = 0; i < json.length; i++) {
                    let server = new ServerData(json[i].environment, json[i].serverHost, json[i].reconnectInterval);
                    this.servers[json[i].environment] = server;
                }
                console.log("ServerConfig loaded successfully.");
                resolve();
            });
        });
    }

    /**
     * 
     * @param environment 环境
     * @returns 获取服务器数据
     */
    getServerData(environment: string): ServerData {
        return this.servers[environment];
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