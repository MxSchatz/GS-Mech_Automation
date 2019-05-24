//script to insert used swatches


var docRef = app.activeDocument;

var myTextFrame = docRef.textFrames.add();

myTextFrame.contents = docRef.placedItems[0].file.name;
myTextFrame.position = [15,-1015];
charAttr = myTextFrame.textRange.characterAttributes;
charAttr.textFont = app.textFonts.getByName("Helvetica-Light");
charAttr.size = 12;
charAttr.fillColor = docRef.swatches[1].color;
var colorNames = docRef.textFrames.add();
var sL = docRef.swatches;  
var text = '';  
for (var i = 0; i < sL.length; i++) {  
     if (sL[i].name != '[None]' && sL[i].name != '[Registration]') {  
          text += sL[i].name + ' ';  
     }  
}
colorNames.contents = text;
colorNames.position = [15,-1000];
colAttr = colorNames.textRange.characterAttributes;
colAttr.textFont = app.textFonts.getByName("Helvetica-Light");
colAttr.size = 12;