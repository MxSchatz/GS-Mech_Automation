// crop marks test

d = app.activeDocument;
var doc = app.activeDocument;
var page = app.activeWindow.activePage;
var myDocument = app.activeDocument;
var myFileName;
var name1;
var name2;
var name3;
var name4;
var name5;
var preset1 = app.pdfExportPresets.itemByName("LR_MOM_optimize"); 
var preset2 = app.pdfExportPresets.itemByName("HR Layers"); 
var preset3 = app.pdfExportPresets.itemByName("HRcropsbleed Layers");
var thePath;
// var currentDocSettings = ;

main();

function main(){  

    //is there a open file?
    if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);

    //is there a page selected?
    if (app.activeWindow.constructor.name != "LayoutWindow") ErrorExit("Unable to get page number. Quit story editor.", true);
    
    //did the user save the file before exporting?
    if (doc.modified == false){  

        // if saved, run the export functions
        
		HR_crops();
        myTeardown();  

    } else {   
        alert("Save your file before continuing");   
    }    
 
} 


function HR_crops(){

	with(app.pdfExportPreferences){  
	    pageRange = PageRange.ALL_PAGES;
	    exportingSpread = false;
	    cropMarks = true;
	    useDocumentBleeds = true; // If true, uses the document's bleed settings in the exported JPEG.
	    //use bleed marks to set up bleed mark offset?
	    // pageMarksOffset = currentDocSettings;
	    useDocumentBleedWithPDF = true;

	}

	var preset3 = app.pdfExportPresets.itemByName("HRcropsbleed Layers");
	app.pdfExportPresets.itemByName("HRcropsbleed Layers");
	name3 = thePath+"_HRcrops.pdf"; 

	d.asynchronousExportFile(ExportFormat.PDF_TYPE, File(name3), false, preset3);

}

function myTeardown(){  
    alert("Mech exports have started! Check background tasks for progress.");
}  
