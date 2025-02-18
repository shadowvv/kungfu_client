import { _decorator, Component, Graphics, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 移动范围绘制组件
 */
@ccclass('MoveCircle')
export class MoveCircle extends Component {
    /**
     * 边框颜色（黑色）
     */
    private static readonly STROKE_COLOR: string = '#000000';

    /**
     * 填充颜色（半透明蓝色）
     */
    private static readonly FILL_COLOR: string = '#00009988';

    /**
     * 边框宽度
     */
    private static readonly LINE_WIDTH: number = 5;

    /**
     * 绘制移动范围
     * @param center 圆心坐标
     * @param moveRange 移动半径
     */
    draw(moveRange: number) {
        const g = this.getComponent(Graphics);
        if (!g) {
            console.error("Graphics component not found!");
            return;
        }

        // 清除画布
        g.clear();

        // 设置样式
        g.lineWidth = MoveCircle.LINE_WIDTH;
        g.fillColor.fromHEX(MoveCircle.FILL_COLOR);
        g.strokeColor.fromHEX(MoveCircle.STROKE_COLOR);

        // 绘制圆形
        this.drawCircle(g, moveRange);
    }

    /**
     * 绘制圆形
     * @param g Graphics 组件
     * @param center 圆心坐标
     * @param radius 半径
     */
    private drawCircle(g: Graphics, radius: number) {
        g.circle(0, 0, radius);
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