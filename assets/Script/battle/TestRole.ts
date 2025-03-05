import { _decorator, Animation, AnimationClip, Component, Node, resources, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestRole')
export class TestRole extends Component {

    @property(Animation)
    private animation: Animation = null; // 动画组件
    private animationClips: Map<string, AnimationClip> = new Map(); // 缓存 AnimationClip

    private currentAction: string = ""; // 当前动作
    private currentDirection: string = ""; // 当前方向
    private frameRate: number = 10; // 帧率


    public start() {
        this.animation = this.node.getComponent(Animation);
        // 初始化播放站立动画
        this.playAnimation("idle", "north");
    }

    onLoad() {
        // 确保 animation 组件正确获取
        this.animation = this.node.getComponent(Animation);
        if (!this.animation) {
            console.error("Animation component not found on the node!");
            return;
        }
    }

    /**
     * 播放指定动作和方向的动画
     * @param action 动作名称（如 "idle", "attack", "move"）
     * @param direction 方向名称（如 "north", "south", "east", "west" 等）
     */
    playAnimation(action: string, direction: string) {
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
    private loadAtlas(action: string, direction: string) {
        const clipName = `${action}_${direction}`;

        // 如果已经缓存，则直接播放
        if (this.animationClips.has(clipName)) {
            const clip = this.animationClips.get(clipName);
            this.animation.play();
            return;
        }

        const atlasPath = `role/blade/attack`; // 图集路径
        resources.load(atlasPath, SpriteAtlas, (err, atlas) => {
            if (err) {
                console.error(`Failed to load atlas: ${atlasPath}`, err);
                return;
            }

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
        });
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

    update(deltaTime: number) {

    }
}


