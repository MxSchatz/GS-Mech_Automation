// All rights reserved (c) 2015 by Id-Extras.com 
// Free to use and modify but do not delete this copyright attribution. 
// Further and customization written by Winter Schatz

// To-Do

// d = app.activeDocument; 

// var p = app.activeWindow.activePage;
// var i = app.activeWindow.activePage;

// Here you can choose the PDF preset 

//Sets PDF export options, then exports the active document as PDF.
d = app.activeDocument;
var doc = app.activeDocument;
var page = app.activeWindow.activePage;
var myDocument = app.activeDocument;
var myFileName;
var name1;
var name2;
var name3;
var preset1 = app.pdfExportPresets.itemByName("LR_MOM_optimize"); 
var preset2 = app.pdfExportPresets.itemByName("HR Layers"); 
var preset3 = app.pdfExportPresets.itemByName("HRcropsbleed Layers");
var thePath;

main();  

function main(){  

    //is there a open file?
    if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);

    //is there a page selected?
    if (app.activeWindow.constructor.name != "LayoutWindow") ErrorExit("Unable to get page number. Quit story editor.", true);
    
    //did the user save the file before exporting?
    if (doc.modified == false){  

        // if saved, run the export functions
        LR_MOM_singles();
        HR_singles();
        HR_crops();
        myTeardown();  

    } else {   
        alert("Save your file before continuing");   
    }    
 
} 

function LR_MOM_singles(){

	with(app.pdfExportPreferences){  
	    pageRange = PageRange.ALL_PAGES;
	    exportingSpread = false;
	    useDocumentBleeds = false; // If true, uses the document's bleed settings in the exported JPEG.
	}

	if (d.saved){ 
	 thePath = String(d.fullName).replace(/\..+$/, "") + ".pdf";
	 thePath = String(new File(thePath).saveDlg()); 
	} 
	else{ 
	 thePath = String((new File).saveDlg()); 
	}

	thePath = thePath.replace(/\.pdf$/, "");

 	preset1 = app.pdfExportPresets.itemByName("LR_MOM_optimize");
	app.pdfExportPresets.itemByName("LR_MOM_optimize");

	name1 = thePath+"_LRsingles.pdf";
	// d.exportFile(ExportFormat.PDF_TYPE, new File(name1), false, preset1); 


}



function HR_singles(){

	with(app.pdfExportPreferences){  
	    pageRange = PageRange.ALL_PAGES;
	    exportingSpread = false;
	    useDocumentBleeds = false; // If true, uses the document's bleed settings in the exported JPEG.
	}

	var preset2 = app.pdfExportPresets.itemByName("HR Layers"); 
	app.pdfExportPresets.itemByName("HR Layers");
	name2 = thePath+"_HR.pdf";

	// d.exportFile(ExportFormat.PDF_TYPE, new File(name2), false, preset2); 

}



function HR_crops(){

	with(app.pdfExportPreferences){  
	    pageRange = PageRange.ALL_PAGES;
	    exportingSpread = false;
	    cropMarks = true;
	    useDocumentBleeds = true; // If true, uses the document's bleed settings in the exported JPEG.
	    //use bleed marks to set up bleed mark offset?

	}

	var preset3 = app.pdfExportPresets.itemByName("HRcropsbleed Layers");
	app.pdfExportPresets.itemByName("HRcropsbleed Layers");
	
	name3 = thePath+"_HRcrops.pdf";
	// d.exportFile(ExportFormat.PDF_TYPE, new File(name3), false, preset3); 

}

// file suffixes
 

/* WIP Single pages
cover1 = thePath+"LRcover.pdf";
cover2 = thePath+"LRcover.jpg";
*/


//export location - covers
/* WIP
p.exportFile(ExportFormat.PDF_TYPE, new File(cover1), false, preset1);
i.exportFile(ExportFormat.JPG, new File(cover2), false, preset1);
*/

function myTeardown(){  

	d.asynchronousExportFile(ExportFormat.PDF_TYPE, new File(name1), false, preset1);
	d.asynchronousExportFile(ExportFormat.PDF_TYPE, new File(name2), false, preset2);
	d.asynchronousExportFile(ExportFormat.PDF_TYPE, new File(name3), false, preset3);
    alert("Mech exports have started! Check background tasks for progress.");
}  
