// All rights reserved (c) 2015 by Id-Extras.com 
// Free to use and modify but do not delete this copyright attribution. 
// This script will export 2 pdfs of the current document 
// Choose the PDF presets by altering their names below 
// The second PDF gets a suffix added to its name. 
// Modify the line below beginning name2 = to change the suffix. 
// For more InDesign scripts: www.Id-Extras.com 

// Further and customization written by Winter Schatz
// To-Do


// d = app.activeDocument; 
d = app.activeDocument; 

// var p = app.activeWindow.activePage;
// var i = app.activeWindow.activePage;
// Here you can choose the PDF preset 
preset1 = app.pdfExportPresets.itemByName("LR_MOM_optimize"); 
preset2 = app.pdfExportPresets.itemByName("HR Layers"); 
preset3 = app.pdfExportPresets.itemByName("HRcropsbleed Layers");
if (!(preset1.isValid && preset2.isValid && preset3.isValid)){ 
 alert("One of the presets does not exist. Please check spelling carefully."); 
 exit(); 
} 
if (d.saved){ 
 thePath = String(d.fullName).replace(/\..+$/, "") + ".pdf";
  
 thePath = String(new File(thePath).saveDlg()); 
} 
else{ 
 thePath = String((new File).saveDlg()); 
}

/* WIP

if (p.saved){ 
 thePath = String(d.fullName).replace(/\..+$/, "") + ".pdf"; 
 thePath = String(new File(thePath).saveDlg()); 
} 
if (i.saved){ 
 thePath = String(d.fullName).replace(/\..+$/, "") + ".jpg"; 
 thePath = String(new File(thePath).saveDlg()); 
} 

*/

thePath = thePath.replace(/\.pdf$/, ""); 

// file suffixes
name1 = thePath+"_LRsingles.pdf"; 
name2 = thePath+"_HR.pdf"; 
name3 = thePath+"_HRcrops.pdf";
/* WIP Single pages
cover1 = thePath+"LRcover.pdf";
cover2 = thePath+"LRcover.jpg";
*/

//export location - Full Documents
d.exportFile(ExportFormat.PDF_TYPE, new File(name1), false, preset1); 
d.exportFile(ExportFormat.PDF_TYPE, new File(name2), false, preset2);
d.exportFile(ExportFormat.PDF_TYPE, new File(name3), false, preset3);

//export location - covers
/* WIP
p.exportFile(ExportFormat.PDF_TYPE, new File(cover1), false, preset1);
i.exportFile(ExportFormat.JPG, new File(cover2), false, preset1);
*/

