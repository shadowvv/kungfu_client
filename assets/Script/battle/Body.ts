import { _decorator, Component, Vec2, Vec3, Animation, AnimationClip, resources, SpriteAtlas, SpriteFrame } from 'cc';
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

    @property(Animation)
    private animation: Animation = null; // 动画组件
    private actionAtlas: SpriteAtlas = null;
    private stateAtlas: SpriteAtlas = null;
    private attackAtlas: SpriteAtlas = null;

    private currentAction:ActionType = ActionType.MOVE; // 当前动作
    private currentDirection:ActionDirection = ActionDirection.RIGHT; // 当前方向
    private frameRate: number = 10; // 帧率

    onLoad() {
        this.animation = this.node.getComponent(Animation);
        if (!this.animation) {
            console.error("Animation component not found on the node!");
            return;
        }
    }

    public start() {
    }

    /**
     * @description 初始化角色
     * @param weaponType 武器类型
     */
    initBody(weaponType: WeaponEnum) {
        const data:WeaponData = WeaponConfig.getInstance().getWeaponById(WeaponEnum.knife);
        if (!data) {
            console.error("Weapon data not found!");
            return;
        }

        let index = 0;
        this.attackAtlas = ResourceManager.getSpriteAtlas(data.attackResource);
        const attackArray = [ActionType.ATTACK, ActionType.ASSISTANCE,ActionType.SPECIAL_ATTACK];
        for (const action of attackArray) {
            let directionIndex = 0;
            for (const direction of Object.values(ActionDirection)) {
                let startIndex = data.clipStartIndex[index]+data.clipCount[index]*directionIndex;
                const clipName = `${action}_${direction}`;
                const spriteFrames = this.attackAtlas.getSpriteFrames();
                const animationClip = this.createAnimationClip(clipName,spriteFrames,startIndex,data.clipCount[index],AnimationClip.WrapMode.Loop);
                this.animation.addClip(animationClip,clipName);
                console.log(`clipName: ${clipName}, startIndex: ${startIndex}, clipCount: ${data.clipCount[index]}`);
                directionIndex++;
            }
            index++;
        }

        this.actionAtlas = ResourceManager.getSpriteAtlas(data.actionResource);
        const actionArray = [ActionType.HELLO, ActionType.REGRET,ActionType.STAND,ActionType.VICTORY];
        for (const action of actionArray) {
            let directionIndex = 0;
            for (const direction of Object.values(ActionDirection)) {
                let startIndex = data.clipStartIndex[index]+data.clipCount[index]*directionIndex;
                const clipName = `${action}_${direction}`;
                const spriteFrames = this.actionAtlas.getSpriteFrames();
                const animationClip = this.createAnimationClip(clipName,spriteFrames,startIndex,data.clipCount[index],AnimationClip.WrapMode.Loop);
                this.animation.addClip(animationClip,clipName);
                console.log(`clipName: ${clipName}, startIndex: ${startIndex}, clipCount: ${data.clipCount[index]}`);
                directionIndex++;
            }
            index++;
        }

        this.stateAtlas = ResourceManager.getSpriteAtlas(data.stateResource);
        const stateArray = [ActionType.BEHIT, ActionType.BLOCK,ActionType.DEAD,ActionType.MOVE];
        for (const action of stateArray) {
            let directionIndex = 0;
            for (const direction of Object.values(ActionDirection)) {
                let startIndex = data.clipStartIndex[index]+data.clipCount[index]*directionIndex;
                const clipName = `${action}_${direction}`;
                const spriteFrames = this.stateAtlas.getSpriteFrames();
                const animationClip = this.createAnimationClip(clipName,spriteFrames,startIndex,data.clipCount[index],AnimationClip.WrapMode.Loop);
                this.animation.addClip(animationClip,clipName);
                console.log(`clipName: ${clipName}, startIndex: ${startIndex}, clipCount: ${data.clipCount[index]}`);
                directionIndex++;
            }
            index++;
        }

        this.animation = this.node.getComponent(Animation);
        // 初始化播放站立动画
        this.playAnimation(ActionType.MOVE, ActionDirection.RIGHT);
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
        if (this.currentAction === action && this.currentDirection === direction) {
            return; // 如果当前已经在播放该动画，则直接返回
        }
        this.currentAction = action;
        this.currentDirection = direction;

        const clipName = `${this.currentAction}_${this.currentDirection}`;
        const state = this.animation.getState(clipName);
        if (state) {
            state.play(); // 播放动画
        }
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
        if ((lastAngle >= 337.5 && lastAngle < 360) || (lastAngle >= 0 && lastAngle < 22.5)) {
            return ActionDirection.RIGHT;
        } else if (lastAngle >= 22.5 && lastAngle < 67.5) {
            return ActionDirection.RIGHT_UP;
        } else if (lastAngle >= 67.5 && lastAngle < 112.5) {
            return ActionDirection.UP;
        } else if (lastAngle >= 112.5 && lastAngle < 157.5) {
            return ActionDirection.LEFT_UP;
        } else if (lastAngle >= 157.5 && lastAngle < 202.5) {
            return ActionDirection.LEFT;
        } else if (lastAngle >= 202.5 && lastAngle < 247.5) {
            return ActionDirection.LEFT_DOWN;
        } else if (lastAngle >= 247.5 && lastAngle < 292.5) {
            return ActionDirection.DOWN;
        } else {
            return ActionDirection.RIGHT_DOWN;
        }
    }

    /**
     * 
     * @returns 中心点坐标
     */
    getCenter(): Vec2 {
        return new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);
    }
}