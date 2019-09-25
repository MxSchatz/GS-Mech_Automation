#target indesign

if (app.documents.length == 0) {
	alert("Please open a document and try again.", "Convert CMYK/RGB images to Grayscale", true);
	exit();
}

var doc = app.activeDocument,
links = doc.links,
i, link, image;

UpdateAllOutdatedLinks();

for (i = links.length-1; i >= 0; i--) {
	link = links[i];
	if (link.status == LinkStatus.NORMAL) {
		image = link.parent;
		if (image.space == "RGB" || image.space == "CMYK") {
			CreateBridgeTalkMessage(link.filePath);
		}
	}
}

UpdateAllOutdatedLinks();

//===================== FUNCTIONS ===============================
function CreateBridgeTalkMessage(imagePath) {
	var bt = new BridgeTalk();
	bt.target = "photoshop";
	bt.body = ResaveInPS.toSource()+"("+imagePath.toSource()+");";
	bt.onError = function(errObj) {
          $.writeln("Error: " + errObj.body);
     }
	bt.onResult = function(resObj) {}
	bt.send(30);
}
//--------------------------------------------------------------------------------------------------------------
function ResaveInPS(imagePath) {
	var psDoc;
	app.displayDialogs = DialogModes.NO;
	psDoc = app.open(new File(imagePath));
 	psDoc.changeMode(ChangeMode.GRAYSCALE);
 	psDoc.close(SaveOptions.SAVECHANGES);
	app.displayDialogs = DialogModes.ALL;
}
//--------------------------------------------------------------------------------------------------------------
function UpdateAllOutdatedLinks() {
	var link, c;
	for (c = doc.links.length-1; c >= 0; c--) {
		link = doc.links[c];
		if (link.status == LinkStatus.LINK_OUT_OF_DATE) link.update();
	}
}
//--------------------------------------------------------------------------------------------------------------