﻿//DESCRIPTION: 'Unpaste' pasted images
// Peter Kahrel -- www.kahrel.plus.com

// Pasted images (images without a link in the Links panel)
// are written on disk in the selected directory
// Images can be linked.

(function () {
	
	var problems = 0;

	function scriptPath () {
		try {
			return app.activeScript;
		} catch (e) {
			return File (e.fileName);
		}
	}

	function saveData (obj) {
		var f = File (scriptPath().fullName.replace (/\.jsx?(bin)?$/, '.txt'));
		f.open ('w');
		f.write (obj.toSource());
		f.close ();
	}


	function getPrevious () {
		var f = File (scriptPath().fullName.replace (/\.jsx?(bin)?$/, '.txt'));
		if (f.exists){
			return $.evalFile(f);
		}
		return {
			format: 'EPS',
			create_links: true,
			folder: app.documents[0].filePath+'/'
		};
	}


	function get_outfolder (dir) {
		//return Folder (app.documents[0].fullName.path);
		var e;
		try {
			var f = Folder (dir).selectDlg();
		} catch (e) {
			alert (e.message);
			exit();
		}
		if (f === null) exit();
		return f;
	}


	function unique_name (base, type) {
		function strip_base (s) {
			return s.replace(/_\d+$/,'');
		}
		var n = 0;
		while (File (base+type).exists) {
			base = strip_base (base) + '_' + String (++n);
		}
		return base+type;
	}

	function pasted_graphics (array) {
		for (var i = array.length-1; i >= 0; i--) {
			if (array[i].itemLink == null) {
				return true;
			}
		}
		return false;
	}


	function get_format (previous) {
		var export_enums = [ExportFormat.EPS_TYPE, ExportFormat.JPG, ExportFormat.PNG_FORMAT];
		var w = new Window ('dialog {text: "Save pasted images", alignChildren: "left", properties: {closeButton: false}}');
			var g1 = w.add ('panel {orientation: "row"}');
				g1.add ('statictext', undefined, 'Export format: ');
			var format = g1.add ('dropdownlist', [0,0,160,22], ['EPS', 'JPEG', 'PNG']);
			var link = w.add ('checkbox {text: "Create links"}');
			var buttons = w.add ('group {alignment: "right"}');
				buttons.add ('button', undefined, 'OK', {name: 'ok'});
				buttons.add ('button', undefined, 'Cancel', {name: 'cancel'});

		format.selection = format.find (previous.format);
		link.value = previous.create_links;
		
		if (w.show () == 2) {
			exit();
		}

		var o = {
			format: format.selection.text, 
			enum_type: export_enums [format.selection.index],
			create_links: link.value
		};
		w.close();
		return o;
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------------

	function scratch () {
		var d = app.documents.add ({visible: true, zeroPoint: [0,0]});
		d.pages[0].marginPreferences.properties = {top: 0, left: 0, bottom: 0, right: 0};
		return d;
	}


	function export_eps (im, f) {
		var gb = im.parent.geometricBounds;
		var d = scratch();
		try {
			var dupl = im.parent.duplicate (d.pages[0]);
			if (!(dupl instanceof Rectangle)) {
				dupl.convertShape (ConvertShapeOptions.CONVERT_TO_RECTANGLE);
			}
			dupl.clearTransformations();
			try {
				dupl.images[0].clearTransformations();
				dupl.images[0].fit (FitOptions.FRAME_TO_CONTENT);
			} catch (_) {
			}

			gb = dupl.geometricBounds;
			d.documentPreferences.properties = {
				pageHeight: gb[2] - gb[0],
				pageWidth: gb[3] - gb[1]
			}
			
			dupl.move (d.pages[0]);
			dupl.move ([0, 0]);
			dupl.move (d.pages[0]);
			dupl.exportFile (ExportFormat.epsType, f);
		} catch (_) {
		} finally {
			d.close (SaveOptions.NO);
		}
	}


	function export_other (im, type, f) {
		try {
			var duped = im.duplicate();
			try {
				duped.images[0].clearTransformations();
				duped.images[0].fit (FitOptions.FRAME_TO_CONTENT);
			} catch (_) {
			}
			duped.exportFile (type, f, false);
			duped.remove();
		} catch (e) {
			problems += 1;
		}
	}

	//-----------------------------------------------------------------------------------------------------------------------------------------
	
	function unembed_images () {
		var problems = [];
		var previous = getPrevious();
		var doc = app.documents[0];
		var outfolder = get_outfolder(previous.folder);
		if (doc.saved) {
			var outname = outfolder + '/' + doc.name.replace (/\.indd$/, '_0');
		} else {
			var outname = outfolder + '/untitled___0';
		}
	
		var image_file;
		var g = doc.allGraphics;
		if (pasted_graphics (g)) {
			var export_data = get_format (previous);
		} else {
			export_data = {format: '', create_links: true};
		}
	
		for (var i = 0; i < g.length; i++) {
			if (g[i].itemLink == null) {
				//image_file = File (outname + (n++) + '.' + export_data.format);
				image_file = File (unique_name (outname, '.'+export_data.format));
				if (export_data.format == 'EPS') {
					export_eps (g[i], image_file);
				} else {
					export_other (g[i], export_data.enum_type, image_file);
				}
				if (export_data.create_links) {
					g[i].parent.place (image_file);
				} else {
					g[i].parent.remove ();
				}
			} else if (g[i].itemLink.status === LinkStatus.linkEmbedded) {
				app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
				g[i].itemLink.unembed(outfolder);
				app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
			}
		}
	
		saveData ({
			folder: outfolder,
			format: export_data.format, 
			create_links: export_data.create_links
		});

		if (problems.length) {
			alert ('Not all images dumped.')
		}
	
	}

	//-------------------------------------------------------------------------------------------------------------------
	
	if (app.documents.length === 0) {
		alert ('Open a document.'); exit();
	}
	unembed_images();

}());