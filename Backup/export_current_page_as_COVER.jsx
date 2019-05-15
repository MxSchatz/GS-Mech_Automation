// Source JPG export script written by Kasyan Servetsky

// TO-DO:   + make sure it doesn't export the bleed size
//          + use activeProcess to make a failsafe
//          + event listener for export progress bar


// G&S EXPORT PRESETS NECESSARY

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
        pageRange = myDocument.layoutWindows[0].activePage.name;
        exportingSpread = false;
        pdfExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
        pageString = page.name;
        useDocumentBleeds = false; // If true, uses the document's bleed settings 
    }  
    // custom export profile, which overrides anything above
    app.pdfExportPresets.itemByName("LR_MOM_optimize");

    //Now export the document. You'll have to fill in your own file path.  
    myFileName = myDocument.fullName + "";

    if (myFileName.indexOf(".indd") != -1) {   
        var myRegularExpression = /.indd/gi;   
        myFileName = myFileName.replace(myRegularExpression, "_LRcover.pdf");

        //asynchronousExportFile utilizes InDesign background tasks
        myDocument.asynchronousExportFile(ExportFormat.pdfType, new File(myFileName), false);
    }  
}
//<snippet>  
function LR_MOM_jpg(){  

    //Sets PDF export options, then exports the active document as PDF. 
    var myDocument = app.activeDocument;   
    var myFileName;
    var page = app.activeWindow.activePage;
      
    with(app.jpegExportPreferences){ 

    // app.pdfExportPresets.itemByName("LR_MOM_optimize");
    jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
    pageRange = myDocument.layoutWindows[0].activePage.name;
    exportingSpread = false;
    pageString = page.name;
    exportResolution = 72; // The export resolution expressed as a real number instead of an integer. (Range: 1.0 to 2400.0)
    antiAlias = true; //  If true, use anti-aliasing for text and vectors during export
    embedColorProfile = false; // True to embed the color profile, false otherwise
    jpegColorSpace = JpegColorSpaceEnum.RGB; // One of RGB, CMYK or GRAY
    jpegQuality = JPEGOptionsQuality.LOW; // The compression quality: LOW / MEDIUM / HIGH / MAXIMUM
    jpegRenderingStyle = JPEGOptionsFormat.BASELINE_ENCODING; // The rendering style: BASELINE_ENCODING or PROGRESSIVE_ENCODING
    simulateOverprint = false; // If true, simulates the effects of overprinting spot and process colors in the same way they would occur when printing
    useDocumentBleeds = false; // If true, uses the document's bleed settings in the exported JPEG.
    }  
    //Now export the document. You'll have to fill in your own file path.
    
    myFileName = myDocument.fullName + ""; 
 
    var myRegularExpression = /.indd/gi;   
    myFileName = myFileName.replace(myRegularExpression, "_LRcover.jpg");  
    myDocument.ExportFile(ExportFormat.JPG, new File(myFileName), false);

    // doc.exportFile(ExportFormat.JPG, fileName);
    // var file = new File("~/Desktop/" + fileName);   
}  
//</snippet> 

//<teardown>  
function myTeardown(){  
    alert("Cover exports complete! They can be found in the same folder as the current file.");
}  
//</teardown>  