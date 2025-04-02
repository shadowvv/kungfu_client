import { _decorator, Component, Vec2, Vec3, Animation, AnimationClip, resources, SpriteAtlas, SpriteFrame } from 'cc';
import { ResourceManager } from '../main/ResourceManager';
import { ActionDirection, ActionType } from '../main/GameEnumAndConstants';
const { ccclass,property } = _decorator;

/**
 * 身体绘制组件
 */
@ccclass('Body')
export class Body extends Component {

    @property(Animation)
    private animation: Animation = null; // 动画组件
    private animationClips: Map<string, AnimationClip> = new Map(); // 缓存 AnimationClip

    private currentAction:ActionType = ActionType.IDLE; // 当前动作
    private currentDirection:ActionDirection = ActionDirection.RIGHT; // 当前方向
    private frameRate: number = 10; // 帧率


    onLoad() {
        // 确保 animation 组件正确获取
        this.animation = this.node.getComponent(Animation);
        if (!this.animation) {
            console.error("Animation component not found on the node!");
            return;
        }
    }

    public start() {
        this.animation = this.node.getComponent(Animation);
        // 初始化播放站立动画
        this.playAnimation(this.currentAction, this.currentDirection);
    }

    /**
     * 播放指定动作和方向的动画
     * @param action 动作名称
     * @param direction 方向名称
     */
    playAnimation(action: ActionType, direction: ActionDirection) {
        // if (this.currentAction === action && this.currentDirection === direction) {
        //     return; // 如果当前已经在播放该动画，则直接返回
        // }

        this.currentAction = action;
        this.currentDirection = direction;

        // 动态加载图集
        this.loadAtlas(action, direction);
    }

    /**
     * 动态加载图集
     * @param action 动作名称
     * @param direction 方向名称
     */
    private loadAtlas(action: ActionType, direction: ActionDirection) {
        const clipName = `${action}_${direction}`;

        // 如果已经缓存，则直接播放
        if (this.animationClips.has(clipName)) {
            const clip = this.animationClips.get(clipName);
            this.animation.play();
            return;
        }

        const atlasPath = `role/man/blade/attack`; // 图集路径
        const atlas = ResourceManager.getSpriteAtlas(atlasPath);
        // 获取图集中的 SpriteFrame
        const spriteFrames = atlas.getSpriteFrames();

        // 创建动画剪辑
        const animationClip = this.createAnimationClip(spriteFrames);
        this.animationClips.set(clipName, animationClip);

        // 添加动画剪辑到动画组件
        this.animation.defaultClip = animationClip;
        this.animation.clips = [animationClip];

        // 播放动画
        this.animation.play();
    }

    /**
     * 创建动画剪辑
     * @param spriteFrames 帧动画的 SpriteFrame 数组
     * @returns 动画剪辑
     */
    private createAnimationClip(spriteFrames: SpriteFrame[]): AnimationClip {
        const test = spriteFrames.splice(0, 6);
        // 使用 createWithSpriteFrames 创建帧动画
        const animationClip = AnimationClip.createWithSpriteFrames(test, 6);
        animationClip.name = `${this.currentAction}_${this.currentDirection}`;
        animationClip.wrapMode = AnimationClip.WrapMode.Loop; // 设置循环模式
        animationClip.sample = this.frameRate; // 设置帧率

        return animationClip;
    }

    /**
     * 更新位置
     * @param center 世界坐标
     */
    updatePosition(center: Vec2): void {
        const worldPosition = new Vec3(center.x, center.y, 0);
        this.node.worldPosition = worldPosition;
    }

    /**
     * 
     * @returns 中心点坐标
     */
    getCenter(): Vec2 {
        return new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);
    }
}