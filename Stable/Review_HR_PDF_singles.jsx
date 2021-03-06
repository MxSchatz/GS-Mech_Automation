// All rights reserved (c) 2015 by Id-Extras.com
// Free to use and modify but do not delete this copyright attribution.
// Further features and customization written by Winter Schatz

// This s

// d = app.activeDocument;
d = app.activeDocument;


// Here you can choose the PDF preset + Overrides preferences above
preset1 = app.pdfExportPresets.itemByName("HR_Layers_Singles");

// Error Reporting
if (!(preset1.isValid)){
 alert("One of the presets does not exist. Please check spelling carefully.");
 exit();
}

//export preferences
with(app.pdfExportPreferences){
    pageRange = PageRange.ALL_PAGES;
    exportingSpread = false;
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
name1 = thePath+"_HRpreview.pdf";

//export location - Full Documents
d.asynchronousExportFile(ExportFormat.PDF_TYPE, new File(name1), false, preset1);


