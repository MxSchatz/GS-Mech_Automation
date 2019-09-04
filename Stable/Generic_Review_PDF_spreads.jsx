// All rights reserved (c) 2015 by Id-Extras.com 
// Free to use and modify but do not delete this copyright attribution. 
// Further features and customization written by Winter Schatz

// d = app.activeDocument; 
d = app.activeDocument; 

//Pulls PDF preset from the library
var preset1 = app.pdfExportPresets.itemByName("LR_MOM_optimize_spreads");

// Here you can choose the PDF preset + Overrides preferences above

/*
with(app.pdfExportPreferences){
	pageRange = PageRange.ALL_PAGES;
	exportingSpread = true;
}
*/

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
name1 = thePath+"_LRpreview_spreads.pdf"; 

//export location - Full Documents
d.asynchronousExportFile(ExportFormat.PDF_TYPE, new File(name1), false, preset1); 


