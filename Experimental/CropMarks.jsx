//CropMarks.jsx
//An InDesign JavaScript
/*  
@@@BUILDINFO@@@ "CropMarks.jsx" 3.0.0 15 December 2009
*/
//Draws crop and/or registration marks around the selected object or objects.
//
//For more on InDesign/InCopy scripting see the documentation included in the Scripting SDK 
//available at http://www.adobe.com/devnet/indesign/sdk.html
//or visit the InDesign Scripting User to User forum at http://www.adobeforums.com
//
main();
function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if (app.documents.length != 0){
		if (app.selection.length > 0){
			switch(app.selection[0].constructor.name){
				case "Rectangle":
				case "Oval":
				case "Polygon":
				case "GraphicLine":
				case "Group":
				case "TextFrame":
				case "Button":
					myDisplayDialog();
					break;
				default:			
					alert("Please select a page item and try again.");
					break;
			}
		}
		else{
			alert("Please select an object and try again.");
		}
	}
	else{
		alert("Please open a document, select an object, and try again.");
	}
}
function myDisplayDialog(){
	var myDialog = app.dialogs.add({name:"CropMarks"});
	with(myDialog){
		with(dialogColumns.add()){
			var myCropMarksGroup = enablingGroups.add({staticLabel:"Crop Marks", checkedState:true});
			with (myCropMarksGroup){
				with(borderPanels.add()){
					staticTexts.add({staticLabel:"Options:"});
					with (dialogColumns.add()){
						staticTexts.add({staticLabel:"Length:"});
						staticTexts.add({staticLabel:"Offset:"});
						staticTexts.add({staticLabel:"Stroke Weight:"});
					}
					with (dialogColumns.add()){
						var myCropMarkLengthField = measurementEditboxes.add({editValue:6, editUnits:MeasurementUnits.points});
						var myCropMarkOffsetField = measurementEditboxes.add({editValue:3, editUnits:MeasurementUnits.points});
						var myCropMarkWidthField = measurementEditboxes.add({editValue:.25, editUnits:MeasurementUnits.points});
					}
				}
			}
			var myRegMarksGroup = enablingGroups.add({staticLabel:"Registration Marks", checkedState:true});
			with (myRegMarksGroup){
				with(borderPanels.add()){
					staticTexts.add({staticLabel:"Options:"});
					with (dialogColumns.add()){
						staticTexts.add({staticLabel:"Inside Radius:"});
						staticTexts.add({staticLabel:"Outside Radius:"});
						staticTexts.add({staticLabel:"Offset:"});
					}
					with (dialogColumns.add()){
						var myRegMarkInnerRadiusField = measurementEditboxes.add({editValue:2, editUnits:MeasurementUnits.points});
						var myRegMarkOuterRadiusField = measurementEditboxes.add({editValue:4,editUnits:MeasurementUnits.points});
						var myRegMarkOffsetField = measurementEditboxes.add({editValue:3, editUnits:MeasurementUnits.points});
					}
				}
			}
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Draw Marks Around:"});
				var myRangeButtons = radiobuttonGroups.add();
				with(myRangeButtons){
					radiobuttonControls.add({staticLabel:"Each Object", checkedState:true});
					radiobuttonControls.add({staticLabel:"Entire Selection"});
				}
			}
		}
	}
	var myReturn = myDialog.show();
	if (myReturn == true){
		//Get the values from the dialog box.
		var myDoCropMarks = myCropMarksGroup.checkedState;
		var myDoRegMarks = myRegMarksGroup.checkedState;
		var myCropMarkLength = myCropMarkLengthField.editValue;
		var myCropMarkOffset = myCropMarkOffsetField.editValue;
		var myCropMarkWidth = myCropMarkWidthField.editValue;
		var myRegMarkInnerRadius = myRegMarkInnerRadiusField.editValue;
		var myRegMarkOuterRadius = myRegMarkOuterRadiusField.editValue;
		var myRegMarkOffset = myRegMarkOffsetField.editValue;
		var myRange = myRangeButtons.selectedButton;
		myDialog.destroy();
		//"||" is logical OR in JavaScript.
		if ((myDoCropMarks != false) || (myDoRegMarks != false)){
			myDrawPrintersMarks(myRange, myDoCropMarks, myDoRegMarks, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myRegMarkInnerRadius, myRegMarkOuterRadius, myRegMarkOffset);
		}
		else{
			alert("No printers marks were selected.");
		}
	}
	else{
		myDialog.destroy();
	}
}
function myDrawPrintersMarks(myRange, myDoCropMarks, myDoRegMarks, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myRegMarkInnerRadius, myRegMarkOuterRadius, myRegMarkOffset){
	var myBounds, myX1, myY1, myX2, myY2, myObject;
	var myDocument = app.activeDocument;
	var myOldRulerOrigin = myDocument.viewPreferences.rulerOrigin;
	myDocument.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	//Save the current measurement units.
	var myOldXUnits = myDocument.viewPreferences.horizontalMeasurementUnits;
	var myOldYUnits = myDocument.viewPreferences.verticalMeasurementUnits;
	//Set the measurement units to points.
	myDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
	myDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
	//Create a layer to hold the printers marks (if it does not already exist).
	var myLayer = myDocument.layers.item("myCropMarks");
	try{
		myLayerName = myLayer.name;
	}
	catch (myError){
		var myLayer = myDocument.layers.add({name:"myCropMarks"});
	}
	//Get references to the Registration color and the None swatch.
	var myRegistrationColor = myDocument.colors.item("Registration");
	var myNoneSwatch = myDocument.swatches.item("None");
	//Process the objects in the selection.		
	myBounds = myDocument.selection[0].visibleBounds;
	for(var myCounter = 0; myCounter < myDocument.selection.length; myCounter ++){
		myObject = myDocument.selection[myCounter];
		myBounds = myObject.visibleBounds;
		//Set up some initial bounding box values.
		if ((myRange != 0)&&(myCounter==0)){
			myX1 = myBounds[1];
			myY1 = myBounds[0];
			myX2 = myBounds[3];
			myY2 = myBounds[2];
		}
		if(myRange == 0){
			if (myDoCropMarks == true){
				myDrawCropMarks (myBounds[1], myBounds[0], myBounds[3], myBounds[2], myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
			}
			if (myDoRegMarks == true){
				myDrawRegMarks (myBounds[1], myBounds[0], myBounds[3], myBounds[2], myRegMarkOffset, myRegMarkInnerRadius, myRegMarkOuterRadius, myCropMarkWidth,myRegistrationColor, myNoneSwatch, myLayer);
			}
		}
		else{
			//Compare the bounds values to the stored bounds.
			//If a given bounds value is less than (for x1 and y1) or 
			//greater than (for x2 and y2) the stored value,
			//then replace the stored value with the bounds value.
			if (myBounds[0] < myY1){
				myY1 = myBounds[0];
			}
			if (myBounds[1] < myX1){
				myX1 = myBounds[1];
			}
			if (myBounds[2] > myY2){
				myY2 = myBounds[2];
			}
			if (myBounds[3] > myX2){
				myX2 = myBounds[3];
			}
		}
	}
	if(myRange != 0){
		if (myDoCropMarks == true){
			myDrawCropMarks (myX1, myY1, myX2, myY2, myCropMarkLength, myCropMarkOffset, myCropMarkWidth,myRegistrationColor, myNoneSwatch, myLayer);
		}
		if (myDoRegMarks == true){
			myDrawRegMarks (myX1, myY1, myX2, myY2, myRegMarkOffset, myRegMarkInnerRadius, myRegMarkOuterRadius, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
		}
	}
	myDocument.viewPreferences.rulerOrigin = myOldRulerOrigin;
	//Set the measurement units back to their original state.
	myDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
	myDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
}
function myDrawCropMarks (myX1, myY1, myX2, myY2, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer){

	//Upper left crop mark pair.
	myDrawLine([myY1, myX1-myCropMarkOffset, myY1, myX1-(myCropMarkOffset + myCropMarkLength)], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myDrawLine([myY1-myCropMarkOffset, myX1, myY1-(myCropMarkOffset+myCropMarkLength), myX1], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);

	//Lower left crop mark pair.
	myDrawLine([myY2, myX1-myCropMarkOffset, myY2, myX1-(myCropMarkOffset+myCropMarkLength)], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myDrawLine([myY2+myCropMarkOffset, myX1, myY2+myCropMarkOffset+myCropMarkLength, myX1], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);

	//Upper right crop mark pair.
	myDrawLine([myY1, myX2+myCropMarkOffset, myY1, myX2+myCropMarkOffset+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myDrawLine([myY1-myCropMarkOffset, myX2, myY1-(myCropMarkOffset+myCropMarkLength), myX2], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);

	//Lower left crop mark pair.
	myDrawLine([myY2, myX2+myCropMarkOffset, myY2, myX2+myCropMarkOffset+myCropMarkLength], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myDrawLine([myY2+myCropMarkOffset, myX2, myY2+myCropMarkOffset+myCropMarkLength, myX2], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
}

function myDrawRegMarks (myX1, myY1, myX2, myY2, myRegMarkOffset, myRegMarkInnerRadius, myRegMarkOuterRadius, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer){
	var myBounds
	var myXCenter = myX1 + ((myX2 - myX1)/2);
	var myYCenter = myY1 + ((myY2 - myY1)/2);
	var myTargetCenter = myRegMarkOffset+(myRegMarkOuterRadius);

	//Top registration target.
	myBounds = [myY1-(myTargetCenter+myRegMarkInnerRadius), myXCenter-myRegMarkInnerRadius, (myY1-myTargetCenter)+myRegMarkInnerRadius, myXCenter + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myY1-(myTargetCenter+myRegMarkOuterRadius), myXCenter, (myY1-myTargetCenter)+myRegMarkOuterRadius, myXCenter]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myY1-myTargetCenter, myXCenter-myRegMarkOuterRadius, myY1-myTargetCenter, myXCenter+myRegMarkOuterRadius]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);

	//Left registration target.
	myBounds = [myYCenter-myRegMarkInnerRadius, myX1-(myTargetCenter+myRegMarkInnerRadius), myYCenter+myRegMarkInnerRadius, (myX1 - myTargetCenter) + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myYCenter, myX1-(myTargetCenter+myRegMarkOuterRadius), myYCenter, myX1 -myRegMarkOffset]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myYCenter-myRegMarkOuterRadius, myX1-myTargetCenter, myYCenter+myRegMarkOuterRadius, myX1-myTargetCenter]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);

	//Bottom registration target.
	myBounds = [myY2+(myTargetCenter-myRegMarkInnerRadius), myXCenter-myRegMarkInnerRadius, myY2+ myTargetCenter+myRegMarkInnerRadius, myXCenter + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myY2+myRegMarkOffset, myXCenter, myY2+myTargetCenter+myRegMarkOuterRadius, myXCenter]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myY2+myTargetCenter, myXCenter-myRegMarkOuterRadius, myY2 + myTargetCenter, myXCenter+myRegMarkOuterRadius]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);

	//Right registration target.
	myBounds = [myYCenter-myRegMarkInnerRadius, myX2+(myTargetCenter-myRegMarkInnerRadius), myYCenter+myRegMarkInnerRadius, myX2 + myTargetCenter + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myYCenter, myX2+myRegMarkOffset, myYCenter, myX2+myTargetCenter+myRegMarkOuterRadius]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);
	myBounds = [myYCenter-myRegMarkOuterRadius, myX2+myTargetCenter, myYCenter+myRegMarkOuterRadius, myX2+myTargetCenter]
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer);

}
function myDrawLine(myBounds, myStrokeWeight, myRegistrationColor, myNoneSwatch, myLayer){
	app.activeWindow.activeSpread.graphicLines.add(myLayer, undefined, undefined,{strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds})
}
function myDrawTarget(myBounds, myStrokeWeight, myRegistrationColor, myNoneSwatch, myLayer){
	app.activeWindow.activeSpread.ovals.add(myLayer, undefined, undefined, {strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds})
}