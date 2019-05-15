// All rights reserved (c) 2015 by Id-Extras.com 
// Free to use and modify but do not delete this copyright attribution. 
// Features and customization written by Winter Schatz

d = app.activeDocument; 

//export preferences
with(app.pdfExportPreferences){
	pageRange = PageRange.ALL_PAGES;
	exportingSpread = false;
}

// Here you can choose the PDF preset + Overrides preferences above 
preset1 = app.pdfExportPresets.itemByName("LR_MOM_optimize");

// Error Reporting
if (!(preset1.isValid)){ 
 alert("One of the presets does not exist. Please check spelling carefully."); 
 exit(); 
} 

// Save Setup
if (d.saved){ 
 thePath = String(d.fullName).replace(/\..+$/, "") + ".pdf";
 thePath = String(new File(thePath).saveDlg()); 
} 
else{ 
 thePath = String((new File).saveDlg()); 
}

thePath = thePath.replace(/\.pdf$/, ""); 

// file suffix
name1 = thePath+"_LRpreview.pdf"; 

//export location - Full Documents
d.asynchronousExportFile(ExportFormat.PDF_TYPE, new File(name1), false, preset1); 
alert("Export has begun! Check the document's current file path");

