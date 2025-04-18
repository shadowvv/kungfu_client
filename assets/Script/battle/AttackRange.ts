import { _decorator, Component, Graphics, Vec2 } from 'cc';
import { ViewConfig } from '../JsonObject/ViewConfig';
import { GameManager } from '../main/GameManager';
const { ccclass } = _decorator;

/**
 * 攻击范围绘制组件
 */
@ccclass('AttackRange')
export class AttackRange extends Component {

    /**
     * 绘制扇形区域
     * @param center 中心点坐标
     * @param outerRadius 外半径
     * @param innerRadius 内半径
     * @param startAngle 起始角度（度）
     * @param endAngle 结束角度（度）
     * @param offsetAngle 偏移角度（度）
     */
    draw(outerRadius: number, innerRadius: number, startAngle: number, endAngle: number, offsetAngle: number, center?: Vec2): void {
        const graphics = this.getComponent(Graphics);
        if (!graphics) {
            GameManager.errorLog("Graphics component not found!");
            return;
        }

        // 清除画布
        graphics.clear();

        // 设置样式 
        graphics.lineWidth = ViewConfig.getInstance().getAttackLineWidth();
        graphics.fillColor.fromHEX(ViewConfig.getInstance().getAttackFillColor());
        graphics.strokeColor.fromHEX(ViewConfig.getInstance().getAttackStrockColor());

        // 绘制扇形区域
        this.drawSector(graphics, outerRadius, innerRadius, startAngle, endAngle, offsetAngle, center);
    }

    /**
     * 绘制扇形区域
     * @param graphics Graphics 组件
     * @param center 中心点坐标
     * @param outerRadius 外半径
     * @param innerRadius 内半径
     * @param startAngle 起始角度（度）
     * @param endAngle 结束角度（度）
     * @param offsetAngle 偏移角度（度）
     */
    private drawSector(graphics: Graphics, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number, offsetAngle: number, center?: Vec2): void {
        if (!center) {
            center = new Vec2(0, 0);
        }
        // 将角度转换为弧度
        const startRad = this.degreesToRadians(startAngle - offsetAngle);
        const endRad = this.degreesToRadians(endAngle - offsetAngle);

        // 计算外圆起点坐标
        const outerStartX = center.x + outerRadius * Math.cos(startRad);
        const outerStartY = center.y + outerRadius * Math.sin(startRad);

        // 计算内圆终点坐标
        const innerEndX = center.x + innerRadius * Math.cos(endRad);
        const innerEndY = center.y + innerRadius * Math.sin(endRad);

        // 绘制扇形区域
        graphics.moveTo(outerStartX, outerStartY);
        graphics.arc(center.x, center.y, outerRadius, startRad, endRad, true);
        graphics.lineTo(innerEndX, innerEndY);
        graphics.arc(center.x, center.y, innerRadius, endRad, startRad, false);
        graphics.lineTo(outerStartX, outerStartY);

        // 填充和描边
        graphics.stroke();
        graphics.fill();
    }

    /**
     * 将角度转换为弧度
     * @param degrees 角度
     * @returns 弧度
     */
    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * 更新位置
     * @param center 世界坐标
     */
    updatePosition(center: Vec2): void {
        this.node.worldPosition = center.toVec3();
    }

    /**
     * z轴旋转
     * @param currentAngle 上一个角度
     */
    rotate(currentAngle: number): void {
        this.node.setRotationFromEuler(0, 0, currentAngle);
    }
}