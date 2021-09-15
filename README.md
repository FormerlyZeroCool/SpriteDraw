# SpriteDraw
A small animation creation tool that allows users to do pixel art, and make animations from that pixel art.
<br>
<h2>Animations</h2>
Animations are groups of sprites(small images, for more see below) that make up a single small flip book of sprites, or frames.<br>
You can add new animations at any time by pressing the "Add Animation" button, or when you haven't created one yet by pressing the "Add Sprite" button.<br>
both will take the contents of the drawing screen, and save them to a new sprite, and save that sprite within a new animation.<br>
You can switch between animations by clicking on them, and the aniamtion's sprites will show up in the sprite selector so you can update, or add to them.
<br>
<h2>Sprite Selector</h2>
This is a tool used to manage existing sprites, and save new ones to animations<br>
To add a new sprite press the "Add Sprite" button, which will create a new sprite with the image on the drawing screen, and add it to the currently selected animation<br>
To update an existing sprite simply press the "Save Sprite" button, and whatever is on the drawing screen will be saved to the currently selected sprite.<br>
If you drag the cursor while holding down the left button and start on one sprite, and end on another the sprite selector will copy<br>
the sprite where the cursor was when it was clicked to the screen, but select the sprite the mouse was lifted on so it can be saved, and updated to the other sprite.
<br>
<h2>Color Pallete</h2>
A simple tool found underneath the main drawing screen to select the color used for drawing.<br>
You can either click on the color you wish to use to select the color, or select it by pressing one of the number keys 0-9.<br>
If you select a color you may notice it's red green blue, and transparency values popup in the text box next to the set button,
you can change on of these values and press set to save the new color to the pallete
<br>

<h2>Tools:</h2>
*note you can switch tools by clicking on them, or by pressing the up and down arrow keys.

<h3>1.) Pen tool:</h3>
Used to draw curved lines of the color selected in the color palette, like a pen on pixelated paper.<br>
To draw click, if the mouse is dragged while the left mouse button is held down it will act like dragging a pen across paper.
<br>
<h3>2.) Fill Tool</h3>
Used to change all adjacent pixels of one color to the color selected in the color palette.<br>
Click on a pixel, and all adjacent pixels of the same color will change to the selected color on the color palette.
<br>
<h3>3.) Line Draw Tool</h3>
Used to draw straight lines on the screen.<br>
Press, and hold mouse, drag, and you'll see a preview of the line that will be drawn, release to draw.
<br>
<h3>4.) Rectangle Tool</h3>
Used to draw a rectangle of the color selected in the color palette.<br>
To draw press, and hold the mouse where you want one corner of the rectangle to begin, drag till the preview of the rectangle is the size you wish<br>
while keeping the mouse held, and release the mouse to draw the rectangle previewed to the screen.
<br>
<h3>5.) Oval Tool</h3>
Used to draw a oval of the color selected in the color palette.<br>
To draw press, and hold the mouse where you want one portion of the oval to begin, drag till the preview rectangle is the size you wish<br>
while keeping the mouse held, and release the mouse to draw an oval within the rectangle previewed to the screen.
<br>
<h3>6.) Copy Tool</h3>
Used to copy all the pixels within a selection rectangle to the clipboard to paste later.<br>
To copy press, and hold the mouse where you want one corner of the rectangle to begin, drag till the preview of the rectangle is <br>
completely surrounding the area you wish to copy while keeping the mouse held, and release the mouse to copy the area within rectangle previewed to the clipboard.
<br>
<h3>7.) Paste Tool</h3>
Used to paste pixels saved to the clip board to the screen.<br>
To use simply click where you wish to paste on the screen, a rectangle will show exactly where the contents of the clipboard will be copied.
<br>
<h3>8.) Drag Tool</h3>
Used to drag groups of pixels around the screen once they have already been drawn.<br>
To use click on one of the pixels in the group you wish to drag, and simply drag to a new location on the screen.<br>
*Important note<br>
If the alt key is held then the pixel group will be defined as all adjacent pixels of the same color will be dragged.<br>
If the alt key is NOT held then it will drag all adjacent pixels that have any color that is not completely transparent.
<br>
<h3>9.) Redo Tool</h3>
Simply click on the screen to redo the last action you have undone.<br>
*You can also always (with any tool selected) press the r key on the keyboard to redo.
<br>
<h3>10.) Undo Tool</h3>
Simply click on the screen to undo the last action you performed.<br>
*You can also always (with any tool selected) press the u key on the keyboard to undo.
<br>
<h3>Notes on the clipboard viewer</h3>
1.) The clip board viewer can be found directly to the right of the toolbar, and is contained in a blue rectangle.<br>
2.) If you drag the mouse over the clipboard its contents will rotate.<br>
3.) Its contents will be filled by using the copy tool, and it shows a preview of what will be pasted with the paste tool<br>
<h2>To run your own instance locally</h2>
1.) cd to webserver directory<br>
2.) run npm install<br>
3.) run node app.js<br>
4.) navigate to 127.0.0.1:5000 to see running app
