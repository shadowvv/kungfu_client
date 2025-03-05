import { _decorator, Component, Graphics, Vec2, View, view } from 'cc';
import { ViewConfig } from '../JsonObject/ViewConfig';
const { ccclass, property } = _decorator;

/**
 * 移动范围绘制组件
 */
@ccclass('MoveCircle')
export class MoveCircle extends Component {

    /**
     * 绘制移动范围
     * @param center 圆心坐标
     * @param moveRange 移动半径
     */
    draw(moveRange: number): void {
        const g = this.getComponent(Graphics);
        if (!g) {
            console.error("Graphics component not found!");
            return;
        }

        // 清除画布
        g.clear();

        // 设置样式
        g.lineWidth = ViewConfig.getInstance().getMoveLineWidth();
        g.fillColor.fromHEX(ViewConfig.getInstance().getMoveFillColor());
        g.strokeColor.fromHEX(ViewConfig.getInstance().getMoveStrockColor());

        // 绘制圆形
        this.drawCircle(g, moveRange);
    }

    /**
     * 绘制圆形
     * @param g Graphics 组件
     * @param center 圆心坐标
     * @param radius 半径
     */
    private drawCircle(g: Graphics, radius: number): void {
        g.circle(0, 0, radius);
        g.stroke();
        g.fill();
    }

    /**
     * 更新位置
     * @param center 世界坐标
     */
    updatePosition(center: Vec2): void {
        this.node.worldPosition = center.toVec3();
    }
}