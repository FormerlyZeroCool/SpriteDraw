function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const dim = [528, 528];
function threeByThreeMat(a, b) {
    return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
        a[6] * b[2] + a[7] * b[5] + a[8] * b[8]];
}
function matByVec(mat, vec) {
    return [mat[0] * vec[0] + mat[1] * vec[1] + mat[2] * vec[2],
        mat[3] * vec[0] + mat[4] * vec[1] + mat[5] * vec[2],
        mat[6] * vec[0] + mat[7] * vec[1] + mat[8] * vec[2]];
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
            newData.length = this.data.length << 1;
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
    constructor(r = 0, g = 0, b, a = 0) {
        this.color = 0;
        this.color = r << 24 | g << 16 | b << 8 | a;
    }
    blendAlphaCopy(color) {
        const alphant = this.alphaNormal();
        const alphanc = color.alphaNormal();
        const a0 = 1 / (alphanc + alphant * (1 - alphanc));
        this.setRed((alphanc * color.red() + alphant * this.red() * (1 - alphanc)) * a0);
        this.setBlue((alphanc * color.blue() + alphant * this.blue() * (1 - alphanc)) * a0);
        this.setGreen((alphanc * color.green() + alphant * this.green() * (1 - alphanc)) * a0);
        this.setAlpha(1 / a0 * 255);
    }
    compare(color) {
        return this.color === color.color;
    }
    copy(color) {
        this.color = color.color;
    }
    toInt() {
        return this.color;
    }
    toRGBA() {
        return [this.red(), this.green(), this.blue(), this.alpha()];
    }
    red() {
        return (this.color >> 24) & ((1 << 8) - 1);
    }
    green() {
        return (this.color >> 16) & ((1 << 8) - 1);
    }
    blue() {
        return (this.color >> 8) & ((1 << 8) - 1);
    }
    alpha() {
        return (this.color) & ((1 << 8) - 1);
    }
    alphaNormal() {
        return Math.round(((this.color & ((1 << 8) - 1)) / 255) * 100) / 100;
    }
    setRed(red) {
        this.color &= (1 << 24) - 1;
        this.color |= red << 24;
    }
    setGreen(green) {
        this.color &= ((1 << 16) - 1) | (((1 << 8) - 1) << 24);
        this.color |= green << 16;
    }
    setBlue(blue) {
        this.color &= ((1 << 8) - 1) | (((1 << 16) - 1) << 16);
        this.color |= blue << 8;
    }
    setAlpha(alpha) {
        this.color &= (((1 << 24) - 1) << 8);
        this.color |= alpha;
    }
    loadString(color) {
        let r;
        let g;
        let b;
        let a;
        if (color.substring(0, 4).toLowerCase() !== "rgba") {
            r = parseInt(color.substring(1, 3), 16);
            g = parseInt(color.substring(3, 5), 16);
            b = parseInt(color.substring(5, 7), 16);
            a = parseFloat(color.substring(7, 9)) * 255;
        }
        else {
            const vals = color.split(",");
            vals[0] = vals[0].substring(5);
            vals[3] = vals[3].substring(0, vals[3].length - 1);
            r = parseInt(vals[0], 10);
            g = parseInt(vals[1], 10);
            b = parseInt(vals[2], 10);
            a = parseFloat(vals[3]) * 255;
        }
        if (!isNaN(r) && r <= 255 && r >= 0) {
            this.setRed(r);
        }
        if (!isNaN(g) && g <= 255 && g >= 0) {
            this.setGreen(g);
        }
        if (!isNaN(b) && b <= 255 && b >= 0) {
            this.setBlue(b);
        }
        if (!isNaN(a) && a <= 255 && a >= 0) {
            this.setAlpha(a);
        }
    }
    htmlRBGA() {
        return `rgba(${this.red()}, ${this.green()}, ${this.blue()}, ${this.alphaNormal()})`;
    }
    htmlRBG() {
        const red = this.red() < 16 ? `0${this.red().toString(16)}` : this.red().toString(16);
        const green = this.green() < 16 ? `0${this.green().toString(16)}` : this.green().toString(16);
        const blue = this.blue() < 16 ? `0${this.blue().toString(16)}` : this.blue().toString(16);
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
class ToolSelector {
    constructor(keyboardHandler, imgWidth = 50, imgHeight = 50) {
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.selectedTool = 0;
        this.keyboardHandler = keyboardHandler;
        this.keyboardHandler.registerCallBack("keydown", e => e.code === "ArrowUp" || e.code === "ArrowDown", e => {
            e.preventDefault();
            if (e.code === "ArrowUp")
                if (this.selectedTool !== 0)
                    this.selectedTool--;
                else
                    this.selectedTool = this.toolArray.length - 1;
            else {
                this.selectedTool++;
                this.selectedTool %= this.toolArray.length;
            }
        });
        this.toolArray = new Array();
        fetchImage("images/penSprite.png").then(img => {
            this.penTool = img;
            this.toolArray.push(new Pair("pen", this.penTool));
        });
        fetchImage("images/fillSprite.png").then(img => {
            this.fillTool = img;
            this.toolArray.push(new Pair("fill", this.fillTool));
        });
        fetchImage("images/LineDrawSprite.png").then(img => {
            this.lineTool = img;
            this.toolArray.push(new Pair("line", this.lineTool));
        });
        fetchImage("images/rectSprite.png").then(img => {
            this.rectTool = img;
            this.toolArray.push(new Pair("rect", this.rectTool));
        });
        fetchImage("images/ovalSprite.png").then(img => {
            this.ovalTool = img;
            this.toolArray.push(new Pair("oval", this.ovalTool));
        });
        fetchImage("images/copySprite.png").then(img => {
            this.copyTool = img;
            this.toolArray.push(new Pair("copy", this.copyTool));
        });
        fetchImage("images/pasteSprite.png").then(img => {
            this.pasteTool = img;
            this.toolArray.push(new Pair("paste", this.pasteTool));
        });
        fetchImage("images/dragSprite.png").then(img => {
            this.dragTool = img;
            this.toolArray.push(new Pair("drag", this.dragTool));
        });
        fetchImage("images/redoSprite.png").then(img => {
            this.undoTool = img;
            this.toolArray.push(new Pair("redo", this.undoTool));
        });
        fetchImage("images/undoSprite.png").then(img => {
            this.redoTool = img;
            this.toolArray.push(new Pair("undo", this.redoTool));
        });
        fetchImage("images/colorPickerSprite.png").then(img => {
            this.colorPickerTool = img;
            this.toolArray.push(new Pair("colorPicker", this.colorPickerTool));
        });
        this.canvas = document.getElementById("tool_selector_screen");
        this.touchListener = new SingleTouchListener(this.canvas, true, true);
        this.touchListener.registerCallBack("touchstart", e => true, e => {
            const imgPerColumn = (this.canvas.height / this.imgHeight);
            const y = Math.floor(e.touchPos[1] / this.imgHeight);
            const x = Math.floor(e.touchPos[0] / this.imgWidth);
            const clicked = y + x * imgPerColumn;
            if (clicked < this.toolArray.length) {
                this.selectedTool = clicked;
            }
        });
        this.ctx = this.canvas.getContext("2d");
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#000000";
        this.ctx.fillStyle = "#FFFFFF";
    }
    draw() {
        const imgPerColumn = (this.canvas.height / this.imgHeight);
        const imgPerRow = (this.canvas.width / this.imgWidth);
        if (this.toolArray.length > imgPerColumn * imgPerRow) {
            this.canvas.width += this.imgWidth;
            this.ctx = this.canvas.getContext("2d");
            this.ctx.fillStyle = "#FFFFFF";
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.toolArray.length; i++) {
            const toolImage = this.toolArray[i].second;
            if (toolImage)
                this.ctx.drawImage(toolImage, Math.floor(i / imgPerColumn) * this.imgWidth, i * this.penTool.height % (imgPerColumn * this.imgHeight));
        }
        if (this.penTool)
            this.ctx.strokeRect(Math.floor(this.selectedTool / imgPerColumn) * this.imgWidth, this.selectedTool * this.imgHeight % (imgPerColumn * this.imgHeight), this.imgWidth, this.imgHeight);
    }
    selectedToolName() {
        if (this.toolArray[this.selectedTool])
            return this.toolArray[this.selectedTool].first;
        return null;
    }
}
;
class ClipBoard {
    constructor(canvas, keyboardHandler, maxWidth, maxHeight, pixelWidth, pixelHeight, pixelCountX, pixelCountY) {
        this.canvas = canvas;
        this.currentDim = [0, 0];
        this.pixelCountX = pixelCountX;
        this.pixelCountY = pixelCountY;
        this.offscreenCanvas = document.createElement("canvas");
        this.clipBoardBuffer = new Array();
        this.canvas.width = maxWidth / 4;
        this.canvas.height = maxHeight / 4;
        this.offscreenCanvas.width = maxWidth;
        this.offscreenCanvas.height = maxHeight;
        this.pixelWidth = Math.floor(pixelWidth + 0.5);
        this.pixelHeight = Math.floor(pixelHeight);
        this.centerX = Math.floor(maxWidth / 8);
        this.centerY = Math.floor(maxHeight / 8);
        this.innerWidth = 0;
        this.innerHeight = 0;
        this.angle = 0;
        this.touchListener = new SingleTouchListener(canvas, true, true);
        this.touchListener.registerCallBack("touchmove", e => true, e => {
            if (this.clipBoardBuffer.length) {
                this.angle += 0.05;
                if (this.angle >= 1) {
                    this.rotate(Math.PI / 2);
                    this.angle = 0;
                }
            }
        });
    }
    //only really works for rotation by pi/2
    rotate(theta) {
        const dx = this.pixelCountX / 2;
        const dy = this.pixelCountY / 2;
        const initTransMatrix = [1, 0, dx * -1,
            0, 1, dy * -1,
            0, 0, 1];
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const rotationMatrix = [cos, -sin, 0,
            sin, cos, 0,
            0, 0, 1];
        const revertTransMatrix = [1, 0, dx,
            0, 1, dy,
            0, 0, 1];
        const finalTransformationMatrix = threeByThreeMat(threeByThreeMat(initTransMatrix, rotationMatrix), revertTransMatrix);
        const vec = [0, 0, 0];
        for (const rec of this.clipBoardBuffer.entries()) {
            let x = rec[1].second % this.pixelCountX;
            let y = Math.floor(rec[1].second / this.pixelCountX);
            vec[0] = x;
            vec[1] = y;
            vec[2] = 1;
            const transformed = matByVec(finalTransformationMatrix, vec);
            x = Math.floor(transformed[0]);
            y = Math.floor(transformed[1]);
            rec[1].second = Math.floor((x) + (y) * this.pixelCountX);
        }
        this.clipBoardBuffer.sort((a, b) => a.second - b.second);
        this.refreshImageFromBuffer(this.currentDim[1], this.currentDim[0]);
    }
    //copies array of rgb values to canvas offscreen, centered within the canvas
    refreshImageFromBuffer(width, height) {
        this.currentDim = [width, height];
        width = Math.floor(width + 0.5);
        height = Math.floor(height + 0.5);
        this.innerWidth = width * this.pixelWidth;
        this.innerHeight = height * this.pixelHeight;
        const ctx = this.offscreenCanvas.getContext("2d");
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const start_x = (this.centerX / this.canvas.width * this.pixelCountX) - (width * (this.pixelWidth / 4) / 2);
        const start_y = (this.centerY / this.canvas.height * this.pixelCountY) - (height * (this.pixelHeight / 4) / 2);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sx = ((x + start_x) * this.pixelWidth / 4);
                const sy = ((y + start_y) * this.pixelHeight / 4);
                ctx.fillStyle = this.clipBoardBuffer[Math.floor(x + y * width)].first.htmlRBGA();
                ctx.fillRect(sx, sy, this.pixelWidth / 4, this.pixelHeight / 4);
            }
        }
    }
    draw(canvas = this.canvas) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.offscreenCanvas, 0, 0);
        ctx.rotate(Math.PI / 2);
    }
}
class DrawingScreen {
    constructor(canvas, keyboardHandler, offset, dimensions, newColorTextBox) {
        const bounds = [Math.ceil(canvas.width / dim[0]) * dim[0], Math.ceil(canvas.height / dim[1]) * dim[1]];
        canvas.width = bounds[0];
        canvas.height = bounds[1];
        this.dragDataMaxPoint = 0;
        this.canvas = canvas;
        this.dragData = null;
        this.lineWidth = dimensions[0] / bounds[0] * 4;
        this.canvas.offScreenCanvas = document.createElement('canvas');
        this.canvas.offScreenCanvas.width = this.canvas.width;
        this.canvas.offScreenCanvas.height = this.canvas.height;
        this.canvas.offScreenCanvas.ctx = this.canvas.offScreenCanvas.getContext("2d");
        this.keyboardHandler = keyboardHandler;
        this.toolSelector = new ToolSelector(keyboardHandler);
        this.updatesStack = new Array();
        this.undoneUpdatesStack = new Array();
        this.selectionRect = new Array();
        this.offset = new Pair(offset[0], offset[1]);
        this.bounds = new Pair(bounds[0], bounds[1]);
        this.dimensions = new Pair(dimensions[0], dimensions[1]);
        this.screenBuffer = new Array();
        this.screenLastBuffer = new Array();
        this.selectionRect = [0, 0, 0, 0];
        this.pasteRect = [0, 0, 0, 0];
        this.clipBoard = new ClipBoard(document.getElementById("clipboard_canvas"), keyboardHandler, bounds[0], bounds[1], bounds[0] / dimensions[0], bounds[1] / dimensions[1], dimensions[0], dimensions[1]);
        for (let i = 0; i < dimensions[0] * dimensions[1]; i++) {
            this.screenBuffer.push(new RGB(255, 255, 255, 0));
            this.screenLastBuffer.push(new RGB(1, 0, 0, 0));
        }
        this.listeners = new SingleTouchListener(canvas, true, true);
        this.listeners.registerCallBack("touchstart", e => true, e => {
            //save for undo
            if (this.updatesStack.length == 0 || this.updatesStack[this.updatesStack.length - 1].length) {
                if (this.toolSelector.selectedToolName() !== "redo" && this.toolSelector.selectedToolName() !== "undo")
                    this.updatesStack.push(new Array());
            }
            this.canvas.focus();
            if (this.toolSelector.selectedToolName() != "paste") {
                this.pasteRect = [0, 0, 0, 0];
            }
            else {
                this.pasteRect = [e.touchPos[0], e.touchPos[1], this.clipBoard.currentDim[0] * (bounds[0] / dimensions[0]), this.clipBoard.currentDim[1] * (bounds[1] / dimensions[1])];
            }
            const gx = Math.floor((e.touchPos[0] - this.offset.first) / this.bounds.first * this.dimensions.first);
            const gy = Math.floor((e.touchPos[1] - this.offset.second) / this.bounds.second * this.dimensions.second);
            switch (this.toolSelector.selectedToolName()) {
                case ("pen"):
                    break;
                case ("fill"):
                    break;
                case ("line"):
                    break;
                case ("drag"):
                    this.saveDragDataToScreen();
                    if (this.keyboardHandler.keysHeld["AltLeft"])
                        this.dragData = this.getSelectedPixelGroup(new Pair(gx, gy), true);
                    else
                        this.dragData = this.getSelectedPixelGroup(new Pair(gx, gy), false);
                    break;
                case ("oval"):
                case ("rect"):
                case ("copy"):
                    this.selectionRect = [e.touchPos[0], e.touchPos[1], 0, 0];
                    break;
                case ("paste"):
                    this.pasteRect = [e.touchPos[0], e.touchPos[1], this.pasteRect[2], this.pasteRect[3]];
                    break;
                case ("undo"):
                    this.undoLast();
                    break;
                case ("redo"):
                    this.redoLast();
                    break;
                case ("colorPicker"):
                    this.color.copy(this.screenBuffer[gx + gy * this.dimensions.first]);
                    newColorTextBox.value = this.color.htmlRBGA();
                    break;
            }
        });
        this.keyboardHandler.registerCallBack("keydown", e => true, event => {
            switch (event.code) {
                case ('KeyC'):
                    if (this.keyboardHandler.keysHeld["KeyC"] === 1) {
                        this.selectionRect = [0, 0, 0, 0];
                        this.pasteRect = [0, 0, 0, 0];
                    }
                    break;
                case ('KeyV'):
                    this.copy();
                    break;
                case ('KeyU'):
                    this.undoLast();
                    break;
                case ('KeyR'):
                    this.redoLast();
                    break;
            }
        });
        this.listeners.registerCallBack("touchend", e => true, e => {
            switch (this.toolSelector.selectedToolName()) {
                case ("oval"):
                    this.handleEllipse(e);
                    this.selectionRect = [0, 0, 0, 0];
                    break;
                case ("pen"):
                    this.handleTap(e);
                    break;
                case ("drag"):
                    this.saveDragDataToScreen();
                    this.dragData = null;
                    break;
                case ("fill"):
                    const gx = Math.floor((e.touchPos[0] - this.offset.first) / this.bounds.first * this.dimensions.first);
                    const gy = Math.floor((e.touchPos[1] - this.offset.second) / this.bounds.second * this.dimensions.second);
                    this.fillArea(new Pair(gx, gy));
                    break;
                case ("line"):
                    this.handleTap(e);
                    const x1 = e.touchPos[0] - e.deltaX;
                    const y1 = e.touchPos[1] - e.deltaY;
                    this.handleDraw(x1, e.touchPos[0], y1, e.touchPos[1]);
                    break;
                case ("copy"):
                    const bounds = this.saveToBuffer(this.selectionRect, this.clipBoard.clipBoardBuffer);
                    this.clipBoard.refreshImageFromBuffer(bounds.first, bounds.second);
                    this.selectionRect = [0, 0, 0, 0];
                    break;
                case ("paste"):
                    this.copy();
                    break;
                case ("rect"):
                    this.drawRect([this.selectionRect[0], this.selectionRect[1]], [this.selectionRect[0] + this.selectionRect[2], this.selectionRect[1] + this.selectionRect[3]]);
                    this.selectionRect = [0, 0, 0, 0];
                    break;
            }
        });
        this.listeners.registerCallBack("touchmove", e => true, e => {
            switch (this.toolSelector.selectedToolName()) {
                case ("pen"):
                    const x1 = e.touchPos[0] - e.deltaX;
                    const y1 = e.touchPos[1] - e.deltaY;
                    this.handleDraw(x1, e.touchPos[0], y1, e.touchPos[1]);
                    break;
                case ("drag"):
                    //console.log(this.keyboardHandler.keysHeld["AltLeft"])
                    if (this.keyboardHandler.keysHeld["AltRight"]) {
                        if (e.moveCount % 2 == 0)
                            this.rotateSelectedPixelGroup(Math.PI / 32);
                    }
                    else {
                        this.dragData.first.first += (e.deltaX / this.bounds.first) * this.dimensions.first;
                        this.dragData.first.second += (e.deltaY / this.bounds.second) * this.dimensions.second;
                    }
                    break;
                case ("fill"):
                    break;
                case ("oval"):
                case ("rect"):
                    this.selectionRect[2] += e.deltaX;
                    this.selectionRect[3] += e.deltaY;
                    break;
                case ("copy"):
                    this.selectionRect[2] += e.deltaX;
                    this.selectionRect[3] += e.deltaY;
                    this.pasteRect[2] = this.selectionRect[2];
                    this.pasteRect[3] = this.selectionRect[3];
                    break;
                case ("paste"):
                    this.pasteRect[0] += e.deltaX;
                    this.pasteRect[1] += e.deltaY;
                    break;
            }
        });
        this.color = new RGB(0, 0, 0, 255);
    }
    saveToBuffer(selectionRect, buffer) {
        if (selectionRect[2] < 0) {
            selectionRect[0] += selectionRect[2];
            selectionRect[2] *= -1;
        }
        if (selectionRect[3] < 0) {
            selectionRect[1] += selectionRect[3];
            selectionRect[3] *= -1;
        }
        buffer.length = 0;
        const source_x = Math.floor((selectionRect[0] - this.offset.first) / this.bounds.first * this.dimensions.first);
        const source_y = Math.floor((selectionRect[1] - this.offset.second) / this.bounds.second * this.dimensions.second);
        const width = Math.floor((selectionRect[2] - this.offset.first) / this.bounds.first * this.dimensions.first);
        const height = Math.floor((selectionRect[3] - this.offset.second) / this.bounds.second * this.dimensions.second);
        const area = width * height;
        for (let i = 0; i < area; i++) {
            const copyAreaX = i % width;
            const copyAreaY = Math.floor(i / width);
            const sourceIndex = source_x + source_y * this.dimensions.first + copyAreaX + copyAreaY * this.dimensions.first;
            if (this.inBufferBounds(source_x + copyAreaX, source_y + copyAreaY)) {
                const pixel = this.screenBuffer[sourceIndex];
                buffer.push(new Pair(new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha()), sourceIndex));
            }
        }
        return new Pair(width, height);
    }
    copy() {
        const dest_x = Math.floor((this.pasteRect[0] - this.offset.first) / this.bounds.first * this.dimensions.first);
        const dest_y = Math.floor((this.pasteRect[1] - this.offset.second) / this.bounds.second * this.dimensions.second);
        const width = this.clipBoard.currentDim[0];
        const height = this.clipBoard.currentDim[1];
        const initialIndex = dest_x + dest_y * this.dimensions.first;
        const altHeld = this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"];
        for (let i = 0; i < this.clipBoard.clipBoardBuffer.length; i++) {
            const copyAreaX = i % width;
            const copyAreaY = Math.floor(i / width);
            const destIndex = initialIndex + copyAreaX + copyAreaY * this.dimensions.first;
            const dest = this.screenBuffer[destIndex];
            const source = this.clipBoard.clipBoardBuffer[i].first;
            if (this.inBufferBounds(dest_x + copyAreaX, dest_y + copyAreaY) && (!dest.compare(source) || source.alpha() != 255)) {
                this.updatesStack[this.updatesStack.length - 1].push(new Pair(destIndex, new RGB(dest.red(), dest.green(), dest.blue(), dest.alpha())));
                if (altHeld)
                    dest.copy(source);
                else
                    dest.blendAlphaCopy(source);
            }
        }
    }
    handleTap(event) {
        const gx = Math.floor((event.touchPos[0] - this.offset.first) / this.bounds.first * this.dimensions.first);
        const gy = Math.floor((event.touchPos[1] - this.offset.second) / this.bounds.second * this.dimensions.second);
        if (gx < this.dimensions.first && gy < this.dimensions.second) {
            for (let i = -0.5 * this.lineWidth; i < this.lineWidth * 0.5; i += 0.5) {
                for (let j = -0.5 * this.lineWidth; j < this.lineWidth * 0.5; j += 0.5) {
                    const ngx = gx + Math.floor(j + 0.5);
                    const ngy = (gy + Math.floor(i + 0.5));
                    const pixel = this.screenBuffer[ngx + ngy * this.dimensions.first];
                    if (pixel && !pixel.compare(this.color)) {
                        this.updatesStack[this.updatesStack.length - 1].push(new Pair(ngx + ngy * this.dimensions.first, new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha())));
                        pixel.copy(this.color);
                    }
                }
            }
        }
    }
    async fillArea(startCoordinate) {
        const stack = new Queue(1024);
        let checkedMap = {};
        checkedMap = {};
        const startIndex = startCoordinate.first + startCoordinate.second * this.dimensions.first;
        const startPixel = this.screenBuffer[startIndex];
        const spc = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
        stack.push(startIndex);
        while (stack.length > 0) {
            const cur = stack.pop();
            const pixelColor = this.screenBuffer[cur];
            if (cur >= 0 && cur < this.dimensions.first * this.dimensions.second &&
                pixelColor.compare(spc) && !checkedMap[cur]) {
                checkedMap[cur] = true;
                if (!pixelColor.compare(this.color)) {
                    this.updatesStack[this.updatesStack.length - 1].push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                    pixelColor.copy(this.color);
                }
                if (this.keyboardHandler.keysHeld["KeyS"]) {
                    this.draw();
                    await sleep(1);
                }
                if (!checkedMap[cur + this.dimensions.first])
                    stack.push(cur + this.dimensions.first);
                if (!checkedMap[cur - this.dimensions.first])
                    stack.push(cur - this.dimensions.first);
                if (!checkedMap[cur - 1])
                    stack.push(cur - 1);
                if (!checkedMap[cur + 1])
                    stack.push(cur + 1);
            }
        }
    }
    //Pair<offset point>, Map of colors encoded as numbers by location>
    getSelectedPixelGroup(startCoordinate, countColor) {
        const stack = new Array(1024);
        const data = [];
        const defaultColor = new RGB(255, 255, 255, 0);
        let checkedMap = {};
        checkedMap = {};
        const startIndex = startCoordinate.first + startCoordinate.second * this.dimensions.first;
        const startPixel = this.screenBuffer[startIndex];
        const spc = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
        stack.push(startIndex);
        this.dragDataMaxPoint = 0;
        this.dragDataMinPoint = this.dimensions.first * this.dimensions.second;
        while (stack.length > 0) {
            const cur = stack.pop();
            const pixelColor = this.screenBuffer[cur];
            if (cur >= 0 && cur < this.dimensions.first * this.dimensions.second &&
                (pixelColor.alpha() !== 0 && (!countColor || pixelColor.color === spc.color)) && !checkedMap[cur]) {
                checkedMap[cur] = true;
                this.updatesStack[this.updatesStack.length - 1].push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                //top left
                data.push(cur % this.dimensions.first);
                data.push(Math.floor(cur / this.dimensions.first));
                //top right
                data.push(cur % this.dimensions.first + 1);
                data.push(Math.floor(cur / this.dimensions.first));
                //bottom left
                data.push(cur % this.dimensions.first);
                data.push(Math.floor(cur / this.dimensions.first) + 1);
                //bottom right
                data.push(cur % this.dimensions.first + 1);
                data.push(Math.floor(cur / this.dimensions.first) + 1);
                data.push(pixelColor.color);
                pixelColor.color = defaultColor.color;
                if (cur > this.dragDataMaxPoint)
                    this.dragDataMaxPoint = cur;
                if (cur < this.dragDataMinPoint)
                    this.dragDataMinPoint = cur;
                if (!checkedMap[cur + 1])
                    stack.push(cur + 1);
                if (!checkedMap[cur - 1])
                    stack.push(cur - 1);
                if (!checkedMap[cur + this.dimensions.first])
                    stack.push(cur + this.dimensions.first);
                if (!checkedMap[cur - this.dimensions.first])
                    stack.push(cur - this.dimensions.first);
                if (!checkedMap[cur + this.dimensions.first - 1])
                    stack.push(cur + this.dimensions.first - 1);
                if (!checkedMap[cur + this.dimensions.first + 1])
                    stack.push(cur + this.dimensions.first + 1);
                if (!checkedMap[cur - this.dimensions.first - 1])
                    stack.push(cur - this.dimensions.first - 1);
                if (!checkedMap[cur - this.dimensions.first + 1])
                    stack.push(cur - this.dimensions.first + 1);
            }
        }
        this.updatesStack.push([]);
        return new Pair(new Pair(0, 0), data);
    }
    rotateSelectedPixelGroup(theta) {
        const min = [this.dragDataMinPoint % this.dimensions.first, Math.floor(this.dragDataMinPoint / this.dimensions.first)];
        const max = [this.dragDataMaxPoint % this.dimensions.first, Math.floor(this.dragDataMaxPoint / this.dimensions.first)];
        const dx = (min[0] + max[0]) / 2;
        const dy = (min[1] + max[1]) / 2;
        console.log(dx, dy);
        this.dragDataMinPoint = this.dimensions.first * this.dimensions.second;
        this.dragDataMaxPoint = 0;
        const initTransMatrix = [1, 0, dx,
            0, 1, dy,
            0, 0, 1];
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const identity = [1, 0, 0,
            0, 1, 0,
            0, 0, 1];
        const rotationMatrix = [cos, -sin, 0,
            sin, cos, 0,
            0, 0, 1];
        const revertTransMatrix = [1, 0, dx * -1,
            0, 1, dy * -1,
            0, 0, 1];
        const finalTransformationMatrix = threeByThreeMat(threeByThreeMat(initTransMatrix, rotationMatrix), revertTransMatrix);
        const vec = [0, 0, 0];
        const data = [];
        for (let i = 0; i < this.dragData.second.length; i += 9) {
            for (let j = i; j < i + 8; j += 2) {
                vec[0] = this.dragData.second[j];
                vec[1] = this.dragData.second[j + 1];
                vec[2] = 1;
                let transformed = matByVec(finalTransformationMatrix, vec);
                const point = Math.floor(transformed[0]) + Math.floor(transformed[1]) * this.dimensions.first;
                if (point < this.dragDataMinPoint && point >= 0)
                    this.dragDataMinPoint = point;
                if (point > this.dragDataMaxPoint)
                    this.dragDataMaxPoint = point;
                data.push(transformed[0]);
                data.push(transformed[1]);
            }
            data.push(this.dragData.second[i + 8]);
        }
        this.dragData.second = data;
    }
    drawRect(start, end) {
        this.drawLine(start, [start[0], end[1]]);
        this.drawLine(start, [end[0], start[1]]);
        this.drawLine([start[0], end[1]], end);
        this.drawLine([end[0], start[1]], end);
    }
    drawLine(start, end) {
        this.handleDraw(start[0], end[0], start[1], end[1]);
    }
    async handleDraw(x1, x2, y1, y2) {
        //draw line from current touch pos to the touchpos minus the deltas
        //calc equation for line
        const deltaY = y2 - y1;
        const deltaX = x2 - x1;
        const m = deltaY / deltaX;
        const b = y2 - m * x2;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const min = Math.min(x1, x2);
            const max = Math.max(x1, x2);
            for (let x = min; x < max; x += 0.2) {
                const y = m * x + b;
                const gx = Math.floor((x - this.offset.first) / this.bounds.first * this.dimensions.first);
                const gy = Math.floor((y - this.offset.second) / this.bounds.second * this.dimensions.second);
                if (gx < this.dimensions.first && gy < this.dimensions.second) {
                    for (let i = -0.5 * this.lineWidth; i < this.lineWidth * 0.5; i += 0.5) {
                        for (let j = -0.5 * this.lineWidth; j < this.lineWidth * 0.5; j += 0.5) {
                            const ngx = gx + Math.floor(j + 0.5);
                            const ngy = (gy + Math.floor(i + 0.5));
                            const pixel = this.screenBuffer[ngx + ngy * this.dimensions.first];
                            if (pixel && !pixel.compare(this.color)) {
                                this.updatesStack[this.updatesStack.length - 1].push(new Pair(ngx + ngy * this.dimensions.first, new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha())));
                                pixel.copy(this.color);
                            }
                        }
                    }
                    if (this.keyboardHandler.keysHeld["KeyS"]) {
                        this.draw();
                        await sleep(1);
                    }
                }
            }
        }
        else {
            const min = Math.min(y1, y2);
            const max = Math.max(y1, y2);
            for (let y = min; y < max; y += 0.2) {
                const x = Math.abs(deltaX) > 0 ? (y - b) / m : x2;
                const gx = Math.floor((x - this.offset.first) / this.bounds.first * this.dimensions.first);
                const gy = Math.floor((y - this.offset.second) / this.bounds.second * this.dimensions.second);
                if (gx < this.dimensions.first && gy < this.dimensions.second) {
                    for (let i = -0.5 * this.lineWidth; i < this.lineWidth * 0.5; i += 0.5) {
                        for (let j = -0.5 * this.lineWidth; j < this.lineWidth * 0.5; j += 0.5) {
                            const ngx = gx + Math.floor(j + 0.5);
                            const ngy = (gy + Math.floor(i + 0.5));
                            const pixel = this.screenBuffer[ngx + ngy * this.dimensions.first];
                            if (pixel && !pixel.compare(this.color)) {
                                this.updatesStack[this.updatesStack.length - 1].push(new Pair(ngx + ngy * this.dimensions.first, new RGB(pixel.red(), pixel.green(), pixel.blue(), pixel.alpha())));
                                pixel.copy(this.color);
                            }
                        }
                    }
                    if (this.keyboardHandler.keysHeld["KeyS"]) {
                        this.draw();
                        await sleep(1);
                    }
                }
            }
        }
    }
    async handleEllipse(event) {
        const start_x = Math.min(event.touchPos[0] - event.deltaX, event.touchPos[0]);
        const end_x = Math.max(event.touchPos[0] - event.deltaX, event.touchPos[0]);
        const min_y = Math.min(event.touchPos[1] - event.deltaY, event.touchPos[1]);
        const max_y = Math.max(event.touchPos[1] - event.deltaY, event.touchPos[1]);
        const height = (max_y - min_y) / 2;
        const width = (end_x - start_x) / 2;
        const h = start_x + (end_x - start_x) / 2;
        const k = min_y + (max_y - min_y) / 2;
        let last = [h + width * Math.cos(0), k + height * Math.sin(0)];
        for (let x = -0.1; x < 2 * Math.PI; x += 0.05) {
            const cur = [h + width * Math.cos(x), k + height * Math.sin(x)];
            this.drawLine([last[0], last[1]], [cur[0], cur[1]]);
            if (this.keyboardHandler.keysHeld["KeyS"]) {
                this.draw();
                await sleep(1);
            }
            last = cur;
        }
    }
    async undoLast() {
        if (this.updatesStack.length) {
            const data = this.updatesStack.pop();
            const backedUpFrame = new Array();
            this.undoneUpdatesStack.push(backedUpFrame);
            for (let i = 0; i < data.length; i++) {
                const el = data[i];
                backedUpFrame.push(el);
                const color = (this.screenBuffer[el.first]).color;
                this.screenBuffer[el.first].copy(el.second);
                el.second.color = color;
                if (this.keyboardHandler.keysHeld["KeyS"]) {
                    this.draw();
                    await sleep(1);
                }
            }
        }
        else {
            console.log("Error, nothing to undo");
        }
    }
    async redoLast() {
        if (this.undoneUpdatesStack.length) {
            const data = this.undoneUpdatesStack.pop();
            const backedUpFrame = new Array();
            this.updatesStack.push(backedUpFrame);
            for (let i = 0; i < data.length; i++) {
                const el = data[i];
                backedUpFrame.push(el);
                const color = this.screenBuffer[el.first].color;
                this.screenBuffer[el.first].copy(el.second);
                el.second.color = color;
                if (this.keyboardHandler.keysHeld["KeyS"]) {
                    this.draw();
                    await sleep(1);
                }
            }
        }
        else {
            console.log("Error, nothing to redo");
        }
    }
    hashP(x, y) {
        return x + y * this.dimensions.first;
    }
    inBufferBounds(x, y) {
        return x >= 0 && x < this.dimensions.first && y >= 0 && y < this.dimensions.second;
    }
    setDim(newDim) {
        if (newDim.length === 2) {
            this.bounds.first = Math.ceil(this.canvas.width / dim[0]) * dim[0];
            this.bounds.second = Math.ceil(this.canvas.height / dim[1]) * dim[1];
            const bounds = [Math.ceil(this.canvas.width / dim[0]), Math.ceil(this.canvas.height / dim[1])];
            this.canvas.width = bounds[0];
            this.canvas.height = bounds[1];
            this.dimensions = new Pair(newDim[0], newDim[1]);
            if (this.screenBuffer.length < newDim[0] * newDim[1]) {
                for (let i = this.screenBuffer.length; i < newDim[0] * newDim[1]; i++)
                    this.screenBuffer.push(new RGB(255, 255, 255, 0));
            }
        }
    }
    lowerPixelPercentage(a) {
        const frac = a - Math.floor(a);
        return 1 - frac;
    }
    saveDragDataToScreen() {
        if (this.dragData) {
            const color0 = new RGB(0, 0, 0, 0);
            const color1 = new RGB(0, 0, 0, 0);
            const dragDataColors = this.dragData.second;
            const map = new Map();
            for (let i = 0; i < this.dragData.second.length; i += 9) {
                const x1 = dragDataColors[i + 0] + Math.floor(this.dragData.first.first);
                const y1 = dragDataColors[i + 1] + Math.floor(this.dragData.first.second);
                const x2 = dragDataColors[i + 2] + Math.floor(this.dragData.first.first);
                const y2 = dragDataColors[i + 3] + Math.floor(this.dragData.first.second);
                const x3 = dragDataColors[i + 6] + Math.floor(this.dragData.first.first);
                const y3 = dragDataColors[i + 7] + Math.floor(this.dragData.first.second);
                const deltaX = Math.max(x1, x2) - Math.min(x1, x2);
                const deltaY = Math.max(y1, y2) - Math.min(y1, y2);
                const deltaX2 = Math.max(x1, x3) - Math.min(x1, x3);
                const deltaY2 = Math.max(y1, y3) - Math.min(y1, y3);
                color0.color = dragDataColors[i + 8];
                const limit = 15;
                const ratio = 1 / limit;
                const percent = 1 / (limit * limit);
                for (let j = 0; j <= limit; j++) {
                    for (let k = 0; k <= limit; k++) {
                        const sub_x = Math.floor(k * ratio * deltaX + j * ratio * deltaX2 + x1);
                        const sub_y = Math.floor(k * ratio * deltaY + j * ratio * deltaY2 + y1);
                        const pixelIndex = sub_x + sub_y * this.dimensions.first;
                        let color = map.get(pixelIndex);
                        if (!color) {
                            color = [0, 0, 0, 0, 0];
                        }
                        if (color[4] < 1) {
                            color[0] += color0.red() * percent;
                            color[1] += color0.green() * percent;
                            color[2] += color0.blue() * percent;
                            color[3] += color0.alpha() * percent;
                            color[4] += percent;
                        }
                        map.set(pixelIndex, color);
                    }
                }
            }
            for (const [key, value] of map.entries()) {
                color0.setRed(value[0]);
                color0.setGreen(value[1]);
                color0.setBlue(value[2]);
                color0.setAlpha(value[3]);
                if (this.screenBuffer[key]) {
                    this.updatesStack[this.updatesStack.length - 1].push(new Pair(key, new RGB(this.screenBuffer[key].red(), this.screenBuffer[key].green(), this.screenBuffer[key].blue(), this.screenBuffer[key].alpha())));
                    this.screenBuffer[key].blendAlphaCopy(color0);
                }
            }
            ;
        }
    }
    draw() {
        this.clipBoard.draw();
        const ctx = this.canvas.getContext("2d");
        const cellHeight = (this.bounds.second / this.dimensions.second);
        const cellWidth = (this.bounds.first / this.dimensions.first);
        for (let y = 0; y < this.dimensions.second; y++) {
            for (let x = 0; x < this.dimensions.first; x++) {
                const sy = (this.offset.second + y * cellHeight);
                const sx = (this.offset.first + x * cellWidth);
                if (this.screenLastBuffer[x + y * this.dimensions.first].color != this.screenBuffer[x + y * this.dimensions.first].color) {
                    this.canvas.offScreenCanvas.ctx.fillStyle = "#FFFFFF";
                    this.canvas.offScreenCanvas.ctx.fillRect(sx, sy, cellWidth, cellHeight);
                    this.canvas.offScreenCanvas.ctx.fillStyle = this.screenBuffer[x + y * this.dimensions.first].htmlRBGA();
                    this.canvas.offScreenCanvas.ctx.fillRect(sx, sy, cellWidth, cellHeight);
                    this.screenLastBuffer[x + y * this.dimensions.first].color = this.screenBuffer[x + y * this.dimensions.first].color;
                }
            }
        }
        const reassignableColor = new RGB(0, 0, 0, 0);
        ctx.drawImage(this.canvas.offScreenCanvas, 0, 0);
        if (this.dragData) {
            const offset = (Math.floor(this.dragData.first.first) + Math.floor(this.dragData.first.second) * this.dimensions.first);
            const dragDataColors = this.dragData.second;
            for (let i = 0; i < this.dragData.second.length; i += 9) {
                const sx = (dragDataColors[i] + this.dragData.first.first) * cellWidth;
                const sy = (dragDataColors[i + 1] + this.dragData.first.second) * cellHeight;
                reassignableColor.color = dragDataColors[i + 8];
                ctx.fillStyle = reassignableColor.htmlRBGA();
                ctx.fillRect(sx, sy, cellWidth, cellHeight);
            }
            ;
        }
        if (this.listeners.registeredTouch && this.toolSelector.selectedToolName() === "line") {
            let touchStart = [this.listeners.touchStart["offsetX"], this.listeners.touchStart["offsetY"]];
            if (!touchStart[0]) {
                touchStart = [this.listeners.touchStart["clientX"] - this.canvas.getBoundingClientRect().left, this.listeners.touchStart["clientY"] - this.canvas.getBoundingClientRect().top];
            }
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.strokeStyle = this.color.htmlRBGA();
            ctx.moveTo(touchStart[0], touchStart[1]);
            ctx.lineTo(this.listeners.touchPos[0], this.listeners.touchPos[1]);
            ctx.stroke();
        }
        this.toolSelector.draw();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeRect(this.selectionRect[0], this.selectionRect[1], this.selectionRect[2], this.selectionRect[3]);
        ctx.strokeRect(this.pasteRect[0], this.pasteRect[1], this.pasteRect[2], this.pasteRect[3]);
        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(this.selectionRect[0] + 2, this.selectionRect[1] + 2, this.selectionRect[2] - 4, this.selectionRect[3] - 4);
        ctx.strokeStyle = "#0000FF";
        ctx.strokeRect(this.pasteRect[0] + 2, this.pasteRect[1] + 2, this.pasteRect[2] - 4, this.pasteRect[3] - 4);
    }
}
;
class KeyListenerTypes {
    constructor() {
        this.keydown = new Array();
        this.keypressed = new Array();
        this.keyup = new Array();
    }
}
;
class KeyboardHandler {
    constructor() {
        this.keysHeld = {};
        this.listenerTypeMap = new KeyListenerTypes();
        document.addEventListener("keyup", e => this.keyUp(e));
        document.addEventListener("keydown", e => this.keyDown(e));
        document.addEventListener("keypressed", e => this.keyPressed(e));
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach(handler => {
            if (handler.pred(event)) {
                handler.callBack(event);
            }
        });
    }
    keyDown(event) {
        if (this.keysHeld[event.code] === undefined || this.keysHeld[event.code] === null)
            this.keysHeld[event.code] = 1;
        else
            this.keysHeld[event.code]++;
        event.keysHeld = this.keysHeld;
        this.callHandler("keydown", event);
    }
    keyUp(event) {
        this.keysHeld[event.code] = 0;
        event.keysHeld = this.keysHeld;
        this.callHandler("keyup", event);
    }
    keyPressed(event) {
        event.keysHeld = this.keysHeld;
        this.callHandler("keypressed", event);
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
        this.component = component;
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
        this.moveCount = 0;
        event.timeSinceLastTouch = Date.now() - (this.lastTouchTime ? this.lastTouchTime : 0);
        this.lastTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"], this.touchStart["offsetY"]];
        if (!this.touchPos[0]) {
            this.touchPos = [this.touchStart["clientX"] - this.component.getBoundingClientRect().left, this.touchStart["clientY"] - this.component.getBoundingClientRect().top];
        }
        event.touchPos = this.touchPos;
        this.touchMoveEvents = [];
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
        ++this.moveCount;
        let touchMove = event.changedTouches.item(0);
        for (let i = 0; i < event.changedTouches["length"]; i++) {
            if (event.changedTouches.item(i).identifier == this.touchStart.identifier) {
                touchMove = event.changedTouches.item(i);
            }
        }
        if (touchMove) {
            if (!touchMove["offsetY"]) {
                touchMove.offsetX = touchMove["clientX"] - this.component.getBoundingClientRect().left;
                touchMove.offsetY = touchMove["clientY"] - this.component.getBoundingClientRect().top;
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
            event.moveCount = this.moveCount;
            this.touchMoveEvents.push(event);
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
                    touchEnd.offsetX = touchEnd["clientX"] - this.component.getBoundingClientRect().left;
                    touchEnd.offsetY = touchEnd["clientY"] - this.component.getBoundingClientRect().top;
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
                event.moveCount = this.moveCount;
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
    constructor(canvas, keyboardHandler, textBoxColor, colorCount = 10, colors = null) {
        this.canvas = canvas;
        this.keyboardHandler = keyboardHandler;
        this.ctx = canvas.getContext("2d");
        this.highLightedCell = 0;
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
        }
        if (colors !== null) {
            colors.forEach(el => {
                this.colors.push(new RGB(el.red(), el.green(), el.blue(), el.alpha()));
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
                this.colors.push(new RGB(r % 256, g % 256, b % 256, 255));
            }
        }
        this.listeners.registerCallBack("touchstart", e => true, e => this.handleClick(e));
    }
    calcColor(i = this.highLightedCell) {
        const color = new RGB(this.colors[i].red(), this.colors[i].green(), this.colors[i].blue(), this.colors[i].alpha());
        const scale = 1.6;
        if (this.keyboardHandler.keysHeld["ShiftLeft"] || this.keyboardHandler.keysHeld["ShiftRight"]) {
            color.setRed(Math.floor(color.red() * scale) < 256 ? Math.floor(color.red() * scale) : 255);
            color.setGreen(Math.floor(color.green() * scale) < 256 ? Math.floor(color.green() * scale) : 255);
            color.setBlue(Math.floor(color.blue() * scale) < 256 ? Math.floor(color.blue() * scale) : 255);
        }
        return color;
    }
    handleClick(event) {
        this.highLightedCell = Math.floor((event.touchPos[0] / this.canvas.width) * this.colors.length);
        this.textBoxColor.value = this.calcColor().htmlRBGA();
    }
    setSelectedColor(color) {
        this.colors[this.highLightedCell].loadString(color);
    }
    cloneColor(color) {
        const newc = new RGB(0, 0, 0, 0);
        newc.copy(color);
        return newc;
    }
    draw() {
        const ctx = this.ctx;
        for (let i = 0; i < this.colors.length; i++) {
            const width = (this.canvas.width / this.colors.length);
            const height = this.canvas.height;
            this.ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(i * width, 0, width, height);
            ctx.fillStyle = this.calcColor(i).htmlRBGA();
            ctx.fillRect(i * width, 0, width, height);
            ctx.strokeRect(i * width, 0, width, height);
            this.ctx.font = '16px Calibri';
            const visibleColor = (this.calcColor(i));
            ctx.strokeStyle = "#000000";
            this.ctx.strokeText((i + 1) % 10, i * width + width * 0.5, height / 3);
            visibleColor.setBlue(Math.floor(visibleColor.blue() / 2));
            visibleColor.setRed(Math.floor(visibleColor.red() / 2));
            visibleColor.setGreen(Math.floor(visibleColor.green() / 2));
            visibleColor.setAlpha(255);
            this.ctx.fillStyle = visibleColor.htmlRBGA();
            this.ctx.fillText((i + 1) % 10, i * width + width * 0.5, height / 3);
            if (i == this.highLightedCell) {
                this.ctx.strokeStyle = "#000000";
                for (let j = 0; j < height; j += 5)
                    ctx.strokeRect(i * width + j, j, width - j * 2, height - j * 2);
            }
        }
    }
}
;
class Sprite {
    constructor(pixels, width, height) {
        this.copy(pixels, width, height);
    }
    copy(pixels, width, height) {
        if (!this.pixels || this.pixels.length !== pixels.length) {
            this.pixels = new Uint8ClampedArray(width * height * 4);
            this.width = width;
            this.height = height;
        }
        for (let i = 0; i < pixels.length; i++) {
            this.pixels[(i << 2)] = pixels[i].red();
            this.pixels[(i << 2) + 1] = pixels[i].green();
            this.pixels[(i << 2) + 2] = pixels[i].blue();
            this.pixels[(i << 2) + 3] = pixels[i].alpha();
        }
        this.refreshImage();
    }
    copyToBuffer(buf) {
        for (let i = 0; i < buf.length; i++) {
            buf[i].setRed(this.pixels[(i << 2)]);
            buf[i].setGreen(this.pixels[(i << 2) + 1]);
            buf[i].setBlue(this.pixels[(i << 2) + 2]);
            buf[i].setAlpha(this.pixels[(i << 2) + 3]);
        }
    }
    refreshImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const idata = ctx.createImageData(this.width, this.height);
        idata.data.set(this.pixels);
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.putImageData(idata, 0, 0);
        this.image = new Image();
        this.image.src = canvas.toDataURL();
    }
    copySprite(sprite) {
        if (this.pixels.length !== sprite.pixels.length)
            this.pixels = new Uint8ClampedArray(sprite.pixels.length);
        this.width = sprite.width;
        this.height = sprite.height;
        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i] = sprite.pixels[i];
        }
        this.refreshImage();
    }
    draw(ctx, x, y, width, height) {
        if (this.pixels) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x, y, width, height);
            ctx.drawImage(this.image, x, y, width, height);
        }
    }
}
;
class SpriteAnimation {
    constructor(x, y, width, height) {
        this.sprites = new Array();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animationIndex = 0;
    }
    pushSprite(sprite) {
        this.sprites.push(sprite);
    }
    draw(ctx) {
        if (this.sprites.length) {
            ++this.animationIndex;
            this.sprites[this.animationIndex %= this.sprites.length].draw(ctx, this.x, this.y, this.width, this.height);
        }
        else {
            this.animationIndex = -1;
        }
    }
}
;
class SpriteSelector {
    constructor(canvas, drawingField, animationGroup, keyboardHandler, spritesPerRow, width, height) {
        this.canvas = canvas;
        //this.canvas.width = width * spritesPerRow;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 2;
        this.dragSprite = null;
        this.keyboardHandler = keyboardHandler;
        this.dragSpriteLocation = [-1, -1];
        this.drawingField = drawingField;
        this.animationGroup = animationGroup;
        this.spritesPerRow = spritesPerRow;
        this.spriteWidth = canvas.width / spritesPerRow;
        this.spriteHeight = this.spriteWidth;
        this.selectedSprite = 0;
        canvas.height = this.spriteWidth;
        const listener = new SingleTouchListener(canvas, true, true);
        this.listener = listener;
        this.spritesCount = this.sprites() ? this.sprites().length : 0;
        listener.registerCallBack("touchstart", e => true, e => {
            const clickedSprite = Math.floor(e.touchPos[0] / canvas.width * this.spritesPerRow) + spritesPerRow * Math.floor(e.touchPos[1] / this.spriteHeight);
        });
        listener.registerCallBack("touchmove", e => true, e => {
            const clickedSprite = Math.floor(e.touchPos[0] / canvas.width * this.spritesPerRow) + spritesPerRow * Math.floor(e.touchPos[1] / this.spriteHeight);
            if (e.moveCount == 1) {
                if (this.keyboardHandler.keysHeld["AltLeft"] || this.keyboardHandler.keysHeld["AltRight"]) {
                    const dragSprite = new Sprite([], 1, 1);
                    dragSprite.copySprite(this.sprites()[clickedSprite]);
                    this.dragSprite = dragSprite;
                }
                else
                    this.dragSprite = this.sprites().splice(clickedSprite, 1)[0];
                this.dragSpriteLocation[0] = e.touchPos[0];
                this.dragSpriteLocation[1] = e.touchPos[1];
            }
            else if (e.moveCount > 1) {
                this.dragSpriteLocation[0] += e.deltaX;
                this.dragSpriteLocation[1] += e.deltaY;
            }
        });
        listener.registerCallBack("touchend", e => true, e => {
            const clickedSprite = Math.floor(e.touchPos[0] / canvas.width * this.spritesPerRow) + spritesPerRow * Math.floor(e.touchPos[1] / this.spriteHeight);
            if (clickedSprite >= 0) {
                if (this.dragSprite !== null)
                    this.sprites().splice(clickedSprite, 0, this.dragSprite);
                this.spritesCount = this.sprites().length;
                this.dragSprite = null;
                this.dragSpriteLocation[0] = -1;
                this.dragSpriteLocation[1] = -1;
            }
            if (clickedSprite < this.sprites().length) {
                this.selectedSprite = clickedSprite;
                this.sprites()[clickedSprite].copyToBuffer(this.drawingField.screenBuffer);
            }
        });
    }
    update() {
        if ((1 + Math.floor(this.sprites().length / this.spritesPerRow) * this.spriteHeight) > this.canvas.height) {
            this.canvas.height = (1 + Math.floor(this.sprites().length / this.spritesPerRow)) * this.spriteHeight;
        }
        if (this.spritesCount !== this.sprites().length) {
            console.log(this.spritesCount, this.sprites().length);
            this.spritesCount = this.sprites() ? this.sprites().length : 0;
            this.selectedSprite = this.spritesCount - 1;
            this.loadSprite();
        }
    }
    draw() {
        if (this.sprites()) {
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            const touchX = Math.floor(this.listener.touchPos[0] / this.canvas.width * this.spritesPerRow);
            const touchY = Math.floor(this.listener.touchPos[1] / this.canvas.height * Math.floor(this.canvas.height / this.spriteHeight));
            let setOffForDragSprite = 0;
            for (let i = 0; i < this.sprites().length; i++) {
                if (this.dragSprite && i === touchX + touchY * this.spritesPerRow)
                    setOffForDragSprite++;
                const x = (setOffForDragSprite % this.spritesPerRow) * this.spriteWidth;
                const y = Math.floor(setOffForDragSprite / this.spritesPerRow) * this.spriteHeight;
                this.sprites()[i].draw(this.ctx, x, y, this.spriteHeight, this.spriteWidth);
                setOffForDragSprite++;
            }
            if (this.dragSprite) {
                this.dragSprite.draw(this.ctx, this.dragSpriteLocation[0] - this.spriteWidth * 0.5, this.dragSpriteLocation[1] - this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight);
                this.ctx.strokeRect(this.dragSpriteLocation[0] - this.spriteWidth * 0.5 + 2, this.dragSpriteLocation[1] - this.spriteHeight * 0.5 + 2, this.spriteWidth - 4, this.spriteHeight - 4);
            }
            else
                this.ctx.strokeRect(this.selectedSprite % this.spritesPerRow * this.spriteWidth + 2, Math.floor(this.selectedSprite / this.spritesPerRow) * this.spriteHeight + 2, this.spriteWidth - 4, this.spriteHeight - 4);
        }
    }
    deleteSelectedSprite() {
        this.sprites().splice(this.selectedSprite--, 1);
    }
    loadSprite() {
        if (this.selectedSpriteVal())
            this.selectedSpriteVal().copyToBuffer(this.drawingField.screenBuffer);
    }
    pushSelectedToCanvas() {
        const spriteWidth = this.drawingField.dimensions.first;
        const spriteHeight = this.drawingField.dimensions.second;
        if (this.selectedSpriteVal())
            this.selectedSpriteVal().copy(this.drawingField.screenBuffer, spriteWidth, spriteHeight);
    }
    selectedSpriteVal() {
        if (this.sprites())
            return this.sprites()[this.selectedSprite];
        return null;
    }
    sprites() {
        if (this.animationGroup.animations[this.animationGroup.selectedAnimation])
            return this.animationGroup.animations[this.animationGroup.selectedAnimation].sprites;
        return null;
    }
}
;
class AnimationGroup {
    constructor(drawingField, keyboardHandler, animiationsID, animiationsSpritesID, spritesPerRow = 10, spriteWidth = 64, spriteDrawHeight = 64) {
        this.drawingField = drawingField;
        this.animationDiv = document.getElementById(animiationsID);
        this.animationSpritesDiv = document.getElementById(animiationsSpritesID);
        this.animations = new Array();
        this.animationCanvases = new Array();
        this.spriteCanvases = new Array();
        this.selectedAnimation = 0;
        this.spriteSelector = new SpriteSelector(document.getElementById("sprites-canvas"), this.drawingField, this, keyboardHandler, spritesPerRow, spriteWidth, spriteDrawHeight);
    }
    pushAnimation(animation) {
        this.animations.push(animation);
        this.selectedAnimation = this.animations.length - 1;
        this.pushSpriteToAnimation(this.animations[this.selectedAnimation]);
        this.buildAnimationHTML();
    }
    pushSpriteToAnimation(animation) {
        const sprites = animation.sprites;
        this.spriteSelector.spritesCount = sprites.length;
        this.spriteSelector.selectedSprite = sprites.length - 1;
        sprites.push(new Sprite(this.drawingField.screenBuffer, this.drawingField.dimensions.first, this.drawingField.dimensions.second));
        this.spriteSelector.loadSprite();
    }
    pushSprite() {
        if (this.selectedAnimation >= this.animations.length) {
            this.pushAnimation(new SpriteAnimation(0, 0, this.spriteSelector.spriteWidth, this.spriteSelector.spriteHeight));
        }
        else {
            const sprites = this.animations[this.selectedAnimation].sprites;
            this.spriteSelector.selectedSprite = sprites.length - 1;
            sprites.push(new Sprite(this.drawingField.screenBuffer, this.drawingField.dimensions.first, this.drawingField.dimensions.second));
            this.spriteSelector.loadSprite();
        }
    }
    buildAnimationHTML() {
        this.animationCanvases.forEach(el => el.first.first.remove());
        this.animationCanvases.splice(0, this.animationCanvases.length); //deletes all elements from array
        this.animationDiv.innerHTML = '';
        let i = 0;
        this.animations.forEach(async (el) => {
            const canvas = document.createElement("canvas");
            canvas.id = "animation_canvas" + i;
            canvas.width = this.spriteSelector.spriteWidth;
            canvas.height = this.spriteSelector.spriteHeight;
            const listener = new SingleTouchListener(canvas, false, true);
            listener.registerCallBack("touchstart", e => true, e => {
                this.selectedAnimation = parseInt(canvas.id.substring(16, canvas.id.length));
            });
            this.animationCanvases.push(new Pair(new Pair(canvas, listener), canvas.getContext("2d")));
            this.animationDiv.appendChild(canvas);
            i++;
        });
    }
    draw() {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].draw(this.animationCanvases[i].second);
        }
        if (this.animations.length) {
            this.spriteSelector.update();
            this.spriteSelector.draw();
            this.animationCanvases[this.selectedAnimation].second.strokeStyle = "#000000";
            this.animationCanvases[this.selectedAnimation].second.lineWidth = 3;
            this.animationCanvases[this.selectedAnimation].second.strokeRect(1, 1, this.animationCanvases[this.selectedAnimation].first.first.width - 2, this.animationCanvases[this.selectedAnimation].first.first.height - 2);
        }
    }
}
;
async function fetchImage(url) {
    const img = new Image();
    img.src = URL.createObjectURL(await (await fetch(url)).blob());
    return img;
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
    const keyboardHandler = new KeyboardHandler();
    const field = new DrawingScreen(document.getElementById("screen"), keyboardHandler, [0, 0], dim, newColor);
    const pallette = new Pallette(document.getElementById("pallette_screen"), keyboardHandler, newColor);
    const setPalletteColorButton = document.getElementById("setPalletteColorButton");
    const palletteColorButtonListener = new SingleTouchListener(setPalletteColorButton, true, true);
    palletteColorButtonListener.registerCallBack("touchstart", e => true, e => {
        pallette.setSelectedColor(newColor.value);
        field.color = pallette.calcColor();
        newColor.blur();
    });
    pallette.canvas.addEventListener("mouseup", e => { field.color = pallette.calcColor(); });
    pallette.listeners.registerCallBack("touchend", e => true, e => { field.color = pallette.calcColor(); });
    const animations = new AnimationGroup(field, keyboardHandler, "animations", "sprites", 5, dim[0], dim[1]);
    const add_animationButton = document.getElementById("add_animation");
    const add_animationTouchListener = new SingleTouchListener(add_animationButton, false, true);
    add_animationTouchListener.registerCallBack("touchstart", e => true, e => {
        animations.pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
    });
    const add_spriteButton = document.getElementById("add_sprite");
    const add_spriteButtonTouchListener = new SingleTouchListener(add_spriteButton, false, true);
    add_spriteButtonTouchListener.registerCallBack("touchstart", e => true, e => {
        animations.pushSprite();
    });
    const save_spriteButton = document.getElementById("save_sprite");
    const save_spriteButtonTouchListener = new SingleTouchListener(save_spriteButton, false, true);
    save_spriteButtonTouchListener.registerCallBack("touchstart", e => true, e => {
        animations.spriteSelector.pushSelectedToCanvas();
    });
    const delete_spriteButton = document.getElementById("delete_sprite");
    const delete_spriteButtonTouchListener = new SingleTouchListener(delete_spriteButton, false, true);
    delete_spriteButtonTouchListener.registerCallBack("touchstart", e => true, e => {
        animations.spriteSelector.deleteSelectedSprite();
    });
    const save_serverButton = document.getElementById("save_server");
    if (save_serverButton)
        save_serverButton.addEventListener("mousedown", e => logToServer({ animation: animations.animations[animations.selectedAnimation] }));
    keyboardHandler.registerCallBack("keydown", e => true, e => {
        field.color.copy(pallette.calcColor());
        if ((document.getElementById('body') === document.activeElement || document.getElementById('screen') === document.activeElement) && e.code.substring(0, "Digit".length) === "Digit") {
            const numTyped = e.code.substring("Digit".length, e.code.length);
            pallette.highLightedCell = (parseInt(numTyped) + 9) % 10;
            newColor.value = pallette.calcColor().htmlRBGA();
        }
    });
    keyboardHandler.registerCallBack("keyup", e => true, e => {
        field.color.copy(pallette.calcColor());
    });
    const fps = 40;
    const goalSleep = 1000 / fps;
    let counter = 0;
    while (true) {
        const start = Date.now();
        field.draw();
        pallette.draw();
        if (counter++ % 2 == 0)
            animations.draw();
        const adjustment = Date.now() - start <= 30 ? Date.now() - start : 30;
        await sleep(goalSleep - adjustment);
        //console.log("Frame time: ",Date.now() - start, "avgfps:",1000/(Date.now() - start))
    }
}
main();
