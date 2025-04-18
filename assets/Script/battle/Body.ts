import { _decorator, Component, Vec2, Vec3, Animation, AnimationClip, SpriteAtlas, SpriteFrame, EventMouse, Input, input } from 'cc';
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

    private currentAction: ActionType = ActionType.STAND; // 当前动作
    private currentDirection: ActionDirection = ActionDirection.RIGHT; // 当前方向
    private frameRate: number = 10; // 帧率

    onLoad() {
        this.animation = this.node.getComponent(Animation);
        if (!this.animation) {
            GameManager.errorLog("Animation component not found on the node!");
            return;
        }

        // 注册鼠标点击事件
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    public start() {

    }

    /**
     * @description 初始化角色
     * @param weaponType 武器类型
     */
    initBody(weaponType: WeaponEnum) {
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
        this.playAnimation(ActionType.ATTACK, ActionDirection.RIGHT);
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
                GameManager.infoLog(`clipName: ${clipName}, startIndex: ${startIndex}, clipCount: ${clipCount[action]}, action: ${action}, direction: ${direction}`);
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
     * @description 更新位置
     * @param center 世界坐标
     */
    updatePosition(center: Vec2): void {
        const worldPosition = new Vec3(center.x, center.y, 0);
        this.node.worldPosition = worldPosition;
    }

    rotate(lastAngle: number) {
        // const direction = this.getDirection(lastAngle);
        // this.playAnimation(this.currentAction, direction);
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
     * @description 处理鼠标点击事件
     * @param event 鼠标事件
     */
    private onMouseDown(event: EventMouse) {
        if (this.currentDirection == ActionDirection.RIGHT_UP) {
            this.currentDirection = ActionDirection.RIGHT;
            if (this.currentAction == ActionType.MOVE) {
                this.currentAction = ActionType.ATTACK;
            } else {
                this.currentAction++;
            }
        } else {
            this.currentDirection++;
        }
    
        // 获取 ActionType 和 ActionDirection 的最大值
        const actionValues = Object.values(ActionType) as number[];
        const directionValues = Object.values(ActionDirection) as number[];
    
        const maxAction = Math.max(...actionValues);
        const maxDirection = Math.max(...directionValues);
    
        // 重置 currentAction 和 currentDirection 到初始值
        if (this.currentAction > maxAction) {
            this.currentAction = ActionType.STAND; // 重置为初始动作
        }
    
        if (this.currentDirection > maxDirection) {
            this.currentDirection = ActionDirection.RIGHT; // 重置为初始方向
        }
    
        this.playAnimation(this.currentAction, this.currentDirection);
    }

    /**
     * 
     * @returns 中心点坐标
     */
    getCenter(): Vec2 {
        return new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);
    }
}