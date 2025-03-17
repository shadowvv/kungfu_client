import { _decorator, Component, Label, Node, director, tween, UITransform, Vec3, Canvas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MarqueeManager')
export class MarqueeManager extends Component {
    
    private static instance: MarqueeManager = null;
    private marqueeLabel: Label = null;
    private messages: string[] = [];
    private isPlaying: boolean = false;
    private marqueeNode: Node = null;

    onLoad() {
        if (MarqueeManager.instance) {
            this.destroy();
            return;
        }
        MarqueeManager.instance = this;

        // 确保当前场景有 Canvas
        const scene = director.getScene();
        const canvas = scene.getComponentInChildren(Canvas);
        
        if (!canvas) {
            console.error("No Canvas found in the scene!");
            return;
        }

        // 设置当前节点为常驻节点（切换场景不会销毁）
        director.addPersistRootNode(this.node);

        // 确保 UI 层级最高
        this.node.setSiblingIndex(999);

        // 创建走马灯 UI
        this.createMarqueeUI();

        // 把常驻节点的 UI 子节点移动到 Canvas 下面
        if (this.marqueeNode.parent !== canvas.node) {
            canvas.node.addChild(this.marqueeNode);
        }
    }

    onEnable() {
        this.checkCanvas();
    }

    private checkCanvas() {
        const scene = director.getScene();
        if (!scene) {
            console.error("Scene not loaded yet!");
            return;
        }
    
        // 获取 Canvas
        const canvas = scene.getComponentInChildren(Canvas);
        if (!canvas) {
            console.error("Canvas not found in the scene!");
            return;
        }
    
        // 重新创建 `marqueeNode`（如果丢失）
        if (!this.marqueeNode) {
            console.warn("marqueeNode was lost, recreating...");
            this.createMarqueeUI(); // 重新创建 UI
        }
    
        // 重新创建 `marqueeLabel`（如果丢失）
        if (!this.marqueeLabel) {
            console.warn("marqueeLabel was lost, recreating...");
            const labelNode = new Node("MarqueeLabel");
            this.marqueeLabel = labelNode.addComponent(Label);
            this.marqueeLabel.fontSize = 30;
            this.marqueeLabel.lineHeight = 40;
            this.marqueeNode.addChild(labelNode);
        }
    
        // 如果 marqueeNode 丢失，则重新创建
        if (!this.marqueeNode || !this.marqueeNode.isValid) {
            console.warn("marqueeNode was lost, recreating...");
            this.createMarqueeUI();
        }

        // 确保 `marqueeNode` 在 `Canvas` 之下
        if (this.marqueeNode.parent !== canvas.node) {
            console.warn("marqueeNode parent is incorrect, reassigning...");
            canvas.node.addChild(this.marqueeNode);
            this.marqueeNode.setSiblingIndex(999);
        }
    }

    private createMarqueeUI() {
        // 创建走马灯节点
        this.marqueeNode = new Node("MarqueeNode");
        const transform = this.marqueeNode.addComponent(UITransform);
        transform.width = 600;
        transform.height = 50;
        this.marqueeNode.setPosition(0, 250);

        // 创建 Label
        const labelNode = new Node("MarqueeLabel");
        this.marqueeLabel = labelNode.addComponent(Label);
        this.marqueeLabel.fontSize = 30;
        this.marqueeLabel.lineHeight = 40;
        this.marqueeLabel.string = "";
        labelNode.setPosition(300, 0);
        this.marqueeNode.addChild(labelNode);

        // 将走马灯节点挂载到常驻节点（this.node）
        this.node.addChild(this.marqueeNode);
        this.marqueeNode.setSiblingIndex(999);
    }

    /** 添加一条走马灯消息 */
    static addMessage(message: string) {
        if (!MarqueeManager.instance) return;
        MarqueeManager.instance.messages.push(message);
        MarqueeManager.instance.playNext();
    }

    /**
     * 重置走马灯节点
     */
    static reset() {
        MarqueeManager.instance.resetNode();
    }

    /**
     * 重置走马灯节点位置到常驻节点
     */
    resetNode() {
        this.node.addChild(this.marqueeNode);
    }

    /** 播放下一条消息 */
    private playNext() {
        if (this.isPlaying || this.messages.length === 0) return;

        this.isPlaying = true;
        const message = this.messages.shift();
        this.marqueeLabel.string = message;

        // 设置初始位置（屏幕右侧外部）
        this.marqueeLabel.node.setPosition(400, 0);

        // 计算滚动时间（速度固定，每秒 100 像素）
        const textWidth = this.marqueeLabel.node.getComponent(UITransform).width;
        const duration = (textWidth + 800) / 300; // 800 代表整个滚动范围
        // 开始滚动动画
        tween(this.marqueeLabel.node)
            .to(duration, { position: new Vec3(-400 - textWidth, 0, 0) }) // 向左滚动
            .call(() => {
                this.isPlaying = false;
                this.marqueeLabel.string = "";
                this.playNext(); // 播放下一条
            })
            .start();
    }
}