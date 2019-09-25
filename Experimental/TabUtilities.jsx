//TabUtilities.jsx
//An InDesign JavaScript
/*  
@@@BUILDINFO@@@ "TabUtilities.jsx" 3.0.0 15 December 2009
*/
//Adds a right tab stop at the right column edge, or a tab stop at the current 
//cursor position, or sets the left indent at the current cursor position.
//Demonstrates getting page layout coordinates from text objects, setting tab stops,
//working with multi-column text frames.
//
//For more on InDesign/InCopy scripting see the documentation included in the Scripting SDK 
//available at http://www.adobe.com/devnet/indesign/sdk.html
//Or visit the InDesign Scripting User to User forum at http://www.adobeforums.com.
//
main();
function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	var myObjectList = new Array;
	if (app.documents.length != 0){
		if(app.activeDocument.stories.length != 0){
			if (app.selection.length != 0){
				switch (app.selection[0].constructor.name){
					case "InsertionPoint":
					case "Character":
					case "Word":
					case "TextStyleRange":
					case "Line":
					case "Paragraph":
					case "TextColumn":
					case "Text":
					case "TextFrame":
						myDisplayDialog();
						break;
				}
			}
			else{
				alert ("Please select some text and try again.");
			}
		}
	}
	else{
		alert ("Please open a document, select an object, and try again.");
	}
}
//Display a dialog box.
function myDisplayDialog(){
	var myDialog, myTabButtons;
	with(myDialog = app.dialogs.add({name:"TabUtilities"})){
		with(dialogColumns.add()){
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Set a Tab Stop At:"});
				with(myTabButtons = radiobuttonGroups.add()){
					radiobuttonControls.add({staticLabel:"Right Column Edge", checkedState:true});
					radiobuttonControls.add({staticLabel:"Current Cursor Position"});
					radiobuttonControls.add({staticLabel:"Left Indent"});
					radiobuttonControls.add({staticLabel:"Hanging Indent at Cursor"});
				}
			}
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Tab Leader"});
					with(dialogColumns.add()){
					myTabLeaderField = textEditboxes.add({editContents:""});
				}
			}
		}
	}
	var myResult = myDialog.show();
	if(myResult == true){
		var myTabType = myTabButtons.selectedButton;
		var myTabLeader = myTabLeaderField.editContents;
		myDialog.destroy();
		myAddTabStop(myTabType, myTabLeader);		
	}
	else{
		myDialog.destroy();
	}
}
//Add the tab stop.
function myAddTabStop(myTabType, myLeader){
	var myParagraphs, myTabPosition, myTabAlignment, myParagraph;
	switch(myTabType){
		case 0:
			myParagraphs = app.selection[0].paragraphs;
			for(myCounter = 0; myCounter < myParagraphs.length; myCounter ++){
				myParagraph = myParagraphs.item(myCounter);
				myTabPosition = myParagraph.insertionPoints.item(0).parentTextFrames[0].textFramePreferences.textColumnFixedWidth;
				myTabAlignment = TabStopAlignment.rightAlign;
				myParagraph.tabStops.add({alignment:myTabAlignment, leader:myLeader, position:myTabPosition});
			}
			break;
		case 1:
			//Get the first insertion point in the selection.
			myInsertionPoint = app.selection[0].insertionPoints.item(0);
			//Work out which column it's in and get the left edge of that column.
			myTabPosition = myInsertionPoint.horizontalOffset - myFindColumnEdge(myInsertionPoint);
			myTabAlignment = TabStopAlignment.leftAlign;
			myInsertionPoint.paragraphs.item(0).tabStops.add({alignment:myTabAlignment, leader:myLeader, position:myTabPosition})
			break;
		case 2:
			myParagraphs = app.selection[0].paragraphs;
			for(myCounter = 0; myCounter < myParagraphs.length; myCounter ++){
				myParagraph = myParagraphs.item(myCounter);
				myTabPosition = myParagraph.leftIndent;
				myTabAlignment = TabStopAlignment.leftAlign;
				myParagraph.tabStops.add({alignment:myTabAlignment, leader:myLeader, position:myTabPosition});
			}
			break;
		case 3:
			myParagraphs = app.selection[0].paragraphs;
			//Get the first insertion point in the selection.
			myInsertionPoint = app.selection[0].insertionPoints.item(0);
			//Work out which column it's in and get the left edge of that column.
			myTabPosition = myInsertionPoint.horizontalOffset - myFindColumnEdge(myInsertionPoint);
			myTabAlignment = TabStopAlignment.leftAlign;
			for(myCounter = 0; myCounter < myParagraphs.length; myCounter ++){
				myParagraph = myParagraphs.item(myCounter);
				myParagraph.leftIndent = myTabPosition;
				myParagraph.firstLineIndent = -myTabPosition;
				myParagraph.tabStops.add({alignment:myTabAlignment, leader:myLeader, position:myTabPosition});
			}
			break;
	}
}
//This function returns the left edge of the text column containing the insertion point,
//in page coordinates. It could be modified to return the index of the column, as well.
function myFindColumnEdge(myInsertionPoint){
	var myCounter, myLeftInset, myRightInset, myX1, myX2, myColumnEdge;
	var myPagePosition = myInsertionPoint.horizontalOffset;
	var myTextFrame = myInsertionPoint.parentTextFrames[0];
	var myColumnWidth = myTextFrame.textFramePreferences.textColumnFixedWidth;
	var myGutterWidth = myTextFrame.textFramePreferences.textColumnGutter;
	var myTextFrameWidth = myTextFrame.geometricBounds[3]-myTextFrame.geometricBounds[1];
	//Get the distance from the insertion point to the left edge of the text frame.
	var myXOffset = myPagePosition - myTextFrame.geometricBounds[1];
	var myArray = new Array;
	for (myCounter = 0; myCounter < myTextFrame.textFramePreferences.textColumnCount; myCounter ++){
		if(myCounter == 0){
			//If the text frame is rectangular, the insetSpacing array will
			//have four values; if it's not rectangular, insetSpacing will have one value.
			if(myTextFrame.textFramePreferences.insetSpacing.length == 4){
				myLeftInset = myTextFrame.textFramePreferences.insetSpacing[1];
				myRightInset = myTextFrame.textFramePreferences.insetSpacing[3];
			}
			else{
				myLeftInset = myTextFrame.textFramePreferences.insetSpacing[0];
				myRightInset = myTextFrame.textFramePreferences.insetSpacing[0];
			}
			myX1 = myTextFrame.geometricBounds[1] + myLeftInset;
			myX2 = myX1 + myColumnWidth;
		}
		else{
			if(myCounter == myTextFrame.textFramePreferences.textColumnCount){
				myX2 = myTextFrame.geometricBounds[1] -myRightIndent;
				myX1 = myX2 - myTextWidth;
			}
			else{
				myX1 = myTextFrame.geometricBounds[1] + (myColumnWidth*myCounter) + (myGutterWidth * myCounter);
				myX2 = myX1 + myColumnWidth;
			}
		}
		myArray.push([myX1, myX2]);
	}
	for(myCounter = 0; myCounter < myArray.length; myCounter ++){
		if((myPagePosition >= myArray[myCounter][0])&&(myPagePosition <=myArray[myCounter][1])){
			myColumnEdge = myArray[myCounter][0];
			break;
		}
	}
	return myColumnEdge;
}
