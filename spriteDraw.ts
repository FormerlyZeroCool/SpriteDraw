function sleep(ms):Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}
const dim = [128,128];
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
    color:number;
    constructor(r:number = 0, g:number = 0, b:number, a:number = 0)
    {
        this.color = 0;
        this.color = r << 24 | g << 16 | b << 8 | a;
    }
    compare(color:RGB):boolean
    {
        return this.color === color.color;
    }
    copy(color:RGB):void
    {
        this.color = color.color;
    }
    toInt():number
    {
        return this.color;
    }
    toRGBA():Array<number>
    {
        return [this.red(), this.green(), this.blue(), this.alpha()]
    }
    red():number
    {
        return (this.color >> 24) & ((1<<8)-1);
    }
    green():number
    {
        return (this.color >> 16) & ((1 << 8) - 1);
    }
    blue():number
    {
        return (this.color >> 8) & ((1 << 8) - 1);
    }
    alpha():number
    {
        return (this.color) & ((1 << 8) - 1);
    }
    alphaNormal():number
    {
        return Math.round(((this.color & ((1 << 8) - 1)) / 255)*100)/100;
    }
    setRed(red:number)
    {
        this.color &= (1<<24)-1;
        this.color |= red << 24;
    }
    setGreen(green:number)
    {
        this.color &= ((1 << 16) - 1) | (((1<<8)-1) << 24);
        this.color |= green << 16;
    }
    setBlue(blue:number)
    {
        this.color &= ((1<<8)-1) | (((1<<16)-1) << 16);
        this.color |= blue << 8;
    }
    setAlpha(alpha:number)
    {
        this.color &=  (((1<<24)-1) << 8);
        this.color |= alpha;
    }
    loadString(color:string)
    { 
        let r:number 
        let g:number 
        let b:number 
        let a:number 
        if(color.substring(0,4).toLowerCase() !== "rgba"){
            r = parseInt(color.substring(1,3), 16);
            g = parseInt(color.substring(3,5), 16);
            b = parseInt(color.substring(5,7), 16);
            a = parseFloat(color.substring(7,9))*255;
        }
        else
        {
            const vals = color.split(",");
            vals[0] = vals[0].substring(5);
            vals[3] = vals[3].substring(0, vals[3].length -1);
            r = parseInt(vals[0], 10);
            g = parseInt(vals[1], 10);
            b = parseInt(vals[2], 10);
            a = parseFloat(vals[3])*255;
        }
        if(!isNaN(r) && r <= 255 && r >= 0)
        {
            this.setRed(r);
        }
        if(!isNaN(g) && g <= 255 && g >= 0)
        {
            this.setGreen(g);
        }
        if(!isNaN(b) && b <= 255 && b >= 0)
        {
            this.setBlue(b);
        }
        if(!isNaN(a) && a <= 255 && a >= 0)
        {
            this.setAlpha(a);
        }
    }
    htmlRBGA():string{
        return `rgba(${this.red()}, ${this.green()}, ${this.blue()}, ${this.alphaNormal()})`
    }
    htmlRBG():string{
        const red:string = this.red() < 16?`0${this.red().toString(16)}`:this.red().toString(16);
        const green:string = this.green() < 16?`0${this.green().toString(16)}`:this.green().toString(16);
        const blue:string = this.blue() < 16?`0${this.blue().toString(16)}`:this.blue().toString(16);
        return `#${red}${green}${blue}`
    }
};

class Pair<T,U = T> {
    first:T;
    second:U;
    constructor(first:T, second:U)
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
    keyboardHandler:KeyboardHandler;
    selectionRect:Array<number>;
    pasteRect:Array<number>;
    updatesStack:Array<Array<Pair<number,RGB>>>;
    undoneUpdatesStack:Array<Array<Pair<number,RGB>>>;


    constructor(canvas:any, keyboardHandler:KeyboardHandler, offset:Array<number>, dimensions:Array<number>, bounds:Array<number> = [canvas.width-offset[0], canvas.height-offset[1]])
    {
        this.canvas = canvas;
        this.keyboardHandler = keyboardHandler;
        this.updatesStack = new Array<Array<Pair<number,RGB>>>();
        this.undoneUpdatesStack = new Array<Array<Pair<number,RGB>>>();
        this.selectionRect = new Array<number>();
        this.offset = new Pair<number>(offset[0], offset[1]);
        this.bounds = new Pair<number>(bounds[0], bounds[1]);
        this.dimensions = new Pair<number>(dimensions[0], dimensions[1]);
        this.screenBuffer = new Array<RGB>();
        this.selectionRect = [0,0,0,0];
        this.pasteRect = [0,0,0,0];
        this.color = new RGB(150,34,160,255);
        for(let i = 0; i < dimensions[0] * dimensions[1]; i++)
        {
            this.screenBuffer.push(new RGB(0,0,0,0));
        }
        this.listeners = new SingleTouchListener(canvas, true, true);
        this.listeners.registerCallBack("touchstart", e => true, e => {
            //save for undo
            if(this.updatesStack.length == 0 || this.updatesStack[this.updatesStack.length - 1].length)
                this.updatesStack.push(new Array<Pair<number,RGB>>());
            this.canvas.focus();
            if(this.keyboardHandler.keysHeld['KeyC'])
                this.selectionRect = [e.touchPos[0], e.touchPos[1],0,0];
            else if(this.keyboardHandler.keysHeld['AltLeft'] || this.keyboardHandler.keysHeld['AltRight']){
                this.pasteRect = [e.touchPos[0], e.touchPos[1],0,0];
                this.pasteRect[2] = this.selectionRect[2];
                this.pasteRect[3] = this.selectionRect[3];
            }
        });
        this.keyboardHandler.registerCallBack("keydown", e => true, event => {
            switch(event.code) {
                case('KeyC'):
                if(this.keyboardHandler.keysHeld["KeyC"] === 1) {
                    this.selectionRect = [0,0,0,0];
                    this.pasteRect = [0,0,0,0];
                }
                break;
                case('KeyV'):
                this.copy();
                break;
                case('KeyU'):
                this.undoLast();
                break;
                case('KeyR'):
                this.redoLast();
                break;
            }
        })
        this.listeners.registerCallBack("touchend",e => true, e => this.handleTap(e));
        this.listeners.registerCallBack("touchmove",e => true, e => {
            if(this.keyboardHandler.keysHeld['KeyC'])
            {
                this.selectionRect[2] += e.deltaX;
                this.selectionRect[3] += e.deltaY;
                this.pasteRect[2] = this.selectionRect[2];
                this.pasteRect[3] = this.selectionRect[3];
            }
            else if(this.keyboardHandler.keysHeld['AltLeft'] || this.keyboardHandler.keysHeld['AltRight'])
            {
                this.pasteRect[0] += e.deltaX;
                this.pasteRect[1] += e.deltaY;
                this.pasteRect[2] = this.selectionRect[2];
                this.pasteRect[3] = this.selectionRect[3];
            }
            else
                this.handleDraw(e);
        });
        
    }
    copy()
    {
        const source_x:number = Math.floor((this.selectionRect[0]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const source_y:number = Math.floor((this.selectionRect[1]-this.offset.second)/this.bounds.second*this.dimensions.second);
        const dest_x:number = Math.floor((this.pasteRect[0]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const dest_y:number = Math.floor((this.pasteRect[1]-this.offset.second)/this.bounds.second*this.dimensions.second);
        const width:number = Math.floor((this.selectionRect[2]-this.offset.first)/this.bounds.first*this.dimensions.first);
        const height:number = Math.floor((this.selectionRect[3]-this.offset.second)/this.bounds.second*this.dimensions.second);
        const area:number = width * height;
        for(let i = 0; i < area; i++)
        {
            const copyAreaX:number = i%width;
            const copyAreaY:number = Math.floor(i/width);
            const destIndex:number = dest_x + dest_y*this.dimensions.first + copyAreaX + copyAreaY*this.dimensions.first;
            const sourceIndex:number = source_x + source_y*this.dimensions.first + copyAreaX + copyAreaY*this.dimensions.first;
            const dest:RGB = this.screenBuffer[destIndex];
            const source:RGB = this.screenBuffer[sourceIndex];
            if(this.inBufferBounds(dest_x + copyAreaX, dest_y + copyAreaY) && this.inBufferBounds(source_x + copyAreaX, source_y + copyAreaY) && !dest.compare(source))
            {
                this.updatesStack[this.updatesStack.length-1].push(new Pair(destIndex, new RGB(dest.red(),dest.green(),dest.blue(), dest.alpha()))); 
                dest.copy(source);
            }
        }
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
            const pixel:RGB = this.screenBuffer[gx + gy*this.dimensions.first];
            if(!pixel.compare(this.color))
                this.updatesStack[this.updatesStack.length-1].push(new Pair(gx + gy*this.dimensions.first, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha())));        
            pixel.copy(this.color);
        }
    }

    fillArea(startCoordinate:Pair<number>):void
    {
        const queue:Queue<number> = new Queue<number>(1024);
        let checkedMap:any = {};
        checkedMap = {};
        const startIndex:number = startCoordinate.first + startCoordinate.second*this.dimensions.first;
        const startPixel:RGB = this.screenBuffer[startIndex];
        const spc:RGB = new RGB(startPixel.red(), startPixel.green(), startPixel.blue(), startPixel.alpha());
        queue.push(startIndex);
        while(queue.length > 0)
        {
            const cur:number = queue.pop();
            const pixelColor:RGB = this.screenBuffer[cur];
            if(cur >= 0 && cur < this.dimensions.first * this.dimensions.second && 
                pixelColor.compare(spc) && !checkedMap[cur])
            {
                checkedMap[cur] = true;
                if(!pixelColor.compare(this.color)){
                    this.updatesStack[this.updatesStack.length-1].push(new Pair(cur, new RGB(pixelColor.red(), pixelColor.green(), pixelColor.blue(), pixelColor.alpha())));
                    pixelColor.copy(this.color);
                }
                if(!checkedMap[cur+1])
                    queue.push(cur+1);
                if(!checkedMap[cur-1])
                    queue.push(cur-1);
                if(!checkedMap[cur + this.dimensions.first])
                    queue.push(cur + this.dimensions.first);
                if(!checkedMap[cur - this.dimensions.first])
                    queue.push(cur - this.dimensions.first);
            }
        }
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
                    const pixel:RGB = this.screenBuffer[gx + gy*this.dimensions.first];
                    if(pixel && !pixel.compare(this.color))
                        this.updatesStack[this.updatesStack.length-1].push(new Pair(gx + gy*this.dimensions.first, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                    pixel.copy(this.color);
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
                    const pixel:RGB = this.screenBuffer[gx + gy*this.dimensions.first];
                    if(!pixel.compare(this.color))
                        this.updatesStack[this.updatesStack.length-1].push(new Pair(gx + gy*this.dimensions.first, new RGB(pixel.red(),pixel.green(),pixel.blue(), pixel.alpha()))); 
                    pixel.copy(this.color);
                }
            }
        }
    }
    undoLast()
    {
        if(this.updatesStack.length)
        {
            const data = this.updatesStack.pop();
            const backedUpFrame = new Array<Pair<number, RGB>>();
            this.undoneUpdatesStack.push(backedUpFrame);
            data.forEach(el => {
                    backedUpFrame.push(el);
                    const color:RGB = new RGB(0,0,0,0);
                    color.copy(this.screenBuffer[el.first]);
                    this.screenBuffer[el.first].copy(el.second);
                    el.second.copy(color);
                });
        }
        else{
            console.log("Error, nothing to undo");
        }
            
    }
    redoLast()
    {
        if(this.undoneUpdatesStack.length)
        {
            const data = this.undoneUpdatesStack.pop();
            const backedUpFrame = new Array<Pair<number, RGB>>();
            this.updatesStack.push(backedUpFrame);
            data.forEach(el => {
                    backedUpFrame.push(el);
                    const color:RGB = new RGB(0,0,0,0);
                    color.copy(this.screenBuffer[el.first]);
                    this.screenBuffer[el.first].copy(el.second);
                    el.second.copy(color);
                });
        }
        else{
            console.log("Error, nothing to redo");
        }
    }
    hashP(x:number, y:number):number
    {
        return x + y*this.dimensions.first;
    }
    inBufferBounds(x:number, y:number)
    {
        return x >= 0 && x < this.dimensions.first && y >= 0 && y < this.dimensions.second;
    }
    setDim(newDim:Array<number>)
    {
        if(newDim.length === 2)
        {
            this.dimensions = new Pair(newDim[0], newDim[1]);
            if(this.screenBuffer.length < newDim[0]*newDim[1])
            {
                for(let i = this.screenBuffer.length; i < newDim[0]*newDim[1]; i++)
                    this.screenBuffer.push(new RGB(0,0,0,0));
            }
        }
    }
    draw():void
    {
        const ctx:any = this.canvas.getContext("2d");
        const image = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const imageData = image.data;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        for(let y = 0; y < this.dimensions.second; y++)
        {
            for(let x = 0; x < this.dimensions.first; x++)
            {
                const cellHeight:number = this.bounds.second / this.dimensions.second;
                const cellWidth:number = this.bounds.first / this.dimensions.first;
                const sy:number = this.offset.second + y * cellHeight;
                const sx:number = this.offset.first + x * cellWidth;
                ctx.fillStyle = this.screenBuffer[x + y*this.dimensions.first].htmlRBGA();
                ctx.fillRect(sx, sy, cellWidth+1, cellHeight+1);
                
            }
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeRect(this.selectionRect[0], this.selectionRect[1], this.selectionRect[2], this.selectionRect[3]);
        ctx.strokeRect(this.pasteRect[0], this.pasteRect[1], this.pasteRect[2], this.pasteRect[3]);
        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(this.selectionRect[0]+2, this.selectionRect[1]+2, this.selectionRect[2]-4, this.selectionRect[3]-4);
        ctx.strokeStyle = "#0000FF";
        ctx.strokeRect(this.pasteRect[0]+2, this.pasteRect[1]+2, this.pasteRect[2]-4, this.pasteRect[3]-4);
        
    }

};
class KeyListenerTypes {
    keydown:Array<TouchHandler>;
    keypressed:Array<TouchHandler>;
    keyup:Array<TouchHandler>;
    constructor()
    {
        this.keydown = new Array<TouchHandler>();
        this.keypressed = new Array<TouchHandler>();
        this.keyup = new Array<TouchHandler>();
    }
};
class KeyboardHandler {
    keysHeld:any;
    listenerTypeMap:KeyListenerTypes;
    constructor()
    {
        this.keysHeld = {};
        this.listenerTypeMap = new KeyListenerTypes();
        document.addEventListener("keyup", e => this.keyUp(e));
        document.addEventListener("keydown", e => this.keyDown(e));
        document.addEventListener("keypressed", e => this.keyPressed(e));
    }
    registerCallBack(listenerType:string, predicate, callBack):void
    {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event):void
    {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach(handler => {
            if(handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    keyDown(event)
    {
        if(this.keysHeld[event.code] === undefined || this.keysHeld[event.code] === null)
            this.keysHeld[event.code] = 1;
        else
            this.keysHeld[event.code]++;
        event.keysHeld = this.keysHeld;
        this.callHandler("keydown", event);
    }
    keyUp(event)
    {
        this.keysHeld[event.code] = 0;
        event.keysHeld = this.keysHeld;
        this.callHandler("keyup", event);
    }
    keyPressed(event)
    {
        event.keysHeld = this.keysHeld;
        this.callHandler("keypressed", event);
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
    keyboardHandler:KeyboardHandler;
    textBoxColor:any;
    ctx:any;

    constructor(canvas:any, keyboardHandler:KeyboardHandler, textBoxColor:any, colorCount:number = 10, colors:Array<RGB> = null)
    {
        this.canvas = canvas;
        this.keyboardHandler = keyboardHandler;
        this.ctx = canvas.getContext("2d");
        this.highLightedCell = 0;
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
        }
        if(colors !== null)
        {
            colors.forEach(el => {
                this.colors.push(new RGB(el.red(), el.green(), el.blue(), el.alpha()));
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
                this.colors.push(new RGB(r%256, g%256, b%256, 255));
            }
        }
        this.listeners.registerCallBack("touchstart", e => true, e => this.handleClick(e));
        this.keyboardHandler
    }
    calcColor(i:number = this.highLightedCell):RGB
    {
        const color = new RGB(this.colors[i].red(), this.colors[i].green(), this.colors[i].blue(), this.colors[i].alpha());
        const scale = 1.6;
        if(this.keyboardHandler.keysHeld["ShiftLeft"] || this.keyboardHandler.keysHeld["ShiftRight"])
        {
            color.setRed(Math.floor(color.red()*scale) < 256 ? Math.floor(color.red()*scale) : 255);
            color.setGreen(Math.floor(color.green()*scale) < 256 ? Math.floor(color.green()*scale) : 255);
            color.setBlue(Math.floor(color.blue()*scale) < 256 ? Math.floor(color.blue()*scale) : 255);
        }
        return color;
    }
    handleClick(event):void
    {
        this.highLightedCell = Math.floor((event.touchPos[0] / this.canvas.width) * this.colors.length);
        this.textBoxColor.value = this.calcColor().htmlRBGA();
    }
    setSelectedColor(color:string)
    {
        this.colors[this.highLightedCell].loadString(color);
    }
    cloneColor(color:RGB):RGB
    {
        const newc = new RGB(0,0,0,0);
        newc.copy(color);
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
            ctx.fillStyle = this.calcColor(i).htmlRBGA();
            ctx.fillRect(i * width, 0, width, height);
            ctx.strokeRect(i * width, 0, width, height);
            this.ctx.font = '16px Calibri';
            const visibleColor:RGB = (this.calcColor(i));

            ctx.strokeStyle = visibleColor.htmlRBGA();

            this.ctx.strokeText((i+1)%10,i*width+width*0.5, height/3);

            visibleColor.setBlue(Math.floor(visibleColor.blue()/2));
            visibleColor.setRed(Math.floor(visibleColor.red()/2));
            visibleColor.setGreen(Math.floor(visibleColor.green()/2));
            this.ctx.fillStyle = visibleColor.htmlRBGA();
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
class Sprite {
    pixels:Uint8ClampedArray;
    width:number;
    height:number;
    constructor(pixels:Array<RGB>, width:number, height:number)
    {
        this.copy(pixels, width, height);
    }
    copy(pixels:Array<RGB>, width:number, height:number):void
    {
        if(!this.pixels || this.pixels.length !== pixels.length){
            this.pixels = new Uint8ClampedArray(width * height * 4);
            this.width = width;
            this.height = height;

        }
        for(let i = 0; i < pixels.length; i++)
        {
            this.pixels[(i<<2)] = pixels[i].red();
            this.pixels[(i<<2)+1] = pixels[i].green();
            this.pixels[(i<<2)+2] = pixels[i].blue();
            this.pixels[(i<<2)+3] = pixels[i].alpha();
        }
    }
    copyToBuffer(buf:Array<RGB>)
    {
        for(let i = 0; i < buf.length; i++)
        {
            buf[i].setRed(this.pixels[(i<<2)]);
            buf[i].setGreen(this.pixels[(i<<2)+1]);
            buf[i].setBlue(this.pixels[(i<<2)+2]);
            buf[i].setAlpha(this.pixels[(i<<2)+3]);
        }
    }
    copySprite(sprite:Sprite)
    {
        if(this.pixels.length !== sprite.pixels.length)
            this.pixels = new Uint8ClampedArray(sprite.pixels.length);
        this.width = sprite.width;
        this.height = sprite.height;
        let i = 0;
        this.pixels.forEach(el => el = sprite.pixels[i++]);
    }
    draw(ctx, x:number, y:number, width:number, height:number):void
    {
        if(this.pixels){ 
            const idata = ctx.createImageData(this.width, this.height);
            idata.data.set(this.pixels);
            ctx.putImageData(idata, x, y);
        }
    }
};
class SpriteAnimation {
    sprites:Array<Sprite>;
    x:number;
    y:number;
    width:number;
    height:number;
    animationIndex:number;

    constructor(x:number, y:number, width:number, height:number)
    {
        this.sprites = new Array<Sprite>();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animationIndex = 0;
    }
    pushSprite(sprite:Sprite):void
    {
        this.sprites.push(sprite);
    }
    draw(ctx):void
    {
        //ctx.putImageData(this.sprites[this.animationIndex++].pixels, this.x, this.y, this.width, this.height);
        if(this.sprites.length){
        this.sprites[this.animationIndex++].draw(ctx, this.x, this.y, this.width, this.height);
        this.animationIndex %= this.sprites.length;
        }
        else{
            this.animationIndex = 0;
        }
    }
};
class SpriteSelector {
    canvas:any;
    ctx:any;
    listener:SingleTouchListener;
    selectedSprite:number;
    spriteHeight:number;
    spriteWidth:number;
    spritesPerRow:number;
    drawingField:DrawingScreen;
    animationGroup:AnimationGroup;
    spritesCount:number;
    constructor(canvas, drawingField:DrawingScreen, animationGroup:AnimationGroup, spritesPerRow:number, width:number, height:number)
    {
        this.canvas = canvas;
        this.canvas.width = width * spritesPerRow;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 2;
        this.drawingField = drawingField;
        this.animationGroup = animationGroup;
        this.spritesPerRow = spritesPerRow;
        this.spriteHeight = height;
        this.spriteWidth = width;
        this.selectedSprite = 0;
        canvas.width = width * spritesPerRow;
        canvas.height = height;
        const listener:SingleTouchListener = new SingleTouchListener(canvas, true, true);
        this.listener = listener;
        this.spritesCount = this.sprites()?this.sprites().length:0;
        
        listener.registerCallBack("touchend", e => {return true}, e =>{
            const clickedSprite:number = Math.floor(e.touchPos[0]/canvas.width*this.spritesPerRow) + spritesPerRow*Math.floor(e.touchPos[1] / this.spriteHeight);

            if(clickedSprite < this.sprites().length)
            {
                const startSprite:number = Math.floor((e.touchPos[0] - e.deltaX)/canvas.width*this.spritesPerRow) + spritesPerRow*(Math.floor(e.touchPos[1] / this.spriteHeight) - Math.floor(e.deltaY/this.spriteHeight + 0.5));

                const screen:Array<RGB> = this.drawingField.screenBuffer;
                const sprite:Sprite = this.sprites()[clickedSprite];
                const spriteDataStart:Sprite = this.sprites()[startSprite];
                
                spriteDataStart.copySprite(sprite);
                spriteDataStart.copyToBuffer(screen);
                this.selectedSprite = clickedSprite;
            }
            
            
        });
    }
    update()
    {
        if((1+Math.floor(this.sprites().length / this.spritesPerRow) * this.spriteHeight) > this.canvas.height)
        {
            this.canvas.height = (1+Math.floor(this.sprites().length / this.spritesPerRow)) * this.spriteHeight;
        }
        if(this.spritesCount != this.sprites().length)
        {
            this.spritesCount = this.sprites()?this.sprites().length:0;
            this.selectedSprite = this.spritesCount - 1;
            this.loadSprite();
        }
    }
    draw()
    {
        if(this.sprites())
        {
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            for(let i = 0; i < this.sprites().length; i++)
            {
                const x:number = i % this.spritesPerRow * this.spriteWidth;
                const y:number = Math.floor(i / this.spritesPerRow) * this.spriteHeight;
                this.sprites()[i].draw(this.ctx, x, y, this.spriteHeight, this.spriteWidth);
            } 
            this.ctx.strokeRect(this.selectedSprite % this.spritesPerRow * this.spriteWidth+2, Math.floor(this.selectedSprite / this.spritesPerRow) * this.spriteHeight + 2, this.spriteWidth - 4, this.spriteHeight - 4);
        }
    }
    loadSprite()
    {
        if(this.selectedSpriteVal())
            this.selectedSpriteVal().copyToBuffer(this.drawingField.screenBuffer);
    }
    pushSelectedToCanvas()
    {
        if(this.selectedSpriteVal())
            this.selectedSpriteVal().copy(this.drawingField.screenBuffer, this.spriteWidth, this.spriteHeight);
    }
    selectedSpriteVal():Sprite
    {
        if(this.sprites())
            return this.sprites()[this.selectedSprite];
        return null;
    }
    sprites():Array<Sprite>
    {
        if(this.animationGroup.animations[this.animationGroup.selectedAnimation])
            return this.animationGroup.animations[this.animationGroup.selectedAnimation].sprites
        return null;
        }
};
class AnimationGroup {
    drawingField:DrawingScreen;
    animations:Array<SpriteAnimation>;
    animationDiv:any;
    animationSpritesDiv:any;
    animationCanvases:Array<Pair<any, any>>;
    spriteCanvases:Array<Pair<any, any>>;
    selectedAnimation:number;
    spriteSelector:SpriteSelector;
    constructor(drawingField:DrawingScreen, animiationsID:string, animiationsSpritesID:string, spritesPerRow:number = 10, spriteWidth = 64, spriteDrawHeight = 64)
    {
        this.drawingField = drawingField;
        this.animationDiv = document.getElementById(animiationsID);
        this.animationSpritesDiv = document.getElementById(animiationsSpritesID);
        this.animations = new Array<SpriteAnimation>();
        this.animationCanvases = new Array<Pair<any, any>>();
        this.spriteCanvases = new Array<Pair<any, any>>();
        this.selectedAnimation = 0;
        this.spriteSelector = new SpriteSelector(document.getElementById("sprites-canvas"), this.drawingField, this, spritesPerRow, spriteWidth, spriteDrawHeight);

    }
    pushAnimation(animation:SpriteAnimation)
    {
        this.animations.push(animation);
        this.selectedAnimation = this.animations.length - 1;
        this.pushSpriteToAnimation(this.animations[this.selectedAnimation]);
        this.buildAnimationHTML();
    }

    pushSpriteToAnimation(animation:SpriteAnimation)
    {
        const sprites:Array<Sprite> = animation.sprites;
        this.spriteSelector.spritesCount = sprites.length;
        this.spriteSelector.selectedSprite = sprites.length - 1;
        sprites.push(new Sprite(this.drawingField.screenBuffer, this.drawingField.dimensions.first, this.drawingField.dimensions.second));
        this.spriteSelector.loadSprite();
    }
    pushSprite()
    {
        if(this.selectedAnimation >= this.animations.length)
        {
            this.pushAnimation(new SpriteAnimation(0,0,this.spriteSelector.spriteWidth,this.spriteSelector.spriteHeight));
        }
        else
        { 
            const sprites:Array<Sprite> = this.animations[this.selectedAnimation].sprites;
            this.spriteSelector.selectedSprite = sprites.length - 1;
            sprites.push(new Sprite(this.drawingField.screenBuffer, this.drawingField.dimensions.first, this.drawingField.dimensions.second));
            this.spriteSelector.loadSprite();
        }
    }
    buildAnimationHTML()
    {
        this.animationCanvases.forEach(el => el.first.first.remove());
        this.animationCanvases.splice(0, this.animationCanvases.length);//deletes all elements from array
        this.animationDiv.innerHTML = '';
        let i = 0;
        this.animations.forEach(async el => {
            const canvas = document.createElement("canvas");
            canvas.id = "animation_canvas" + i;
            canvas.width = this.spriteSelector.spriteWidth;
            canvas.height = this.spriteSelector.spriteHeight;
            const listener:SingleTouchListener = new SingleTouchListener(canvas, false, true);
            listener.registerCallBack("touchstart", e => true, e => {
                this.selectedAnimation = parseInt(canvas.id.substring(16,canvas.id.length));
            });
            this.animationCanvases.push(new Pair(new Pair(canvas, listener), canvas.getContext("2d")));
            this.animationDiv.appendChild(canvas);
            i++;
        });
    }
    draw()
    {
        for(let i = 0; i < this.animations.length; i++)
        {
            this.animations[i].draw(this.animationCanvases[i].second);
        }
        if(this.animations.length){
            this.spriteSelector.update();
            this.spriteSelector.draw();
            this.animationCanvases[this.selectedAnimation].second.strokeStyle = "#000000";
            this.animationCanvases[this.selectedAnimation].second.lineWidth = 3;
            this.animationCanvases[this.selectedAnimation].second.strokeRect(1, 1, this.animationCanvases[this.selectedAnimation].first.first.width - 2, this.animationCanvases[this.selectedAnimation].first.first.height - 2);
        }
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
    const keyboardHandler:KeyboardHandler = new KeyboardHandler();
    const field:DrawingScreen = new DrawingScreen(document.getElementById("screen"), keyboardHandler,[0,0], dim);

    const pallette:Pallette = new Pallette(document.getElementById("pallette_screen"), keyboardHandler, newColor);
    const setPalletteColorButton = document.getElementById("setPalletteColorButton");
    const palletteColorButtonListener:SingleTouchListener = new SingleTouchListener(setPalletteColorButton, true, true);
    palletteColorButtonListener.registerCallBack("touchstart", e => true, e => {pallette.setSelectedColor(newColor.value);field.color = pallette.calcColor();});
    pallette.canvas.addEventListener("mouseup", e => { field.color = pallette.calcColor() });
    pallette.listeners.registerCallBack("touchend", e => true,  e => { field.color = pallette.calcColor(); })
    
    const animations:AnimationGroup = new AnimationGroup(field, "animations", "sprites", Math.floor(field.canvas.width/dim[0]+0.5), dim[0], dim[1]);

    const add_animationButton = document.getElementById("add_animation");
    add_animationButton.addEventListener("mousedown", e => {
        animations.pushAnimation(new SpriteAnimation(0, 0, dim[0], dim[1]));
    });

    const add_spriteButton = document.getElementById("add_sprite");
    add_spriteButton.addEventListener("mousedown", e => {
        animations.pushSprite();
    });

    const save_spriteButton = document.getElementById("save_sprite");
    save_spriteButton.addEventListener("mousedown", e => {
        animations.spriteSelector.pushSelectedToCanvas();
    });
    const save_serverButton = document.getElementById("save_server");
    save_serverButton.addEventListener("mousedown", e => logToServer({animation:animations.animations[animations.selectedAnimation]}))
    
    keyboardHandler.registerCallBack("keydown", e=> true, e => {
        field.color.copy(pallette.calcColor());
        if(document.getElementById('body') === document.activeElement && e.code.substring(0,"Digit".length) === "Digit"){
            const numTyped:string = e.code.substring("Digit".length, e.code.length);
            pallette.highLightedCell = parseInt(numTyped);
        }
    });
    keyboardHandler.registerCallBack("keyup", e=> true, e => {
        field.color.copy(pallette.calcColor());
    });
    
    const fps = 15;
    const goalSleep = 1000/fps;
    let counter = 0;
    while(true)
    {
        const start:number = Date.now();
        field.draw();
        pallette.draw();
        if(counter++ % 1 == 0)
            animations.draw();
        const adjustment:number = Date.now() - start <= 30 ? Date.now() - start : 30;
        await sleep(goalSleep - adjustment);
    }
}
main();