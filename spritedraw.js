function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Queue {
    constructor(size) {
        this.data = [];
        this.data.length = size;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val) {
        if (this.length == this.data.length) {
            const newData = [];
            newData.length = this.data.length * 2;
            for (let i = 0; i < this.data.length; i++) {
                newData[i] = this.data[(i + this.start) % this.data.length];
            }
            this.start = 0;
            this.end = this.data.length;
            this.data = newData;
            this.data[this.end++] = val;
            this.length++;
        }
        else {
            this.data[this.end++] = val;
            this.end %= this.data.length;
            this.length++;
        }
    }
    pop() {
        if (this.length) {
            const val = this.data[this.start];
            this.start++;
            this.start %= this.data.length;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index) {
        if (index < this.length) {
            return this.data[(index + this.start) % this.data.length];
        }
        throw new Error(`Could not get value at index ${index}`);
    }
    set(index, obj) {
        if (index < this.length) {
            this.data[(index + this.start) % this.data.length] = obj;
        }
        throw new Error(`Could not set value at index ${index}`);
    }
}
;
class RGB {
    constructor(r, g, b) {
        this.red = r;
        this.green = g;
        this.blue = b;
    }
    toInt() {
        return 255 << 24 | this.red << 16 | this.green << 8 | this.blue;
    }
    loadString(color) {
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        if (!isNaN(r) && r <= 255 && r >= 0) {
            this.red = r;
        }
        if (!isNaN(g) && g <= 255 && g >= 0) {
            this.green = g;
        }
        if (!isNaN(b) && b <= 255 && b >= 0) {
            this.blue = b;
        }
    }
    htmlRBG() {
        const red = this.red < 16 ? `0${this.red.toString(16)}` : this.red.toString(16);
        const green = this.green < 16 ? `0${this.green.toString(16)}` : this.green.toString(16);
        const blue = this.blue < 16 ? `0${this.blue.toString(16)}` : this.blue.toString(16);
        return `#${red}${green}${blue}`;
    }
}
;
class Pair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
}
;
class DrawingScreen {
    constructor(canvas, offset, dimensions, bounds = [canvas.width - offset[0], canvas.height - offset[1]]) {
        this.canvas = canvas;
        this.offset = new Pair(offset[0], offset[1]);
        this.bounds = new Pair(bounds[0], bounds[1]);
        this.dimensions = new Pair(dimensions[0], dimensions[1]);
        this.screenBuffer = new Array();
        this.color = new RGB(150, 34, 160);
        //this.screenBuffer.length = dimensions[0] * dimensions[1];
        for (let i = 0; i < dimensions[0] * dimensions[1]; i++) {
            this.screenBuffer.push(new RGB(0, 0, 0));
        }
        this.listeners = new SingleTouchListener(canvas, true, true);
        this.listeners.registerCallBack("touchend", e => true, e => this.handleTap(e));
        this.listeners.registerCallBack("touchmove", e => true, e => this.handleDraw(e));
    }
    handleTap(event) {
        const gx = Math.floor((event.touchPos[0] - this.offset.first) / this.bounds.first * this.dimensions.first);
        const gy = Math.floor((event.touchPos[1] - this.offset.second) / this.bounds.second * this.dimensions.second);
        if (event.timeDelayFromStartToEnd < 300) {
            this.fillArea(new Pair(gx, gy));
        }
        else if (gx < this.dimensions.first && gy < this.dimensions.second) {
            this.screenBuffer[gx + gy * this.dimensions.first] = new RGB(this.color.red, this.color.green, this.color.blue);
        }
    }
    hashP(x, y) {
        return x + y * this.dimensions.first;
    }
    compColor(c1, c2) {
        return c1.red === c2.red && c1.green === c2.green && c1.blue === c2.blue;
    }
    fillArea(startCoordinate) {
        const queue = new Queue(1024);
        let checkedMap = {};
        checkedMap = {};
        const startIndex = startCoordinate.first + startCoordinate.second * this.dimensions.first;
        const startPixel = this.screenBuffer[startIndex];
        const spc = new RGB(startPixel.red, startPixel.green, startPixel.blue);
        queue.push(startIndex);
        while (queue.length > 0) {
            const cur = queue.pop();
            const pixelColor = this.screenBuffer[cur];
            if (cur >= 0 && cur < this.dimensions.first * this.dimensions.second &&
                (this.compColor(pixelColor, this.color) || this.compColor(pixelColor, spc))
                && !checkedMap[cur]) {
                checkedMap[cur] = true;
                pixelColor.red = this.color.red;
                pixelColor.green = this.color.green;
                pixelColor.blue = this.color.blue;
                //if(!checkedMap[cur+1])
                queue.push(cur + 1);
                //if(!checkedMap[cur-1])
                queue.push(cur - 1);
                //if(!checkedMap[cur + this.dimensions.first])
                queue.push(cur + this.dimensions.first);
                //if(!checkedMap[cur - this.dimensions.first])
                queue.push(cur - this.dimensions.first);
            }
        }
    }
    handleDraw(event) {
        //draw line from current touch pos to the touchpos minus the deltas
        //calc equation for line
        const x1 = event.touchPos[0] - event.deltaX;
        const y1 = event.touchPos[1] - event.deltaY;
        const m = event.deltaY / event.deltaX;
        const b = event.touchPos[1] - m * event.touchPos[0];
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            const min = Math.min(x1, event.touchPos[0]);
            const max = Math.max(x1, event.touchPos[0]);
            for (let x = min; x < max; x += 0.2) {
                const y = m * x + b;
                const gx = Math.floor((x - this.offset.first) / this.bounds.first * this.dimensions.first);
                const gy = Math.floor((y - this.offset.second) / this.bounds.second * this.dimensions.second);
                if (gx < this.dimensions.first && gy < this.dimensions.second) {
                    this.screenBuffer[gx + gy * this.dimensions.first] = new RGB(this.color.red, this.color.green, this.color.blue);
                }
            }
        }
        else {
            const min = Math.min(y1, event.touchPos[1]);
            const max = Math.max(y1, event.touchPos[1]);
            for (let y = min; y < max; y += 0.2) {
                const x = Math.abs(event.deltaX) > 0 ? (y - b) / m : event.touchPos[0];
                const gx = Math.floor((x - this.offset.first) / this.bounds.first * this.dimensions.first);
                const gy = Math.floor((y - this.offset.second) / this.bounds.second * this.dimensions.second);
                if (gx < this.dimensions.first && gy < this.dimensions.second) {
                    this.screenBuffer[gx + gy * this.dimensions.first] = new RGB(this.color.red, this.color.green, this.color.blue);
                }
            }
        }
    }
    setDim(newDim) {
        if (newDim.length === 2) {
            this.dimensions = new Pair(newDim[0], newDim[1]);
            if (this.screenBuffer.length < newDim[0] * newDim[1]) {
                for (let i = this.screenBuffer.length; i < newDim[0] * newDim[1]; i++)
                    this.screenBuffer.push(new RGB(0, 0, 0));
            }
        }
    }
    draw() {
        const ctx = this.canvas.getContext("2d");
        const image = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const imageData = image.data;
        for (let y = 0; y < this.dimensions.second; y++) {
            for (let x = 0; x < this.dimensions.first; x++) {
                const cellHeight = this.bounds.second / this.dimensions.second;
                const cellWidth = this.bounds.first / this.dimensions.first;
                const sy = this.offset.second + y * cellHeight;
                const sx = this.offset.first + x * cellWidth;
                ctx.fillStyle = this.screenBuffer[x + y * this.dimensions.first].htmlRBG();
                ctx.fillRect(sx, sy, cellWidth, cellHeight);
            }
        }
    }
}
;
class TouchHandler {
    constructor(pred, callBack) {
        this.pred = pred;
        this.callBack = callBack;
    }
}
;
class ListenerTypes {
    constructor() {
        this.touchstart = new Array();
        this.touchmove = new Array();
        this.touchend = new Array();
    }
}
class SingleTouchListener {
    constructor(component, preventDefault, mouseEmulation) {
        this.lastTouchTime = Date.now();
        this.offset = [];
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.registeredTouch = false;
        this.touchPos = [0, 0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.listenerTypeMap = {
            touchstart: [],
            touchmove: [],
            touchend: []
        };
        component.addEventListener('touchstart', event => { this.touchStartHandler(event); }, false);
        component.addEventListener('touchmove', event => this.touchMoveHandler(event), false);
        component.addEventListener('touchend', event => this.touchEndHandler(event), false);
        if (mouseEmulation) {
            component.addEventListener('mousedown', event => { event.changedTouches = {}; event.changedTouches.item = x => event; this.touchStartHandler(event); });
            component.addEventListener('mousemove', event => { event.changedTouches = {}; event.changedTouches.item = x => event; this.touchMoveHandler(event); });
            component.addEventListener('mouseup', event => { event.changedTouches = {}; event.changedTouches.item = x => event; this.touchEndHandler(event); });
        }
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        let found = false;
        handlers.forEach(handler => {
            if (!found && handler.pred(event)) {
                found = true;
                handler.callBack(event);
            }
        });
    }
    touchStartHandler(event) {
        this.registeredTouch = true;
        event.timeSinceLastTouch = Date.now() - (this.lastTouchTime ? this.lastTouchTime : 0);
        this.lastTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"], this.touchStart["offsetY"]];
        if (!this.touchPos[0]) {
            this.touchPos = [this.touchStart["clientX"], this.touchStart["clientY"]];
        }
        event.touchPos = this.touchPos;
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.callHandler("touchstart", event);
        if (this.preventDefault)
            event.preventDefault();
    }
    touchMoveHandler(event) {
        if (!this.registeredTouch)
            return false;
        let touchMove = event.changedTouches.item(0);
        for (let i = 0; i < event.changedTouches["length"]; i++) {
            if (event.changedTouches.item(i).identifier == this.touchStart.identifier) {
                touchMove = event.changedTouches.item(i);
            }
        }
        if (touchMove) {
            if (!touchMove["offsetY"]) {
                touchMove.offsetX = touchMove["clientX"];
                touchMove.offsetY = touchMove["clientY"];
            }
            const deltaY = touchMove["offsetY"] - this.touchPos[1];
            const deltaX = touchMove["offsetX"] - this.touchPos[0];
            this.touchPos[1] += deltaY;
            this.touchPos[0] += deltaX;
            const mag = this.mag([deltaX, deltaY]);
            this.touchMoveCount++;
            this.deltaTouchPos += Math.abs(mag);
            this.touchVelocity = 100 * this.deltaTouchPos / (Date.now() - this.lastTouchTime);
            const a = this.normalize([deltaX, deltaY]);
            const b = [1, 0];
            const dotProduct = this.dotProduct(a, b);
            const angle = Math.acos(dotProduct) * (180 / Math.PI) * (deltaY < 0 ? 1 : -1);
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.mag = mag;
            event.angle = angle;
            event.avgVelocity = this.touchVelocity;
            event.touchPos = this.touchPos;
            event.startTouchTime = this.lastTouchTime;
            event.eventTime = Date.now();
            this.callHandler("touchmove", event);
        }
        return true;
    }
    touchEndHandler(event) {
        if (this.registeredTouch) {
            let touchEnd = event.changedTouches.item(0);
            for (let i = 0; i < event.changedTouches["length"]; i++) {
                if (event.changedTouches.item(i).identifier == this.touchStart.identifier) {
                    touchEnd = event.changedTouches.item(i);
                }
            }
            if (touchEnd) {
                if (!touchEnd["offsetY"]) {
                    touchEnd.offsetX = touchEnd["clientX"];
                    touchEnd.offsetY = touchEnd["clientY"];
                }
                const deltaY = touchEnd["offsetY"] - this.touchStart["offsetY"];
                const deltaX = touchEnd["offsetX"] - this.touchStart["offsetX"];
                this.touchPos = [touchEnd["offsetX"], touchEnd["offsetY"]];
                const mag = this.mag([deltaX, deltaY]);
                const a = this.normalize([deltaX, deltaY]);
                const b = [1, 0];
                const dotProduct = this.dotProduct(a, b);
                const angle = Math.acos(dotProduct) * (180 / Math.PI) * (deltaY < 0 ? 1 : -1);
                const delay = Date.now() - this.lastTouchTime; // from start tap to finish
                this.touchVelocity = 100 * mag / (Date.now() - this.lastTouchTime);
                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos;
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.lastTouchTime;
                event.eventTime = Date.now();
                this.callHandler("touchend", event);
            }
            this.registeredTouch = false;
        }
    }
    mag(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    }
    normalize(a) {
        const magA = this.mag(a);
        a[0] /= magA;
        a[1] /= magA;
        return a;
    }
    dotProduct(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
}
;
class Pallette {
    constructor(canvas, textBoxColor, colorCount = 10, colors = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.highLightedCell = 0;
        this.shiftDown = false;
        this.textBoxColor = textBoxColor;
        this.listeners = new SingleTouchListener(canvas, true, true);
        this.colors = new Array();
        const width = canvas.width / colorCount;
        const height = canvas.height;
        for (let i = 0; i < colorCount; i++) {
            const left = i / colorCount;
            const right = (i + 1) / colorCount;
            const top = 0;
            const bottom = 1;
            const depth = 0;
            //pushRect(this.triangleBufferData, i / colorCount * canvas.width, 0, width, height);
        }
        if (colors !== null) {
            colors.forEach(el => {
                this.colors.push(new RGB(el.red, el.green, el.blue));
            });
        }
        else {
            let r = 25;
            let g = 50;
            let b = 30;
            const delta = 85;
            for (let i = 0; i < colorCount; i++) {
                r += ((i % 3 == 0) ? delta : 0);
                r += ((i % 5 == 2) ? delta : 0);
                g += ((i % 3 == 1) ? delta : 0);
                b += ((i % 2 == 1) ? delta : 0);
                b += ((i % 3 == 2) ? delta : 0);
                this.colors.push(new RGB(r % 256, g % 256, b % 256));
            }
        }
        this.listeners.registerCallBack("touchstart", e => true, e => this.handleClick(e));
    }
    calcColor(i = this.highLightedCell) {
        const color = new RGB(this.colors[i].red, this.colors[i].green, this.colors[i].blue);
        const scale = 1.6;
        if (this.shiftDown) {
            color.red = Math.floor(color.red * scale) < 256 ? Math.floor(color.red * scale) : 255;
            color.green = Math.floor(color.green * scale) < 256 ? Math.floor(color.green * scale) : 255;
            color.blue = Math.floor(color.blue * scale) < 256 ? Math.floor(color.blue * scale) : 255;
        }
        return color;
    }
    handleClick(event) {
        this.highLightedCell = Math.floor((event.touchPos[0] / this.canvas.width) * this.colors.length);
        this.textBoxColor.value = this.calcColor().htmlRBG();
    }
    setSelectedColor(color) {
        if (color.length === 7) {
            this.colors[this.highLightedCell].loadString(color);
        }
    }
    draw() {
        const ctx = this.ctx;
        for (let i = 0; i < this.colors.length; i++) {
            const width = (this.canvas.width / this.colors.length);
            const height = this.canvas.height;
            ctx.fillStyle = this.calcColor(i).htmlRBG();
            ctx.strokeStyle = "#000000";
            ctx.fillRect(i * width, 0, width, height);
            ctx.strokeRect(i * width, 0, width, height);
            if (i == this.highLightedCell) {
                for (let j = 0; j < height; j += 5)
                    ctx.strokeRect(i * width + j, j, width - j * 2, height - j * 2);
            }
        }
    }
}
;
class GLHelper {
    constructor(canvas) {
        this.glctx = canvas.getContext("webgl");
        // Only continue if WebGL is available and working
        if (this.glctx === null) {
            const errorText = "Unable to initialize WebGL. Your browser or machine may not support it.";
            alert(errorText);
            throw Error(errorText);
        }
        // Set clear color to black, fully opaque
        this.glctx.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.glctx.clear(this.glctx.COLOR_BUFFER_BIT);
    }
    genGLBuffer() {
        if (!this.glBuffer && this.triangleBufferData.length * 4 != this.glBufferBuffer.byteLength) {
            this.glBufferBuffer = new ArrayBuffer(this.triangleBufferData.length * 4);
            this.glBuffer = new Float32Array(this.glBufferBuffer);
        }
        let i = 0;
        this.triangleBufferData.forEach(element => {
            this.glBuffer[i++] = element;
        });
    }
    pushRect(x, y, width, height) {
        const left = x / width;
        const right = (x + 1) / width;
        const top = y;
        const bottom = y + height;
        const depth = 0;
        /*t1*/
        this.triangleBufferData.push(left);
        this.triangleBufferData.push(bottom);
        this.triangleBufferData.push(depth);
        this.triangleBufferData.push(right);
        this.triangleBufferData.push(bottom);
        this.triangleBufferData.push(depth);
        this.triangleBufferData.push(left);
        this.triangleBufferData.push(top);
        this.triangleBufferData.push(depth);
        /*t2*/
        this.triangleBufferData.push(left);
        this.triangleBufferData.push(top);
        this.triangleBufferData.push(depth);
        this.triangleBufferData.push(right);
        this.triangleBufferData.push(bottom);
        this.triangleBufferData.push(depth);
        this.triangleBufferData.push(right);
        this.triangleBufferData.push(top);
        this.triangleBufferData.push(depth);
        //forward medical records 
    }
}
function logToServer(data) {
    fetch("/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => { console.log("Request complete! response:", data); });
}
async function main() {
    const newColor = document.getElementById("newColor");
    const field = new DrawingScreen(document.getElementById("screen"), [0, 0], [64, 64]);
    field.setDim([128, 128]);
    const pallette = new Pallette(document.getElementById("pallette_screen"), newColor);
    const setPalletteColorButton = document.getElementById("setPalletteColorButton");
    const palletteColorButtonListener = new SingleTouchListener(setPalletteColorButton, true, true);
    palletteColorButtonListener.registerCallBack("touchstart", e => true, e => { pallette.setSelectedColor(newColor.value); field.color = pallette.calcColor(); });
    pallette.canvas.addEventListener("mouseup", e => { field.color = pallette.calcColor(); });
    pallette.listeners.registerCallBack("touchend", e => true, e => { field.color = pallette.calcColor(); });
    document.addEventListener("keydown", e => { if (e.keyCode == 16 /*shift*/)
        pallette.shiftDown = true; field.color = pallette.calcColor(); });
    document.addEventListener("keyup", e => { if (e.keyCode == 16 /*shift*/)
        pallette.shiftDown = false; field.color = pallette.calcColor(); });
    const fps = 15;
    const goalSleep = 1000 / fps;
    while (true) {
        const start = Date.now();
        field.draw();
        pallette.draw();
        const adjustment = Date.now() - start <= 30 ? Date.now() - start : 30;
        await sleep(goalSleep - adjustment);
    }
}
main();
