import { _decorator, Component, Vec2, Graphics, Vec3 } from 'cc';
import { getBaseNumber } from './GameEnumAndConstants';
import { ViewConfig } from './JsonObject/ViewConfig';
const { ccclass } = _decorator;

/**
 * 身体绘制组件
 */
@ccclass('Body')
export class Body extends Component {

    /**
     * 绘制图形
     * @param center 矩形中心点坐标
     */
    draw(center?: Vec2): void {

        const g = this.getComponent(Graphics);
        if (!g) {
            console.error("Graphics component not found!");
            return;
        }

        // 清除画布
        g.clear();

        // 设置样式
        g.lineWidth = ViewConfig.getInstance().getBodyLineWidth();
        g.fillColor.fromHEX(ViewConfig.getInstance().getBodyFillColor());
        g.strokeColor.fromHEX(ViewConfig.getInstance().getBodyStrockColor());

        // 绘制矩形
        this.drawRect(g, center);
    }

    /**
     * 绘制矩形
     * @param g Graphics 组件
     * @param center 矩形中心点坐标
     */
    private drawRect(g: Graphics, center?: Vec2): void {
        if (!center) {
            center = new Vec2(0, 0);
        }
        const baseNumber = getBaseNumber();
        g.rect(center.x - baseNumber / 2, center.y - baseNumber, baseNumber, baseNumber * 2);
        g.stroke();
        g.fill();
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