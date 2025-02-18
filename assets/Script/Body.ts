import { _decorator, Component, Vec2, Graphics } from 'cc';
import { BASE_NUMBER } from './RoleFactory';
const { ccclass } = _decorator;

/**
 * 身体绘制组件
 */
@ccclass('Body')
export class Body extends Component {
    /**
     * 边框颜色（黑色）
     */
    private static readonly STROKE_COLOR: string = '#000000';

    /**
     * 填充颜色（半透明绿色）
     */
    private static readonly FILL_COLOR: string = '#00FF0088';

    /**
     * 边框宽度
     */
    private static readonly LINE_WIDTH: number = 5;

    /**
     * 绘制图形
     * @param center 矩形中心点坐标
     */
    draw(center?: Vec2) {
        const g = this.getComponent(Graphics);
        if (!g) {
            console.error("Graphics component not found!");
            return;
        }

        // 清除画布
        g.clear();

        // 设置样式
        g.lineWidth = Body.LINE_WIDTH;
        g.fillColor.fromHEX(Body.FILL_COLOR);
        g.strokeColor.fromHEX(Body.STROKE_COLOR);

        // 绘制矩形
        this.drawRect(g, center);
    }

    /**
     * 绘制矩形
     * @param g Graphics 组件
     * @param center 矩形中心点坐标
     */
    private drawRect(g: Graphics, center?: Vec2) {
        if (!center) {
            center = new Vec2(0, 0);
        }
        g.rect(center.x - BASE_NUMBER / 2, center.y - BASE_NUMBER, BASE_NUMBER, BASE_NUMBER * 2);
        g.stroke();
        g.fill();
    }

    /**
     * 更新位置
     * @param center 世界坐标
     */
    updatePosition(center: Vec2) {
        this.node.worldPosition = center.toVec3();
    }

}