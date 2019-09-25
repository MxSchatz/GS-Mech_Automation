// Wireframe by Id-Extras.com
// Further and customization written by Winter Schatz


//global variables
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
    d.asynchronousExportFile(ExportFormat.PDF_TYPE, new File(name1), false, preset1);

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
    d.asynchronousExportFile(ExportFormat.PDF_TYPE, File(name2), false, preset2);

}



function HR_crops(){

    d = app.activeDocument;
    var cOffset = app.activeDocument.documentPreferences.documentBleedTopOffset;

    var cropsPreset = app.pdfExportPresets.item("HRcropsbleed_Layers");
    cropsPreset.useDocumentBleedWithPDF = true;
    cropsPreset.cropMarks = true;
    cropsPreset.pageMarksOffset = cOffset;

    name3 = thePath+"_HRcrops.pdf";

    d.asynchronousExportFile(ExportFormat.PDF_TYPE, File(name3), false, cropsPreset);

}


function myTeardown(){
    alert("Mech exports have started! Check background tasks for progress.");

        //this is here to bring the export settings to something normal afterwards
    with(app.pdfExportPreferences){
        pageRange = PageRange.ALL_PAGES;
        exportingSpread = false;
        useDocumentBleeds = false;
    }

}
