import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NetController')
export class NetController extends Component {
    start() {
        let ws = new WebSocket("ws://127.0.0.1:8080/ws");

        ws.onopen = function () {
            console.log("WebSocket connection opened.");
            ws.send("Hello, WebSocket!");
        };
        
        ws.onmessage = function (event) {
            console.log("Received message: " + event.data);
        };
        
        ws.onerror = function (event) {
            console.error("WebSocket encountered an error:", event);
        };
        
        ws.onclose = function (event) {
            console.log("WebSocket connection closed. Code: " + event.code + ", Reason: " + event.reason);
        };
        
    }

    update(deltaTime: number) {
        
    }
}


