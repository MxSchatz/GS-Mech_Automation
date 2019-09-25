// Crops diagnosis
var name3;
var preset3 = app.pdfExportPresets.itemByName("HRcropsbleed_Layers");
var d = app.activeDocument;
var bleedBleed = app.activeDocument.documentPreferences.documentBleedTopOffset;

var cropsPreset = app.pdfExportPresets.item("HRcropsbleed_Layers");

with(cropsPreset){
    cropsPreset.useDocumentBleedWithPDF = true;
    cropsPreset.cropMarks = true;
    cropsPreset.pageMarksOffset = bleedBleed;
    // cropsPreset.pageMarksOffset = app.activeDocument.documentPreferences.documentBleedTopOffset;
}
// alert(cropsPreset.PDFExportPreference.pageMarksOffset);

name3 = thePath+"_HRcrops.pdf";
d.asynchronousExportFile(ExportFormat.PDF_TYPE, File(name3), false, cropsPreset);
