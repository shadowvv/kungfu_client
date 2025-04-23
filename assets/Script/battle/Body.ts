import { _decorator, Component, Vec2, Vec3, Animation, AnimationClip, SpriteAtlas, SpriteFrame, EventMouse, Input, input, Tween, tween } from 'cc';
import { ResourceManager } from '../main/ResourceManager';
import { ActionDirection, ActionType, WeaponEnum } from '../main/GameEnumAndConstants';
import { WeaponConfig, WeaponData } from '../JsonObject/WeaponConfig';
import { GameManager } from '../main/GameManager';
const { ccclass,property } = _decorator;

/**
 * 身体绘制组件
 */
@ccclass('Body')
export class Body extends Component {

    // 定义角度范围与方向的映射关系
    private readonly angleToDirectionMap: [number, ActionDirection][] = [
        [22.5-22.5, ActionDirection.RIGHT],
        [67.5-22.5, ActionDirection.RIGHT_UP],
        [112.5-22.5, ActionDirection.UP],
        [157.5-22.5, ActionDirection.LEFT_UP],
        [202.5-22.5, ActionDirection.LEFT],
        [247.5-22.5, ActionDirection.LEFT_DOWN],
        [292.5-22.5, ActionDirection.DOWN],
        [337.5-22.5, ActionDirection.RIGHT_DOWN],
        [360-22.5, ActionDirection.RIGHT], // 包含 360 度的情况
    ];

    @property(Animation)
    private animation: Animation = null; // 动画组件
    private frameRate: number = 10; // 帧率

    private currentAction: ActionType = ActionType.STAND; // 当前动作
    private currentDirection: ActionDirection = ActionDirection.RIGHT; // 当前方向

    onLoad() {
        this.animation = this.node.getComponent(Animation);
        if (!this.animation) {
            GameManager.errorLog("Animation component not found on the node!");
            return;
        }
    }

    /**
     * @description 初始化角色
     * @param weaponType 武器类型
     */
    initBody(weaponType: WeaponEnum, faceAngle: number) {
        GameManager.infoLog(`Initializing body with weapon type: ${weaponType}`);

        const data: WeaponData = WeaponConfig.getInstance().getWeaponById(weaponType);
        if (!data) {
            GameManager.errorLog("Weapon data not found!");
            return;
        }

        const directionValues = Object.values(ActionDirection).filter(value => typeof value === 'number');

        // 提取公共逻辑到 createAnimationClips 方法
        this.createAnimationClips(data.attackResource, data.clipStartIndex, data.clipCount, [ActionType.ATTACK, ActionType.ASSISTANCE, ActionType.SPECIAL_ATTACK], directionValues);
        this.createAnimationClips(data.stateResource, data.clipStartIndex, data.clipCount, [ActionType.HELLO, ActionType.REGRET, ActionType.STAND, ActionType.VICTORY], directionValues);
        this.createAnimationClips(data.actionResource, data.clipStartIndex, data.clipCount, [ActionType.BEHIT, ActionType.BLOCK, ActionType.DEAD, ActionType.MOVE], directionValues);

        this.animation = this.node.getComponent(Animation);
        // 初始化播放站立动画
        this.playAnimation(ActionType.STAND, this.getDirection(faceAngle));
    }

    /**
     * @description 创建动画剪辑并添加到动画组件
     * @param resourcePath 资源路径
     * @param clipStartIndex 帧起始索引
     * @param clipCount 帧数量
     * @param actionTypes 动作类型数组
     * @param directionValues 方向值数组
     */
    private createAnimationClips(resourcePath: string, clipStartIndex:number[], clipCount:number[], actionTypes: ActionType[], directionValues: number[]) {
        const atlas = ResourceManager.getSpriteAtlas(resourcePath);
        for (const action of actionTypes) {
            for (const direction of directionValues) {
                let startIndex = clipStartIndex[action] + clipCount[action] * direction;
                const clipName = `${action}_${direction}`;
                const spriteFrames = atlas.getSpriteFrames();
                const animationClip = this.createAnimationClip(clipName, spriteFrames, startIndex, clipCount[action], AnimationClip.WrapMode.Loop);
                this.animation.addClip(animationClip, clipName);
            }
        }
    }

    /**
     * @description 创建动画剪辑
     * @param spriteFrames 帧动画的 SpriteFrame 数组
     * @returns 动画剪辑
     */
    private createAnimationClip(clipName: string, spriteFrames: SpriteFrame[], startIndex: number, frameCount: number,wropMode:AnimationClip.WrapMode): AnimationClip {
        const test = spriteFrames.slice(startIndex, startIndex+frameCount);
        const animationClip = AnimationClip.createWithSpriteFrames(test, this.frameRate);
        animationClip.name = clipName;
        animationClip.wrapMode = wropMode;
        return animationClip;
    }

    /**
     * @description 播放指定动作和方向的动画
     * @param action 动作名称
     * @param direction 方向名称
     */
    playAnimation(action: ActionType, direction: ActionDirection) {
        const clipName = `${action}_${direction}`;
    
        // 先判断是否当前已在播放此动画
        const currentClip = this.animation.defaultClip;
        if (this.animation.getState(clipName)?.isPlaying) {
            this.animation.stop(); // 先停，再播
        }
    
        this.currentAction = action;
        this.currentDirection = direction;
    
        GameManager.infoLog(`Playing animation: ${clipName}`);
        this.animation.play(clipName);
    }

    /**
     * @description 移动到指定位置并播放移动动画
     * @param x 目标点的 x 坐标
     * @param y 目标点的 y 坐标
     */
    moveTo(x: number, y: number) {
        const targetPosition = new Vec2(x, y);
        const currentPosition = this.getCenter();

        // 计算目标点与当前位置的夹角
        const angle = this.calculateAngle(currentPosition, targetPosition);
        const direction = this.getDirection(angle);

        // 播放移动动画
        this.playAnimation(ActionType.MOVE, direction);
    }

    /**
     * @description 攻击并播放攻击动画
     * @param faceAngle 攻击方向的角度
     */
    attack(faceAngle: number) {
        const direction = this.getDirection(faceAngle);

        // 播放攻击动画
        this.playAnimation(ActionType.ATTACK, direction);

        const clipName = `${ActionType.ATTACK}_${direction}`;

        // 监听动画完成事件
        this.animation.on(Animation.EventType.FINISHED, (event) => {
            if (event.state.name === clipName) {
                this.idle(faceAngle); // 攻击结束后切换到站立动画
            }
        }, this);
    }

    /**
     * @description 切换到站立动画
     * @param faceAngle 站立方向的角度
     */
    idle(faceAngle: number) {
        const direction = this.getDirection(faceAngle);

        // 播放站立动画
        this.playAnimation(ActionType.STAND, direction);
    }

    /**
     * @description 计算两个点之间的夹角
     * @param start 起始点
     * @param end 终点
     * @returns 夹角（角度制）
     */
    private calculateAngle(start: Vec2, end: Vec2): number {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const radian = Math.atan2(dy, dx);
        return (radian * 180 / Math.PI + 360) % 360; // 转换为角度制并标准化到 [0, 360)
    }

    /**
     * @description 更新位置
     * @param center 世界坐标
     */
    updatePosition(center: Vec2): void {
        const worldPosition = new Vec3(center.x, center.y, 0);
        this.node.worldPosition = worldPosition;
    }

    rotate(lastAngle: number) {
        const direction = this.getDirection(lastAngle);
        this.playAnimation(this.currentAction, direction);
    }
    getDirection(lastAngle: number): ActionDirection {
        // 将角度标准化到 [0, 360) 范围内
        const normalizedAngle = (lastAngle + 360) % 360;
    
        // 查找匹配的角度范围
        for (const [angle, direction] of this.angleToDirectionMap) {
            if (normalizedAngle < angle) {
                return direction;
            }
        }
    
        // 默认返回右方向（理论上不会到达这里）
        return ActionDirection.RIGHT;
    }

    /**
     * 
     * @returns 中心点坐标
     */
    getCenter(): Vec2 {
        return new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);
    }
}