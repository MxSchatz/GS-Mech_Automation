// Source JPG export script written by Kasyan Servetsky
// Revisions and customization written by Winter Schatz

// TO-DO:   + make sure it doesn't export the bleed size
//          + use activeProcess to make a failsafe
//          + change/investigate 'pdfExportPreferences' to JPG preferences
//          + fix save file error (doesn't know how to handle rewriting a file)
//          + fix save jpg error "Failed to export the JPEG file: Invalid page number specified"(occured on single page document 1704_1_223)

// G&S EXPORT PRESETS NECESSARY

//Global Variables
var doc = app.activeDocument;
var page = app.activeWindow.activePage;
var myDocument = app.activeDocument;
var myFileName;


//Sets PDF export options, then exports the active document as PDF.  
main();  
function main(){  

    //is there a open file?
    if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);

    //is there a page selected?
    if (app.activeWindow.constructor.name != "LayoutWindow") ErrorExit("Unable to get page number. Quit story editor.", true);
    
    //did the user save the file before exporting?
    if (doc.modified == false){ 
        // if saved, run the export functions
        LR_MOM_pdf();
        LR_MOM_jpg();  
        myTeardown();  
    } else {   
        alert("Save your file before continuing");   
    }    
 
}  

//<snippet>  
function LR_MOM_pdf(){   
    //Sets PDF export options, then exports the active document as PDF.      

    with(app.pdfExportPreferences){  
    app.pdfExportPresets.itemByName("LR_MOM_optimize");
    
    }  
    //Now export the document. You'll have to fill in your own file path.  

    myFileName = myDocument.fullName + "";

    if (myFileName.indexOf(".indd") != -1) {   
        var myRegularExpression = /.indd/gi;   
        myFileName = myFileName.replace(myRegularExpression, "_LRcover.pdf");
        myDocument.exportFile(ExportFormat.pdfType, new File(myFileName), false);       
    }  
}
//<snippet>  
function LR_MOM_jpg(){  

    //Sets PDF export options, then exports the active document as PDF.    
    with(app.pdfExportPreferences){ 

    // app.pdfExportPresets.itemByName("LR_MOM_optimize");
    pageRange = myDocument.layoutWindows[0].activePage.name;
    exportingSpread = false;
    jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
    pageString = page.name;
    exportResolution = 72; // The export resolution expressed as a real number instead of an integer. (Range: 1.0 to 2400.0)
    antiAlias = false; //  If true, use anti-aliasing for text and vectors during export
    embedColorProfile = false; // True to embed the color profile, false otherwise
    jpegColorSpace = JpegColorSpaceEnum.RGB; // One of RGB, CMYK or GRAY
    jpegQuality = JPEGOptionsQuality.LOW; // The compression quality: LOW / MEDIUM / HIGH / MAXIMUM
    jpegRenderingStyle = JPEGOptionsFormat.BASELINE_ENCODING; // The rendering style: BASELINE_ENCODING or PROGRESSIVE_ENCODING
    useDocumentBleeds = false; // If true, uses the document's bleed settings in the exported JPEG.
    }  
    //Now export the document. You'll have to fill in your own file path.
    
    myFileName = myDocument.fullName + ""; 
 
    var myRegularExpression = /.indd/gi;   
    myFileName = myFileName.replace(myRegularExpression, "_LRcover.jpg");  
    myDocument.exportFile(ExportFormat.JPG, new File(myFileName), false);  

    // doc.exportFile(ExportFormat.JPG, fileName);
    // var file = new File("~/Desktop/" + fileName);   
}  
//</snippet> 

//<teardown>  
function myTeardown(){  
    alert("Cover exports complete! They can be found in the same folder as the current file.");
}  
//</teardown>  