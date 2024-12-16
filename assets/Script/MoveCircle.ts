import { _decorator, Component, Graphics, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoveCircle')
export class MoveCircle extends Component {

    /**
     * 绘制移动范围
     * @param center 圆形 
     * @param moveRange 移动半径
     */
    draw(center: Vec2, moveRange: number) {
        const g = this.getComponent(Graphics);
        if (g) {
            g.clear();

            g.lineWidth = 1;
            g.fillColor.fromHEX('#00009988');
            g.strokeColor.fromHEX('#000000');

            g.circle(center.x, center.y, moveRange);
            g.stroke();
            g.fill();
        } else {
            console.log("Graphics component not found!");
        }
    }

}
