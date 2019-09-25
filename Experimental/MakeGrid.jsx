//MakeGrid.jsx
//An InDesign example script.
/*  
@@@BUILDINFO@@@ "MakeGrid.jsx" 3.0.0 15 December 2009
*/
//Divides the selected frame (or frames) into grid(s) of frames.
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
	if(app.documents.length != 0){
		if(app.selection.length != 0){
			for(myCounter = 0; myCounter < app.selection.length; myCounter++){
				switch(app.selection[myCounter].constructor.name){
					case "GraphicLine":
					case "Oval":
					case "Polygon":
					case "Rectangle":
					case "TextFrame":
						myObjectList.push(app.selection[myCounter]);
						break;			
				}
			}
			if(myObjectList.length !=0){
				myDisplayDialog(myObjectList);
			}
		}
	}
}
function myDisplayDialog(myObjectList){
	var myLabelWidth = 90;
	var myFrameTypes = ["Unassigned", "Text", "Graphic"];
	var myDialog = app.dialogs.add({name:"MakeGrid"});
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Rows:", minWidth:myLabelWidth});
				staticTexts.add({staticLabel:"Columns:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myNumberOfRowsField = integerEditboxes.add({editValue:2});
				var myNumberOfColumnsField = integerEditboxes.add({editValue:2});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Row Gutter:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myRowGutterField = measurementEditboxes.add({editValue:12, editUnits:MeasurementUnits.points});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Column Gutter:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myColumnGutterField = measurementEditboxes.add({editValue:12, editUnits:MeasurementUnits.points});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Frame Type:", minWidth:myLabelWidth});
			}
			with(dialogColumns.add()){
				var myFrameTypeDropdown = dropdowns.add({stringList:myFrameTypes, selectedIndex:0});
			}
		}
		var myRetainFormattingCheckbox = checkboxControls.add({staticLabel:"Retain Formatting and Contents", checkedState:true})
		var myDeleteObjectCheckbox = checkboxControls.add({staticLabel:"Delete Original Object", checkedState:true})
	}
	var myResult = myDialog.show();
	if(myResult == true){
		var myNumberOfRows = myNumberOfRowsField.editValue;
		var myNumberOfColumns = myNumberOfColumnsField.editValue;
		var myRowGutter = myRowGutterField.editValue;
		var myColumnGutter = myColumnGutterField.editValue;
		var myRetainFormatting = myRetainFormattingCheckbox.checkedState;
		var myDeleteObject = myDeleteObjectCheckbox.checkedState;
		switch(myFrameTypeDropdown.selectedIndex){
			case 0:
				myFrameType = ContentType.unassigned;
				break;
			case 1:
				myFrameType = ContentType.textType;
				break;
			case 2:
				myFrameType = ContentType.graphicType;
				break;
		}
		myDialog.destroy();
		mySplitFrames(myObjectList, myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject);
	}
	else{
		myDialog.destroy();
	}
}
function mySplitFrames(myObjectList, myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject){
	var myOldXUnits = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
	var myOldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
	app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
	app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
	for(var myCounter = 0; myCounter < myObjectList.length; myCounter ++){
		mySplitFrame(myObjectList[myCounter], myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject);
	}
	app.activeDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
	app.activeDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;

}
function mySplitFrame(myObject, myNumberOfRows, myNumberOfColumns, myRowGutter, myColumnGutter, myFrameType, myRetainFormatting, myDeleteObject){
	var myX1, myY1, myX2, myY2, myNewObject;
	var myBounds = myObject.geometricBounds;
	var myWidth = myBounds[3]-myBounds[1];
	var myHeight =  myBounds[2]-myBounds[0];
	//Don't bother making the frames if the width/height of the frame is too small
	//to accomodate the row/column gutter values.	
	if((myRowGutter * (myNumberOfRows - 1) < myHeight) && (myColumnGutter * (myNumberOfColumns - 1) < myWidth)){
		var myColumnWidth = (myWidth - (myColumnGutter * (myNumberOfColumns - 1)))/myNumberOfColumns;
		var myRowHeight =  (myHeight - (myRowGutter * (myNumberOfRows - 1)))/myNumberOfRows;
		for(var myRowCounter = 0; myRowCounter < myNumberOfRows; myRowCounter ++){
			myY1 = myBounds[0]+(myRowHeight*myRowCounter)+(myRowGutter*myRowCounter);
			myY2 = myY1 + myRowHeight;
			for(var myColumnCounter = 0; myColumnCounter < myNumberOfColumns; myColumnCounter ++){
				myX1 = myBounds[1]+(myColumnWidth*myColumnCounter)+(myColumnGutter*myColumnCounter);
				myX2 = myX1 + myColumnWidth;
				if(myRetainFormatting == true){
					myNewObject = myObject.duplicate();
					myNewObject.geometricBounds = [myY1, myX1, myY2, myX2];
				}
				else{
					myNewObject = myObject.parent.rectangles.add(undefined, undefined, undefined, {geometricBounds:[myY1, myX1, myY2, myX2], contentType:myFrameType});
				}
				if(myRetainFormatting == false){
					myNewObject.contentType=myFrameType;
				}
			}
		}
		if(myDeleteObject == true){
			myObject.remove();
		}
	}
}
function myGetProperties(myObject){
	for(myProperty in myObject.properties){
		
	}
}
