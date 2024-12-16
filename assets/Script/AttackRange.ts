import { _decorator, Component, Graphics, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AttackRange')
export class AttackRange extends Component {

    /**
     * 绘制图形
     * @param center 
     * @param outerRadius 
     * @param innerRadius 
     * @param startAngle 
     * @param endAngle 
     * @param lastAngle 
     */
    draw(center: Vec2, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number, lastAngle: number) {
        const graphics = this.getComponent(Graphics);

        if (graphics) {
            graphics.clear();

            graphics.lineWidth = 1;
            graphics.fillColor.fromHEX('#ff000088');
            graphics.strokeColor.fromHEX('#ff0000');

            const startRad = (startAngle - lastAngle) * (Math.PI / 180);
            const endRad = (endAngle - lastAngle) * (Math.PI / 180);

            const outerStartX = center.x + outerRadius * Math.cos(startRad);
            const outerStartY = center.y + outerRadius * Math.sin(startRad);

            const innerEndX = center.x + innerRadius * Math.cos(endRad);
            const innerEndY = center.y + innerRadius * Math.sin(endRad);

            graphics.moveTo(outerStartX, outerStartY);
            graphics.arc(center.x, center.y, outerRadius, startRad, endRad, true);
            graphics.lineTo(innerEndX, innerEndY);
            graphics.arc(center.x, center.y, innerRadius, endRad, startRad, false);
            graphics.lineTo(outerStartX, outerStartY);

            graphics.stroke();
            graphics.fill();
        }
    }
}


