function sleep(ms):Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

class Queue<T> {
    data:Array<T>;
    start:number;
    end:number;
    length:number;
    constructor(size)
    {
        this.data = [];
        this.data.length = size;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val):void
    {
        if(this.length == this.data.length)
        {
            const newData:Array<T> = [];
            newData.length = this.data.length * 2;
            for(let i = 0; i < this.data.length; i++)
            {
                newData[i] = this.data[(i+this.start)%this.data.length];
            }
            this.start = 0;
            this.end = this.data.length;
            this.data = newData;
            this.data[this.end++] = val;
            this.length++;
        }
        else
        {
            this.data[this.end++] = val; 
            this.end %= this.data.length;
            this.length++;
        }
    }
    pop():T
    {
        if(this.length)
        {
            const val = this.data[this.start];
            this.start++;
            this.start %= this.data.length;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index:number):T
    {
        if(index < this.length)
        {
            return this.data[(index+this.start)%this.data.length];
        }
		throw new Error(`Could not get value at index ${index}`);
    }
    set(index:number, obj:T):void
    {
        if(index < this.length)
        {
            this.data[(index+this.start)%this.data.length] = obj;
        }
		throw new Error(`Could not set value at index ${index}`);
    }
};
class RGB {
    red:number;
    green:number;
    blue:number;
    constructor(r, g, b)
    {
        this.red = r;
        this.green = g;
        this.blue  = b;
    }
    toInt()
    {
        return 255<<24 | this.red<<16 | this.green<<8 | this.blue;
    }
    loadString(color:string)
    {
        const r:number = parseInt(color.substring(1,3), 16);
        const g:number = parseInt(color.substring(3,5), 16);
        const b:number = parseInt(color.substring(5,7), 16);
        if(!isNaN(r) && r <= 255 && r >= 0)
        {
            this.red = r;
        }
        if(!isNaN(g) && g <= 255 && g >= 0)
        {
            this.green = g;
        }
        if(!isNaN(b) && b <= 255 && b >= 0)
        {
            this.blue = b;
        }
    }
    htmlRBG():string{
        const red:string = this.red < 16?`0${this.red.toString(16)}`:this.red.toString(16);
        const green:string = this.green < 16?`0${this.green.toString(16)}`:this.green.toString(16);
        const blue:string = this.blue < 16?`0${this.blue.toString(16)}`:this.blue.toString(16);
        return `#${red}${green}${blue}`
    }
};
class Pair<T> {
    first:T;
    second:T;
    constructor(first, second)
    {
        this.first = first;
        this.second = second;
    }

};
class DrawingScreen {
    offset:Pair<number>;
    bounds:Pair<number>;
    dimensions:Pair<number>;
    canvas:any;
    screenBuffer:Array<RGB>;
    color:RGB;
    listeners:SingleTouchListener;
    controlHeld:boolean;
    selectionRect:Array<number>;
    updatesStack:Array<Array<number>>;

    constructor(canvas:any, offset:Array<number>, dimensions:Array<number>, bounds:Array<number> = [canvas.width-offset[0], canvas.height-offset[1]])
    {
        this.canvas = canvas;
        this.updatesStack = new Array<Array<number>>();
        this.offset = new Pair<number>(offset[0], offset[1]);
        this.bounds = new Pair<number>(bounds[0], bounds[1]);
        this.dimensions = new Pair<number>(dimensions[0], dimensions[1]);
        this.screenBuffer = new Array<RGB>();
        this.selectionRect = new Array();
        this.color = new RGB(150,34,160);
        //this.screenBuffer.length = dimensions[0] * dimensions[1];
        for(let i = 0; i < dimensions[0] * dimensions[1]; i++)
        {
            this.screenBuffer.push(new RGB(0,0,0));
        }
        this.listeners = new SingleTouchListener(canvas, true, true);
        this.listeners.registerCallBack("touchend",e => true, e => this.handleTap(e));
        this.listeners.registerCallBack("touchmove",e => true, e => this.handleDraw(e));
        
    }
    handleTap(event):void
    {
        const gx:number = Math.floor((event.touchPos[0]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const gy:number = Math.floor((event.touchPos[1]-this.offset.second)/this.bounds.second*this.dimensions.second);

        if(event.timeDelayFromStartToEnd < 300 )
        {
            this.fillArea(new Pair<number>(gx, gy));
        }
        else if(gx < this.dimensions.first && gy < this.dimensions.second){
            this.screenBuffer[gx + gy*this.dimensions.first] = new RGB(this.color.red, this.color.green, this.color.blue);
        }
    }
    hashP(x:number, y:number):number
    {
        return x + y*this.dimensions.first;
    }
    compColor(c1:RGB, c2:RGB)
    {
        return c1.red === c2.red && c1.green === c2.green && c1.blue === c2.blue;
    }

    fillArea(startCoordinate:Pair<number>):void
    {
        const queue:Queue<number> = new Queue<number>(1024);
        let checkedMap:any = {};
        checkedMap = {};
        const startIndex:number = startCoordinate.first + startCoordinate.second*this.dimensions.first;
        const startPixel:RGB = this.screenBuffer[startIndex];
        const spc:RGB = new RGB(startPixel.red, startPixel.green, startPixel.blue);
        queue.push(startIndex);
        while(queue.length > 0)
        {
            const cur:number = queue.pop();
            const pixelColor:RGB = this.screenBuffer[cur];
            if(
                cur >= 0 && cur < this.dimensions.first * this.dimensions.second && 
                (//this.compColor(pixelColor, this.color) || 
                this.compColor(pixelColor, spc))
            && !checkedMap[cur])
            {
                checkedMap[cur] = true;
                pixelColor.red = this.color.red;
                pixelColor.green = this.color.green;
                pixelColor.blue = this.color.blue;
                //if(!checkedMap[cur+1])
                    queue.push(cur+1);
                //if(!checkedMap[cur-1])
                    queue.push(cur-1);
                //if(!checkedMap[cur + this.dimensions.first])
                    queue.push(cur + this.dimensions.first);
                //if(!checkedMap[cur - this.dimensions.first])
                    queue.push(cur - this.dimensions.first);
            }
        }
    }
    highlightSelection(event)
    {

    }
    handleDraw(event):void
    {
        //draw line from current touch pos to the touchpos minus the deltas
        //calc equation for line
        const x1:number = event.touchPos[0] - event.deltaX;
        const y1:number = event.touchPos[1] - event.deltaY;
        const m:number = event.deltaY/event.deltaX;
        const b:number = event.touchPos[1]-m*event.touchPos[0];
        if(Math.abs(event.deltaX) > Math.abs(event.deltaY))
        {
            const min:number = Math.min(x1, event.touchPos[0]);
            const max:number = Math.max(x1, event.touchPos[0]);
            for(let x = min; x < max; x+=0.2)
            {
                const y:number = m*x + b;
                const gx:number = Math.floor((x-this.offset.first)/this.bounds.first*this.dimensions.first);
                const gy:number = Math.floor((y-this.offset.second)/this.bounds.second*this.dimensions.second);
                if(gx < this.dimensions.first && gy < this.dimensions.second){
                    this.screenBuffer[gx + gy*this.dimensions.first] = new RGB(this.color.red, this.color.green, this.color.blue);
                }
            }
        }
        else
        {
            const min:number = Math.min(y1, event.touchPos[1]);
            const max:number = Math.max(y1, event.touchPos[1]);
            for(let y = min; y < max; y+=0.2)
            {
                const x:number = Math.abs(event.deltaX)>0?(y - b)/m:event.touchPos[0];
                const gx:number = Math.floor((x-this.offset.first)/this.bounds.first*this.dimensions.first);
                const gy:number = Math.floor((y-this.offset.second)/this.bounds.second*this.dimensions.second);
                if(gx < this.dimensions.first && gy < this.dimensions.second){
                    this.screenBuffer[gx + gy*this.dimensions.first] = new RGB(this.color.red, this.color.green, this.color.blue);
                }
            }
        }
    }
    setDim(newDim:Array<number>)
    {
        if(newDim.length === 2)
        {
            this.dimensions = new Pair(newDim[0], newDim[1]);
            if(this.screenBuffer.length < newDim[0]*newDim[1])
            {
                for(let i = this.screenBuffer.length; i < newDim[0]*newDim[1]; i++)
                    this.screenBuffer.push(new RGB(0,0,0));
            }
        }
    }
    draw():void
    {
        const ctx:any = this.canvas.getContext("2d");
        const image = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const imageData = image.data;
        for(let y = 0; y < this.dimensions.second; y++)
        {
            for(let x = 0; x < this.dimensions.first; x++)
            {
                const cellHeight:number = this.bounds.second / this.dimensions.second;
                const cellWidth:number = this.bounds.first / this.dimensions.first;
                const sy:number = this.offset.second + y * cellHeight;
                const sx:number = this.offset.first + x * cellWidth;
                ctx.fillStyle = this.screenBuffer[x + y*this.dimensions.first].htmlRBG();
                ctx.fillRect(sx, sy, cellWidth, cellHeight);
                
            }
        }
    }

};
class TouchHandler {
    pred:any; 
    callBack:any;
    constructor(pred:any, callBack:any)
    {
        this.pred = pred;
        this.callBack = callBack;
    }
};
class ListenerTypes {
    touchstart:Array<TouchHandler>;
    touchmove:Array<TouchHandler>;
    touchend:Array<TouchHandler>;
    constructor()
    {
        this.touchstart = new Array<TouchHandler>();
        this.touchmove = new Array<TouchHandler>();
        this.touchend = new Array<TouchHandler>();
    }
}
class SingleTouchListener
{
    lastTouchTime:number;
    preventDefault:any;
    touchStart:any;
    registeredTouch:boolean;
    touchPos:Array<number>;
    offset:Array<number>;
    touchVelocity:number;
    touchMoveCount:number;
    deltaTouchPos:number;
    listenerTypeMap:ListenerTypes;
    constructor(component:any, preventDefault:boolean, mouseEmulation:boolean)
    {
        this.lastTouchTime = Date.now();
        this.offset = []
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.registeredTouch = false;
        this.touchPos = [0,0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.listenerTypeMap = {
            touchstart:[],
            touchmove:[],
            touchend:[]
        };
        component.addEventListener('touchstart', event => {this.touchStartHandler(event);}, false);
        component.addEventListener('touchmove', event => this.touchMoveHandler(event), false);
        component.addEventListener('touchend', event => this.touchEndHandler(event), false);
        if(mouseEmulation){
            component.addEventListener('mousedown', event => {event.changedTouches = {};event.changedTouches.item = x => event; this.touchStartHandler(event)});
            component.addEventListener('mousemove', event => {event.changedTouches = {};event.changedTouches.item = x => event; this.touchMoveHandler(event)});
            component.addEventListener('mouseup', event => {event.changedTouches = {};event.changedTouches.item = x => event; this.touchEndHandler(event)});
    
        }
    }
    registerCallBack(listenerType:string, predicate, callBack):void
    {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event):void
    {
        const handlers = this.listenerTypeMap[type];
        let found = false;
        handlers.forEach(handler => {
            if(!found && handler.pred(event))
            {
                found = true;
                handler.callBack(event);
            }
        });
    }
    touchStartHandler(event:any):void
    {
        this.registeredTouch = true;
        event.timeSinceLastTouch = Date.now() - (this.lastTouchTime?this.lastTouchTime:0);
        this.lastTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"],this.touchStart["offsetY"]];
        if(!this.touchPos[0]){
            this.touchPos = [this.touchStart["clientX"], this.touchStart["clientY"]];
        }
        event.touchPos = this.touchPos;

        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.callHandler("touchstart", event);

        if(this.preventDefault)
            event.preventDefault();
    }
    touchMoveHandler(event:any):boolean
    {
       if(!this.registeredTouch)
            return false;
        let touchMove = event.changedTouches.item(0);
        for(let i = 0; i < event.changedTouches["length"]; i++)
        {
            if(event.changedTouches.item(i).identifier == this.touchStart.identifier){
                touchMove = event.changedTouches.item(i);
            }
        }  
        
        if(touchMove)
        {
            if(!touchMove["offsetY"]){
                touchMove.offsetX = touchMove["clientX"];
                touchMove.offsetY = touchMove["clientY"];
            }
            const deltaY:number = touchMove["offsetY"]-this.touchPos[1];
            const deltaX:number = touchMove["offsetX"]-this.touchPos[0];
            this.touchPos[1] += deltaY;
            this.touchPos[0] += deltaX;
            const mag:number = this.mag([deltaX, deltaY]);
            this.touchMoveCount++;
            this.deltaTouchPos += Math.abs(mag);
            this.touchVelocity = 100*this.deltaTouchPos/(Date.now() - this.lastTouchTime); 
            const a:Array<number> = this.normalize([deltaX, deltaY]);
            const b:Array<number> = [1,0];
            const dotProduct:number = this.dotProduct(a, b);
            const angle:number = Math.acos(dotProduct)*(180/Math.PI)*(deltaY<0?1:-1);
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
    touchEndHandler(event):void
    {
        if(this.registeredTouch)
        {
            let touchEnd = event.changedTouches.item(0);
            for(let i = 0; i < event.changedTouches["length"]; i++)
            {
                if(event.changedTouches.item(i).identifier == this.touchStart.identifier){
                    touchEnd = event.changedTouches.item(i);
                }
            } 
            if(touchEnd)
            {
                if(!touchEnd["offsetY"]){
                    touchEnd.offsetX = touchEnd["clientX"];
                    touchEnd.offsetY = touchEnd["clientY"];
                }
                const deltaY:number = touchEnd["offsetY"]-this.touchStart["offsetY"];

                const deltaX:number = touchEnd["offsetX"]-this.touchStart["offsetX"];
                this.touchPos = [touchEnd["offsetX"], touchEnd["offsetY"]];
                const mag:number = this.mag([deltaX, deltaY]);
                const a:Array<number> = this.normalize([deltaX, deltaY]);
                const b:Array<number> = [1,0];
                const dotProduct:number = this.dotProduct(a, b);
                const angle:number = Math.acos(dotProduct)*(180/Math.PI)*(deltaY<0?1:-1);
                const delay:number = Date.now()-this.lastTouchTime;// from start tap to finish
                this.touchVelocity = 100*mag/(Date.now()-this.lastTouchTime)

                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.lastTouchTime;
                event.eventTime = Date.now();
                this.callHandler("touchend", event);
            }

            this.registeredTouch = false;
        }
    }
    mag(a):number
    {
        return Math.sqrt(a[0]*a[0]+a[1]*a[1]);
    }
    normalize(a):Array<number>
    {
        const magA = this.mag(a);
        a[0] /= magA;
        a[1] /= magA;
        return a;
    }
    dotProduct(a, b):number
    {
        return a[0]*b[0]+a[1]*b[1];
    }
};
class Pallette {
    highLightedCell:number;
    colors:Array<RGB>;
    canvas:any;
    listeners:SingleTouchListener;
    shiftDown:boolean;
    textBoxColor:any;
    ctx:any;

    constructor(canvas:any, textBoxColor:any, colorCount:number = 10, colors:Array<RGB> = null)
    {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.highLightedCell = 0;
        this.shiftDown = false;
        this.textBoxColor = textBoxColor;
        this.listeners = new SingleTouchListener(canvas, true, true);
        this.colors = new Array<RGB>();
        const width = canvas.width / colorCount;
        const height = canvas.height;
        for(let i = 0; i < colorCount; i++)
        {
            const left = i / colorCount;
            const right = (i + 1) / colorCount;
            const top = 0;
            const bottom = 1;
            const depth = 0;
            //pushRect(this.triangleBufferData, i / colorCount * canvas.width, 0, width, height);
        }
        if(colors !== null)
        {
            colors.forEach(el => {
                this.colors.push(new RGB(el.red, el.green, el.blue));
            });

        }
        else
        {
            let r:number = 25;
            let g:number = 50;
            let b:number = 30;
            const delta = 85;
            
            for(let i = 0; i < colorCount; i++)
            {
                r += ((i % 3 == 0) ? delta : 0);
                r += ((i % 5 == 2) ? delta : 0);
                g += ((i % 3 == 1) ? delta : 0);
                b += ((i % 2 == 1) ? delta : 0);
                b += ((i % 3 == 2) ? delta : 0);
                this.colors.push(new RGB(r%256, g%256, b%256));
            }
        }
        this.listeners.registerCallBack("touchstart", e => true, e => this.handleClick(e));
        
    }
    calcColor(i:number = this.highLightedCell):RGB
    {
        const color = new RGB(this.colors[i].red, this.colors[i].green, this.colors[i].blue);
        const scale = 1.6;
        if(this.shiftDown)
        {
            color.red = Math.floor(color.red*scale) < 256 ? Math.floor(color.red*scale) : 255;
            color.green = Math.floor(color.green*scale) < 256 ? Math.floor(color.green*scale) : 255;
            color.blue = Math.floor(color.blue*scale) < 256 ? Math.floor(color.blue*scale) : 255;
        }
        return color;
    }
    handleClick(event):void
    {
        this.highLightedCell = Math.floor((event.touchPos[0] / this.canvas.width) * this.colors.length);
        this.textBoxColor.value = this.calcColor().htmlRBG();
    }
    setSelectedColor(color:string)
    {
        if(color.length === 7)
        {
            this.colors[this.highLightedCell].loadString(color);
        }
    }
    invertColor(color:RGB):RGB
    {
        const newc = new RGB(0,0,0);
        newc.red = 255 - color.blue;
        newc.green = 255 - color.red;
        newc.blue = 255 - color.green;
        return newc;
    }
    draw():void
    {
        const ctx = this.ctx;
        for(let i = 0; i < this.colors.length; i++)
        {
            const width:number = (this.canvas.width/this.colors.length);
            const height:number = this.canvas.height;
            this.ctx.strokeStyle = "#000000";
            ctx.fillStyle = this.calcColor(i).htmlRBG();
            ctx.fillRect(i * width, 0, width, height);
            ctx.strokeRect(i * width, 0, width, height);
            this.ctx.font = '16px Calibri';
            const visibleColor:RGB = this.invertColor(this.calcColor(i));

            ctx.strokeStyle = visibleColor.htmlRBG();

            this.ctx.strokeText((i+1)%10,i*width+width*0.5, height/3);

            visibleColor.blue = Math.floor(visibleColor.blue/2);
            visibleColor.red = Math.floor(visibleColor.red/2);
            visibleColor.green = Math.floor(visibleColor.green/2);
            this.ctx.fillStyle = visibleColor.htmlRBG();
            this.ctx.fillText((i+1)%10, i*width+width*0.5, height/3);
       
            if(i == this.highLightedCell)
            {
                this.ctx.strokeStyle = "#000000";
                for(let j = 0; j < height; j += 5)
                    ctx.strokeRect(i * width + j, j, width - j*2, height - j*2);
            }
        }
    }
};
class GLHelper {
    glctx:any;
    triangleBufferData:Array<number>;
    glBufferBuffer:ArrayBuffer;
    glBuffer:Float32Array;
    constructor(canvas:any)
    {
        this.glctx = canvas.getContext("webgl");  
        // Only continue if WebGL is available and working
        if (this.glctx === null) 
        {
            const errorText:string = "Unable to initialize WebGL. Your browser or machine may not support it.";
            alert(errorText);
            throw Error(errorText);
        }
        // Set clear color to black, fully opaque
        this.glctx.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.glctx.clear(this.glctx.COLOR_BUFFER_BIT);
    }
    genGLBuffer()
    {
        if(!this.glBuffer && this.triangleBufferData.length * 4 != this.glBufferBuffer.byteLength)
        {
            this.glBufferBuffer = new ArrayBuffer(this.triangleBufferData.length * 4);
            this.glBuffer = new Float32Array(this.glBufferBuffer);
        }
        let i = 0;
        this.triangleBufferData.forEach(element => {
            this.glBuffer[i++] = element;
        });

    }
    pushRect(x, y, width, height)
    {
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
function logToServer(data):void
{
    fetch("/data", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then(res => {console.log("Request complete! response:", data);});

}
async function main()
{
    const newColor:any = document.getElementById("newColor");
    const field:DrawingScreen = new DrawingScreen(document.getElementById("screen"),[0,0], [64,64]);
    field.setDim([228,228]);
    const pallette:Pallette = new Pallette(document.getElementById("pallette_screen"), newColor);
    const setPalletteColorButton = document.getElementById("setPalletteColorButton");
    const palletteColorButtonListener:SingleTouchListener = new SingleTouchListener(setPalletteColorButton, true, true);
    palletteColorButtonListener.registerCallBack("touchstart", e => true, e => {pallette.setSelectedColor(newColor.value);field.color = pallette.calcColor();});
    pallette.canvas.addEventListener("mouseup", e => { field.color = pallette.calcColor() });
    pallette.listeners.registerCallBack("touchend", e => true,  e => { field.color = pallette.calcColor(); })
    document.addEventListener("keydown", e => { 
        switch(e.keyCode){
            case(16/*shift*/):
            pallette.shiftDown = true; 
            break;
        } 
        if(document.activeElement === document.getElementById("body"))
        switch(e.code)
        {
            case('Digit1'):
            pallette.highLightedCell = 0;
            field.color = pallette.calcColor();
            break;
            case('Digit2'):
            pallette.highLightedCell = 1;
            field.color = pallette.calcColor();
            break;
            case('Digit3'):
            pallette.highLightedCell = 2;
            field.color = pallette.calcColor();
            break;
            case('Digit4'):
            pallette.highLightedCell = 3;
            field.color = pallette.calcColor();
            break;
            case('Digit5'):
            pallette.highLightedCell = 4;
            field.color = pallette.calcColor();
            break;
            case('Digit6'):
            pallette.highLightedCell = 5;
            field.color = pallette.calcColor();
            break;
            case('Digit7'):
            pallette.highLightedCell = 6;
            field.color = pallette.calcColor();
            break;
            case('Digit8'):
            pallette.highLightedCell = 7;
            field.color = pallette.calcColor();
            break;
            case('Digit9'):
            pallette.highLightedCell = 8;
            field.color = pallette.calcColor();
            break;
            case('Digit0'):
            pallette.highLightedCell = 9;
            field.color = pallette.calcColor();
            break;
            case('ControlLeft'):
            field.controlHeld = true;
            break;
        }
        field.color = pallette.calcColor(); 
    });
    document.addEventListener("keyup", e => { 
        if(e.keyCode == 16/*shift*/) 
            pallette.shiftDown = false; 
            switch(e.code){
            case('ControlLeft'):
            field.controlHeld = false;
            break;
            }
            field.color = pallette.calcColor(); });
   
    const fps = 15;
    const goalSleep = 1000/fps;
    while(true)
    {
        const start:number = Date.now();
        field.draw();
        pallette.draw();
        const adjustment:number = Date.now() - start <= 30 ? Date.now() - start : 30;
        await sleep(goalSleep - adjustment);
    }
}
main();