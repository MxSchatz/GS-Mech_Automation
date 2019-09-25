//DESCRIPTION:Apply Bookmarks to a particular paragraph style from a UI.
//http://forums.adobe.com/thread/681085 (Ariel's script to select a paragraph style)
//http://lnkd.in/dwFTSPA (Sundara Moorthy's original script)
//2014-09-13 modified by Colin Flashman - Colecandoo - www.colecandoo.com
if(app.documents.length !=0){
var aDoc = app.activeDocument;
}
else{
alert("Please open a document and try again.");
exit(0);
}
myStyle = SelectParagraph();

function SelectParagraph(){
mydialog = app.dialogs.add({name:"Source Paragraph Style", canCancel:true});
myStyles = aDoc.allParagraphStyles;
var mystring = [];
for (aa = 0; aa < myStyles.length; aa ++){
mystring[aa] = myStyles[aa].name;
if (myStyles[aa].parent.constructor.name == "ParagraphStyleGroup") mystring[aa]+=" ["+myStyles[aa].parent.name+"]";
}
with (mydialog.dialogColumns.add()){
staticTexts.add({staticLabel:"Please choose:"});
}
with (mydialog.dialogColumns.add()){
mymenu = dropdowns.add({stringList:mystring, selectedIndex:0});
}
if (mydialog.show()) myresult = myStyles[mymenu.selectedIndex]
else myresult =-1;
mydialog.destroy();
return(myresult);
}

app.findGrepPreferences = app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.appliedParagraphStyle = myStyle;
var myFind = aDoc.findGrep();
for(f=0; f<myFind.length; f++){
var myFnCit = myFind[f];
if(myFnCit.contents !=""){
try{
var myBookMarkDestination = aDoc.hyperlinkTextDestinations.add(myFnCit.texts[0], {name:myFnCit.contents.toString()});
var myBk = aDoc.bookmarks.add(myBookMarkDestination, {name:String(myFnCit.contents)});
}catch(e){};
}
}
alert("Completed."); 