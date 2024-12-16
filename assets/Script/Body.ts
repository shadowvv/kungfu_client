import { _decorator, Component, Vec2, Graphics } from 'cc';
import { BASENUMBER } from './RoleFactory';
const { ccclass, property } = _decorator;

@ccclass('Body')
export class Body extends Component {

    /**
     * 绘制图形
     * @param center 
     */
    draw(center: Vec2) {
        const g = this.getComponent(Graphics);
        if (g) {
            g.clear();

            g.lineWidth = 1;
            g.fillColor.fromHEX('#00FF0088');
            g.strokeColor.fromHEX('#000000');

            g.rect(center.x - BASENUMBER / 2, center.y - BASENUMBER, BASENUMBER, BASENUMBER * 2);
            g.stroke();
            g.fill();
        } else {
            console.log("Graphics component not found!");
        }
    }

}


