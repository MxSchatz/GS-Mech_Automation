//DESCRIPTION: Manage and execute GREP queries
// Peter Kahrel -- www.kahrel.plus.com

#targetengine grep_query_manager1;

var sortOrder = 'ascending';

if (parseInt (app.version) > 5) {
	var title = "GREP query manager1"
	var w = Window.find ("palette", title);
	if (w != null) {
		w.show();
	} else {
		try {
			show_grep_queries (title)
		} catch (e) {
			alert (e.message + "\r(line " + e.line + ")");
		};
	}
}


function show_grep_queries (title) {
	
	function isText () {
		return app.documents.length && app.selection.length 
			&& (app.selection[0].hasOwnProperty("baseline") || app.selection[0].constructor.name === "TextFrame");
	}
	
	function populate_ddlist () {
		var array = [];
		if (app.documents.length > 0) array.push ("Document");
		if (app.documents.length > 1) array.push ("All documents");
		if (isText()) {array.push("Story"); array.push("Selection");}
		if (app.books.length > 0) array.push("Book");
		array.push ("Folder");
		return (array);
	}

	// BEGIN show_grep_queries
//~ 	var defaultFont = ScriptUI.applicationFonts.palette.name+":15.0";
//~ 	var buttonFont = ScriptUI.applicationFonts.palette.name+":14.0";
	var scriptFolder = script_folder();
	var queryFolder = app.scriptPreferences.scriptsFolder.parent.parent + "/Find-Change Queries/Grep/";
	var gr_editor = File (scriptFolder+"/grep_editor.jsx");
	var HISTORY = read_previous ();
	if (HISTORY == null || HISTORY.folder === undefined)
		var QTARGETFOLDER = "";
	else
		var QTARGETFOLDER = HISTORY.folder;
	var dd_items = populate_ddlist();
	var BUTTONS = define_buttons ();
	var w = new Window ("palette", title, undefined, {resizeable: true});
		try {w.location = HISTORY.location}catch(_){};
		w.orientation = "row";
		w.alignChildren = ["top", "top"];
//~ 		w.listContainer = w.add ('group');
//~ 		var QList = w.listContainer.add ("listbox", undefined, undefined, 
		var QList = w.add ("listbox", undefined, undefined, 
			{numberOfColumns: 3, showHeaders: true, 
				columnTitles: ["Query", "Find what", "Change to"], multiselect: true,
				columnWidths: [150, 250, 100]});
//~ 				columnWidths: HISTORY.col_widths});
			QList.id = "QueryList";
			QList.minimumSize.width = 500;
			// The try guards against the history file not being found
			try {QList.size = HISTORY.qlist_size;}catch(_){}
			QList.alignment = ["fill", "fill"];
			
		var fi=QList.add('Item','FakeItem');  // pre-CC/Windows 10 display fix
		QList.remove(fi);
		
		
		// the panel on the right with all the buttons etc.
		var buttons = w.add ("group"); buttons.orientation = "column"; buttons.alignChildren = "fill"; buttons.alignment = ["right", "top"];
			var chain_panel = buttons.add ("panel"); chain_panel.alignChildren = "fill"; chain_panel.orientation = "column";
				var chain_group = chain_panel.add ("group"); 
					var chain_dd = chain_group.add ("group");
						chain_dd.add ("statictext", undefined, "Chains:");
						var ChainList = chain_dd.add ("dropdownlist", undefined, chain_names ());
						ChainList.maximumSize.width = 130;
						ChainList.alignment = ["fill","fill"];
						ChainList.id = "ChainList";
					var chain_icons = chain_group.add ("group"); //chain_icons.alignChildren = ["fill", "fill"];
						var new_chain = chain_icons.add ("iconbutton", undefined, BUTTONS.save, {style: "toolbutton"});
						new_chain.preferredSize = [20,20];
						var delete_chain = chain_icons.add ("iconbutton", undefined, BUTTONS.bin, {style: "toolbutton"});
						delete_chain.preferredSize = [20,20];
			
			var target_panel = buttons.add ("panel"); target_panel.orientation = "row";
				target_panel.add ("statictext", undefined, "Search:");
				dd_list = target_panel.add ("dropdownlist", undefined, dd_items);
				dd_list.preferredSize.width = 150;
				dd_list.selection = 0;

			var execute_panel = buttons.add ("panel"); execute_panel.alignChildren = "fill";
				var execute_b = execute_panel.add ("button", undefined, "Execute query");
				var collect = execute_panel.add ("checkbox", undefined, " Collect found items");
				var format = execute_panel.add ("checkbox", undefined, " Include format");
				var pagenums = execute_panel.add ("checkbox", undefined, " Add page numbers");

			var p1 = buttons.add ("panel"); p1.alignChildren = "fill";
				var grep_editb = p1.add ("button", undefined, "Edit query in GREP editor");
					grep_editb.helpTip = "Load the selected query in the stand-alone GREP editor.\n(Right-click the query to edit it in the built-in editor.)"
				var copy_to_FC_b = p1.add ("button", undefined, "Query to F/C dialog");
				var gr_style = p1.add ("button", undefined, "Query to GREP style");

				var manage_buttons = p1.add ("group"); //manage_buttons.orientation = "row"; manage_buttons.alignChildren = "fill";
					var bw = [0,0,20,30];
					var duplicate_b = manage_buttons.add ("iconbutton", bw, BUTTONS.copy, {style: "toolbutton"});
					var rename_b = manage_buttons.add ("iconbutton", bw, BUTTONS.rename, {style: "toolbutton"});
					var delete_b = manage_buttons.add ("iconbutton", bw, BUTTONS.bin, {style: "toolbutton"});
					var update_b = manage_buttons.add ("iconbutton", bw, BUTTONS.update, {style: "toolbutton"});
					var edit_b = manage_buttons.add ("iconbutton", bw, BUTTONS.view, {style: "toolbutton"});
					var print_b = manage_buttons.add ("iconbutton", bw, BUTTONS.print, {style: "toolbutton"});
					var help_b = manage_buttons.add ("iconbutton", bw, BUTTONS.info, {style: "toolbutton", toggle: true});
//~ 					for (var i = 0; i < manage_buttons.children.length; i++)
//~ 						manage_buttons.children[i].preferredSize = [20, 20];

				var close_b = buttons.add ("button", undefined, "Close");
				
				// helptip madness
				help_b.onClick = function () {SetHelpTips (help_b.value)};
				
				function SetHelpTips (val) {
					if (val) {
						new_chain.helpTip = "Save the selected queries as a new chain.";
//~ 						rename_chain.helpTip = "Rename the selected chain.";
						delete_chain.helpTip = "Delete the selected chain \n(the queries defined in the chain \nwill not be deleted).";
						
						execute_b.helpTip = "Run the selected queries one after the other \n(i.e. chain the selected queries).";
						collect.helpTip = "Collect the find results and \nplace them in a new document. ";
						format.helpTip = "When collecting the find results, \ninclude applied text formatting.";
						pagenums.helpTip = "When collecting the find results, \nprint the numbers of the pages where the search items were found.";
						
						grep_editb.helpTip = "Edit the selected query in the stand-alone GREP editor.";
						copy_to_FC_b.helpTip = "Copy the selected query to InDesign's Find/Change dialog.";
						gr_style.helpTip = "Copy all selected queries to GREP styles in paragraph styles.";
						
						duplicate_b.helpTip = "Duplicate the selected query.";
						rename_b.helpTip = "Rename the selected query.";
						delete_b.helpTip = "Delete the selected quer(y|ies) from disk.";
						update_b.helpTip = "Update the query list whenever you add or delete queries in the Find/Change dialog. Or to sort or reverse the sort of the list";
						edit_b.helpTip = "View/edit the selected query in the built-in editor.";
						help_b.helpTip = "Disable helptips.";
						close_b.helpTip = "Close window and save settings.";
						print_b.helpTip = "Export query details (find what and \nchange to) to an InDesign document";
					} else {
						new_chain.helpTip = ""; /*rename_chain.helpTip = "";*/ delete_chain.helpTip = "";
						execute_b.helpTip = ""; collect.helpTip = ""; format.helpTip = ""; pagenums.helpTip = "";
						grep_editb.helpTip = ""; copy_to_FC_b.helpTip = ""; gr_style.helpTip = "";
						duplicate_b.helpTip = ""; rename_b.helpTip = ""; delete_b.helpTip = ""; update_b.helpTip = "";
						edit_b.helpTip = ""; help_b.helpTip = "Enable helptips."; close_b.helpTip = ""; print_b.helpTip = "";
					}
				} // SetHelpTips

			// Mysteriously, fonts must be set here. I'd have thought it would work 
			// in the onShow() function, below, but it doesn't.
//~ 			set_font (w, defaultFont);
//~ 			set_font (buttons, buttonFont);
			
	// End interface -----------------------------------------------------------------------------------------------

	function read_previous () {
		var f = File (scriptFolder+"grep_query_manager.txt");
		f.open ("r"); 
		var o = eval (f.read());
		f.close();
		return o;
	}
	
	print_b.onClick = function () {
		export_queries(QList);
	};

	close_b.onClick = function () {
//~ 		#include reflection.jsxinc
//~ 		var cw = QList.columns.preferredWidths;
//~ 		prop(QList.columns.titles[0]);
//~ 		$.writeln (">"+QList.properties.columnWidths)

			function plain_array (list) {
				var temp = [];
				if (list !== null) {
					for (var i = 0; i < list.length; i++) {
						temp.push (list[i].text);
					}
				}
				return temp;
			} // plain_array

		// begin close_b.onClick
		var o = {
			location: [w.location[0],w.location[1]],
			qlist_size: [QList.size[0], QList.size[1]],
			col_widths: QList.properties.columnWidths,
			chain: (ChainList.selection == null ? "[Custom]" : ChainList.selection.text),
			queries: plain_array (QList.selection),
			collect_items: collect.value,
			helptips: help_b.value,
			folder: QTARGETFOLDER
		}
		var f = File (scriptFolder+"grep_query_manager.txt");
		f.open ("w"); 
		f.write (o.toSource()); 
		f.close();
		w.close();
	} // close_b.onClick


	if (!gr_editor.exists) {grep_editb.enabled = false;}
//~ 	gr_style.enabled = execute_panel.enabled = app.documents.length > 0;
	gr_style.enabled = app.documents.length > 0;
	if (parseInt (app.version) <= 5) {
		gr_style.enabled = false;
	}
	update_b.onClick = function () {
		updateList (QList, QList.selection[0].text);
		sortOrder = sortOrder == 'ascending' ? 'descending' : 'ascending';
	}
	copy_to_FC_b.onClick = copy_to_FC;
	QList.onDoubleClick = copy_to_FC;
	
	
	dd_list.onActivate = function () {
		
		function insert_item (dd, str) {
			if (!dd.find (str)) {
				dd.add("item", str);
			}
		}
	
		switch (app.documents.length) {
			case 0: dd_list.remove (dd_list.find ("Document")); dd_list.remove (dd_list.find ("All documents")); break;
			case 1: dd_list.remove (dd_list.find ("All documents"));
						insert_item (dd_list, "Document", 0); break;
			default: insert_item (dd_list, "Document", 0);
							insert_item (dd_list, "All documents", 0);
			}
		app.books.length == 0 ? dd_list.remove (dd_list.find ("Book")) : insert_item(dd_list, "Book");
		if (isText()) {
			insert_item (dd_list, "Story"); 
			insert_item (dd_list, "Selection"); 
		} else {
			dd_list.remove (dd_list.find ("Story")); 
			dd_list.remove (dd_list.find ("Selection"))
		};
	} // dd_list.onActivate

	dd_list.onDeactivate = function () {
		if (dd_list.selection == null) {
			dd_list.selection = 0;
		}
	}

	function refresh (control) {
		var wh = control.size;
		control.size = [1+wh[0], 1+wh[1]];
		control.size = [wh[0], wh[1]];
	}


	edit_b.onClick = function () {
		EditQuery ({button: 2});
	}
	
	QList.addEventListener ("mousedown", function (k) {EditQuery (k)});
	
	function updateList (QList, select) {
		var xml, qname, find_what, change_to, f;
		var queries = Folder (queryFolder).getFiles ("*.xml");
		if (sortOrder == 'ascending') {
			queries.sort (function(a,b){return a.name.toLowerCase() > b.name.toLowerCase()});
		} else {
			queries.sort (function(a,b){return a.name.toLowerCase() < b.name.toLowerCase()});
		}
		QList.removeAll();
		for (var i = 0; i < queries.length; i++) {
			qname = decodeURI (queries[i].name).replace (/\.xml$/, "");
			try {
				queries[i].open ("r");
				xml = new XML (queries[i].read ());
				queries[i].close();
				find_what = String (xml.Description.FindExpression.@value);
				change_to = xml.Description.ReplaceExpression.@value;
				with (QList.add ("item", qname)) {
					subItems[0].text = ((find_what == "") ? "----" : find_what);
					subItems[1].text = ((change_to == "") ? "----" : change_to);
				}
			} catch (_) {
			}
		}
		if (select == "") {
			QList.selection = 0;
		} else {
			var ix = QList.find (select).index;
			QList.selection = ix;
			if (ix < QList.items.length-5) {
				QList.revealItem (ix+5);
			} else {
				QList.revealItem (QList.items.length-1);
			}
		}
		refresh (QList);
		ChainList.active = true;
	} // updateList
	

	function EditQuery (k)
		{
			function SaveQuery (list_item, find, change)
				{ // We can't use JS's XML object because it truncates the XML tags. It does so legally but the F/C dialog 
					// can't cope with them, which is why the script deals with the XML as a simple string.
				var f = File (queryFolder + list_item.text + ".xml");
//~ 				f.encoding = "utf-8";
				f.open ("r");
				var s = f.read();
				f.close();
				s = s.replace (/FindExpression value=.*/, "FindExpression value=\"" + encode_grep_for_query (list_item.subItems[0].text) + "\">");
				// We need to avoid using $+digit as a replacement. Therefore add a dummy (here "$£@£#") after $ so as to split up $ and digit.
				var repl = list_item.subItems[1].text.replace (/\$/g, "$£@£#");
				if (repl === "----") {repl = "";}
				s = s.replace (/ReplaceExpression value=.*/, "ReplaceExpression value=\"" + repl +"\">");
				// Now remove the dummy
				s = s.replace (/£@£#/g, "");
				f.open("w");
				f.write(s);
				f.close();
				}
			
		// BEGIN EditQuery
		if (k.button == 2)  // if right-button pressed
			{
			var findwhat = QList.selection[0].subItems[0].text;
			var w1 = new Window ("dialog", QList.selection[0].text, undefined, {closeButton: false});
			w1.alignChildren = "right";
			if (parseInt(app.version) < 8) {
				var e1 = w1.add ("edittext", undefined, prettied (findwhat), {multiline: true});
				var e2 = w1.add ("edittext", undefined, QList.selection[0].subItems[1].text, {multiline: true});
			} else {
				var e1 = w1.add ("edittext", undefined, prettied (findwhat), {multiline: true, wantReturn: true});
				var e2 = w1.add ("edittext", undefined, QList.selection[0].subItems[1].text, {multiline: true, wantReturn: true});
			}
			e1.preferredSize = [500,300];
			e2.preferredSize = [500,50];
						
			var w1_buttons = w1.add ("group");
			
			if (parseInt(app.version) < 8) {
				w1_buttons.alignment = "fill"; w1_buttons.orientation = "stack";
				var newL = w1_buttons.add ("group"); newL.alignment = "left";
				var newline = newL.add ("button", undefined, "\u00B6");
				newline.onClick = function () {try {e1.textselection = "\r"} catch (_){}}
			}
			var bgrp = w1_buttons.add ("group"); bgrp.alignment = "right";
				var save_expr = bgrp.add ("button", undefined, "Save changes", {name:"ok"});
				bgrp.add ("button", undefined, "Cancel", {name: "cancel"});
			
			save_expr.onClick = function () {
				QList.selection[0].subItems[0].text = e1.text;
				QList.selection[0].subItems[1].text = e2.text;
				SaveQuery (QList.selection[0]);
				w1.close();
			}
			//set_font (w1, defaultFont);
			w1.show ();
			}
		}

	
	function prettied (s) {
		s = s.replace (/\(\?#\)/g, "\r");
		return s.replace (/\(\?#T\)/g, "	");
	}


	delete_b.onClick = function () {
		if (QList.selection.length == 1) {
			var s = "Delete selected query?";
		} else {
			var s = "Delete selected queries?";
		}
		if (AskYN (s)) {
			var le = QList.selection.length;
			var first = QList.selection[0].index;
			// delete the queries on disk
			for (var i = 0; i < le; i++) {
				File (queryFolder + QList.selection[i].text +".xml").remove();
			}
			// delete items from the list
			if (le == 1) {
				QList.remove (QList.selection[0]);
			} else {
				var array = QList.selection.reverse();
				for (var i = 0; i < le; i++) {
					QList.remove (array[i]);
				}
			} // if (le
			if (QList.items.length > 0) {
				QList.selection = first;
			}
		} // if (ask_yn
	} // delete_b.onClick


	QList.onChange = function ()
		{ // If the list is single-clicked, check the appearance of the buttons
		if (QList.selection != null)
			{
//~ 			gr_style.enabled = execute_panel.enabled = app.documents.length > 0;
			gr_style.enabled = app.documents.length > 0;
			copy_to_FC_b.enabled = grep_editb.enabled = rename_b.enabled = duplicate_b.enabled = QList.selection.length == 1;
			new_chain.enabled = QList.selection.length > 1;
			if (QList.selection.length == 1)
				{
				ChainList.selection = ChainList.find("[Custom]");
//~ 				delete_b.text = "Delete selected query";
				gr_style.text = "Query to GREP style";
				execute_b.text = "Execute query";
				}
			else
				{
//~ 				delete_b.text = "Delete selected queries";
				gr_style.text = "Queries to GREP style";
				execute_b.text = "Execute queries";
				}
			} // if (QList.selection
		ChainList.active = true;
		} // QList.onChange
	

	grep_editb.onClick = function () {
//~ 		EditQuery ({button: 2})
		if (Window.find ("palette", "A GREP editor") == null)
			app.doScript (gr_editor);
		var gr_editor_window = Window.find ("palette", "A GREP editor");
		if (!gr_editor_window.visible) gr_editor_window.show();
		var ew = gr_editor_window.findElement ("grep_edit_window");
		ew.text = prettied (QList.selection[0].subItems[0].text);
	}


	function copy_to_FC () {
		try {
			app.loadFindChangeQuery (QList.selection[0].text, SearchModes.grepSearch);
			if (app.changeGrepPreferences.changeTo == "----")
				app.changeGrepPreferences.changeTo = "";
			}
		catch (_) {alert ("Error loading " + QList.selection[0].text); exit()}
	}
			
	// Copy GREP expr. to GREP styles
	if (parseInt (app.version) > 5)  // No GREP styles in CS3
		{
		gr_style.onClick = function ()
			{
					function fetch_stylenames (all_names)
						{
							function fetch_path (s, str)
								{
								while (s.parent.constructor.name != 'Document')
									return fetch_path (s.parent, s.parent.name + ' > ' + str);
								return str;
								} // fetch_path

						// BEGIN fetch_stylenames
						for (var i = 0; i < all_names.length; i++)
							all_names[i] = fetch_path (all_names[i], all_names[i].name);
						all_names.shift(); // Get rid of [No Paragraph]
						return all_names;
						} // fetch_stylenames
					
					function style_from_string (s, type)
						// Return a style object from a string like "group > group > name"
						// "type" is "character" or "paragraph"
						{
						var array = s.split (' > ');
						var str = type+"Styles.item ('" + array.pop() + "')";
						for (var i = array.length-1; i > -1; i--)
							str = type+"StyleGroups.item ('" + array[i] + "')." + str;
						return eval ("app.activeDocument." + str)
						}
					
			// BEGIN gr_style.onClick
			var psnames = fetch_stylenames (app.activeDocument.allParagraphStyles);
			var csnames = fetch_stylenames (app.activeDocument.allCharacterStyles);
			psnames.shift();
			var w1 = new Window ("dialog", "Copy queries to GREP styles", undefined, {closeButton: false});
				var panel = w1.add ("panel"); panel.alignChildren = "fill";
					var pstylegroup = panel.add ("group"); 
					pstylegroup.alignChildren = "fill"; 
					pstylegroup.orientation = "column";
						pstylegroup.add ("statictext", undefined,  "Select paragraph style(s):");
						var pstyles = pstylegroup.add ("listbox", undefined, psnames, {multiselect: true});
						pstyles.preferredSize = [300, 300];
					var cstylegroup = panel.add ("group"); cstylegroup.orientation = "row";
						cstylegroup.add ("statictext", undefined,  "Select character style:");
						var cstyle = cstylegroup.add ("dropdownlist", undefined, csnames);
						cstyle.preferredSize.width = 200;
						cstyle.selection = 0;
				var buttons = w1.add ("group"); buttons.alignment = "right"
					var ok = buttons.add ("button", undefined, "OK", {name: "ok"});
					buttons.add ("button", undefined, "Cancel", {name: "cancel"});
					ok.enabled = false;

			pstyles.onChange = function () {ok.enabled = pstyles.selection != null;}

			if (w1.show () == 1)
				{
				var i, j, gr;
				for (var d = 0; d < app.documents.length; d++)
					{
					app.activeDocument=app.documents[d];
					var cs = style_from_string (cstyle.selection.text, "character");
					for (j = 0; j < QList.selection.length; j++)
						{
						gr = strip_for_dialog (QList.selection[j].subItems[0].text);
						for (i = 0; i < pstyles.selection.length; i++)
							{
							try {style_from_string (pstyles.selection[i].text, "paragraph").nestedGrepStyles.add ({grepExpression: gr, appliedCharacterStyle: cs})} catch(_){}
							} // for (var i
						} // for (var j
					} // for (var d
				}
			w1.close ();
			} // gr_style.onClick
		} // if (parseInt


	rename_b.onClick = function () {copy_item (QList, "Rename query", true);}
	duplicate_b.onClick = function () {copy_item (QList, "Duplicate query", false);}
	
	function copy_item (list, title, remove_file)
		{
		switch (list.id){
			case "QueryList": var ext = ".xml"; var sel = list.selection[0]; break;
			case "ChainList": var ext = ".grpq"; var sel = list.selection; break;
			default: {alert ("Error: list has no id."); exit();}
		} // switch

		var n = getValidName (list, sel.text, title);
		if (n != null)
			{
			list.remove(list.find(n));  // We may be replacing an existing entry
			var copied = InsertItem (list, n);  // duplicate the item
			for (var i = 0; i < sel.subItems.length; i++)  // copy the item's subItems
				copied.subItems[i].text = sel.subItems[i].text;
			File (queryFolder+sel.text+ext).copy(File (queryFolder+n+ext));
			if (list.type != "dropdownlist")
				list.selection = null;
			list.selection = list.find(n);
			if (remove_file)
				{
				File (queryFolder+sel.text+ext).remove();
				list.remove(sel);
				}
//~ 			list.selection = null;
//~ 			list.selection = list.find(n);
//~ 			sel.selection = false;
			} // if (n
		} // copy_item

// Chains =========================================================================================

	ChainList.onChange = function ()
		{
		if (ChainList.selection.text != "[Custom]")
			{
			var current = ChainList.selection.index;
			var f = File (queryFolder + "/" + ChainList.selection.text + ".grpq");
			f.open ("r");
			var temp = f.read ().split(/[\|\n\r]/g); // The pipe (|) is for compatibility
			f.close ();
			var sel = [];
			for (var i = 0; i < temp.length; i++)
				try {sel.push (QList.find(temp[i]).index);} catch (_){}
			QList.selection = null; QList.selection = sel;
			ShiftList (QList, sel.pop()); 
			}
	   delete_chain.enabled = /*rename_chain.enabled = */ (ChainList.selection.text != "[Custom]");
		}
	
	function ShiftList (list, idx)
		{
		if (idx < list.items.length+1)
			list.revealItem (idx+1);
		}
	

	function chain_names ()
		{
		var array = ["[Custom]"];
		var f = Folder(queryFolder).getFiles("*.grpq");
		var re = /\.grpq$/;
		for (var i = 0; i < f.length; i++)
			array.push (decodeURI (f[i].name).replace (re, ""));
		return array;
		}

	new_chain.onClick = function ()
		{
		if (QList.selection.length > 1)
			{
			var cname = getValidName (ChainList, "Untitled", "New chain");
			if (cname != null)
				{
				var f = File (queryFolder + cname +".grpq");
				f.open ("w"); f.write (QList.selection.join("\r")); f.close ();
				var new_chain = InsertItem (ChainList, cname);
				ChainList.selection = new_chain;
				}
			} // if (QList
		} // add_chain
	
	
	delete_chain.onClick = function ()
		{
		if (ChainList.selection != null && AskYN ("Delete "+ChainList.selection.text+"?"))
			{
			File (queryFolder+ChainList.selection.text+".grpq").remove();
			var current = ChainList.selection;
			ChainList.selection = ChainList.find ("[Custom]");
			ChainList.remove (current);
			}
		} // delete_chain
	
	
//~ 	rename_chain.onClick = function () {
//~ 		copy_item (ChainList, "Rename chain", true);
//~ 		ChainList.active=true;
//~ 		}

	collect.onClick = function () {
		ChainList.active = true; // we want to keep the chain list activated
		if (!this.value) {
			format.value = pagenums.value = this.value;
		}
		format.enabled = pagenums.enabled = this.value;
	}
	
	format.onClick = function (){ChainList.active = true;}
	pagenums.onClick = function (){ChainList.active = true;}

	execute_b.onClick = function () {
		ChainList.active = true; // Pressing the button deactivates the chain list, we re-activate it here

		var mess = new Window ('palette'); mess.alignChildren = ['left', 'top'];
		mess.d = mess.add ('statictext', undefined, "");
		mess.q = mess.add ('statictext', undefined, "");
		mess.d.characters = mess.q.characters = 40;
		mess.show();

		if (collect.value) var collected = [];

		var TARGETS = find_docs (target_panel);
		for (var d = 0; d < TARGETS.docs.length; d++) {
			if (dd_list.selection.text !== "Selection" && dd_list.selection.text !== "Story") {
				app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
				app.open (TARGETS.docs[d]);
				app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
			}
			mess.d.text = app.activeDocument.name;
			for (var i = 0; i < QList.selection.length; i++) {
				mess.q.text = QList.selection[i].text; mess.show();
				app.loadFindChangeQuery (QList.selection[i].text, SearchModes.grepSearch);
				if (collect.value)
					collected = collected.concat (eval(TARGETS.target+".findGrep()"));
				else
					eval(TARGETS.target+".changeGrep()");
			} // for (i
		} // for (d
		
		

		if (collect.value) {
			mess.q.text = "";
			mess.d.text = "Writing found items..."; mess.show();
			display (collected);
		}
			
		mess.close();
			
		// If we did a book or a folder, save and close the document(s),
		// but if we're just collecting, don't save
		if (dd_list.selection.text !== "Selection" && dd_list.selection.text !== "Story") {
			for (d = 0; d < TARGETS.docs.length; d++) {
				if (dd_list.selection.text === "Book" || dd_list.selection.text === "Folder") {
					if (collect.value)
						app.documents.item (TARGETS.docs[d].name).close (SaveOptions.no);
					else
						app.documents.item (TARGETS.docs[d].name).close (SaveOptions.yes);
				}
			} // for (d
		} // if (dd_list
	}



	function getDocument () {
		var doc = app.documents.add();
		doc.zeroPoint = [0,0];
		doc.textPreferences.smartTextReflow = true;
		doc.textPreferences.deleteEmptyPages = false;
		try {
			doc.textPreferences.limitToMasterTextFrames = false;
		} catch (_) {
		}
		var pb = doc.pages[0].bounds;
		var m = doc.pages[0].marginPreferences;
		var gb = [m.top, m.left, pb[2]-m.bottom, pb[3]-m.left];
		var f = doc.pages[0].textFrames.add ({geometricBounds: gb});
		f.nextTextFrame = doc.pages.add().textFrames.add ({geometricBounds: gb});
		return f.parentStory;
	}


	function display (found) {
		var story = getDocument();
		if (format.value) {
			var pnum;
			for (var i = 0; i < found.length; i++) {
				pagenums.value ? pnum = ' ' + find_page (found[i]).name : pnum = '';
				found[i].duplicate (LocationOptions.AFTER, story.insertionPoints[-1]);
				story.insertionPoints[-1].contents = pnum + '\r';
			}
		} else {
			story.contents = FindPageNums (found, pagenums);
		}
		story.parent.textPreferences.deleteEmptyPages = true;
		app.windows[0].activePage = story.parent.pages[0];
	}


	function FindPageNums (found, pagenums) {
		function nocase (a, b) {return a.toLowerCase() > b.toLowerCase();}
		var obj;
		pagenums.value ? obj = with_pnums (found) : obj = without_pnums (found);
		obj.sort (nocase);
		var s = '';
		for (i in obj) {
			s += obj[i] + '\r';
		}
		return s;
	}


	function without_pnums (found) {
		var s;
		var known = [];
		var singles = [];
		for (var i = 0; i < found.length; i++) {
			s = found[i].contents;
			if (!known[s]) {
				singles.push(s);
				known[s] = true;
			}
		}
		return singles;
	}


	function with_pnums (found) {
		
		function unique (/*str[]*/ arr) { // This is the version that Marc Autret posted in the scripting forum
			var o={}, r=[], n = arr.length, i;
			for( i=0 ; i<n ; ++i ) {
				o[arr[i]] = null;
			}
			for( i in o ) {
				r.push(i);
			}
			return r;
		}
		
		// begin with_pnums
		var known = [];
		var singles = [];
		var pnum, s;
		for (var i = 0; i < found.length; i++) {
			pnum = find_page (found[i]).name;
			s = found[i].contents;
			if (!known[s]) {
				singles[s] = [pnum];
				known[s] = true;
			} else {
				singles[s].push (pnum);
			}
		}
		known = [];
		for (i in singles) {
			known.push (i+"\t"+(unique (singles[i])).join(", "));
		}
		return known;
	} // with_pnums


	function find_page (o) {
		try {
			if (o.hasOwnProperty ("parentPage"))
				return o.parentPage;
			if (o.constructor.name == "Page")
				return o;
			switch (o.parent.constructor.name) {
				case "Character": return find_page (o.parent);
				case "Cell": return find_page (o.parent.texts[0].parentTextFrames[0]);
				case "Table" : return find_page (o.parent);
				case "TextFrame" : return find_page (o.parent);
				case "Group" : return find_page (o.parent);
				case "Story": return find_page (o.parentTextFrames[0]);
				case "Footnote": return find_page (o.parent.storyOffset);
				case "Page" : return o.parent;
			}
		}
		catch (_) {return ""}
	} // find_page
	
// End Chains =====================================================================================

// Tools ==========================================================================================

	//~ All documents
	//~ Document
	//~ Book
	//~ Folder
	//~ Selection
	//~ Story

	function find_docs (tpanel)
		{
			function book_documents ()
				{
					function pick_book ()
						{
						var w = new Window ("dialog", "Select a book");
						w.alignChildren = "right";
						var g = w.add ("group");
							var list = g.add ("listbox", undefined, app.books.everyItem().name);
							list.minimumSize.width = 250;
							list.selection = 0;
						var b = w.add ("group");
							b.add ("button", undefined, "OK", {name: "ok"})
							b.add ("button", undefined, "Cancel", {name: "cancel"})
						if (w.show () == 1)
							return app.books.item (list.selection.text);
						else
							exit ();
						} // pick_book 
					
				// BEGIN book_documents
				if (app.books.length === 1)
					return app.books[0].bookContents.everyItem().fullName;
				else
					return pick_book().bookContents.everyItem().fullName;
				} // book_documents

			function folder_documents ()
				{
				var fldr = Folder (QTARGETFOLDER).selectDlg ("Select a folder");
				if (fldr === null)
					return [];
				else
					{
					var f = fldr.getFiles("*.indd");
					QTARGETFOLDER = String(fldr);
					return f;
					}
				} // folder_documents
			
		// BEGIN find_docs
		switch (dd_list.selection.text)
			{
			case "All documents": try{return {docs: app.documents.everyItem().fullName, target: "app.activeDocument"};}
										catch(_){alert("Please save all documents.", "Grep query manager")}; break;
			case "Document": try {return {docs: [app.activeDocument.fullName], target: "app.activeDocument"};}
										catch(_){alert("Please save all documents.", "Grep query manager")}; break;
			case "Book": return {docs: book_documents(), target: "app.activeDocument"};
			case "Folder": return {docs: folder_documents(), target: "app.activeDocument"};
			case "Selection": return {docs: [1], target: "app.selection[0]"};
			case "Story": return {docs: [1], target: "app.selection[0].parentStory"};
			}
		// If we get here, something's wrong
		exit ();
		} // find_docs
	
	function ObjArrayToStringArray (array)
		{
		for (var i = 0; i < array.length; i++)
			array[i] = array[i].contents;
		return array;
		}

	// Insert an item into a list, sorted
	function InsertItem (list, new_item)
		{
		var stop = list.items.length;
		var i = 0;
		while (i < stop && new_item.toLowerCase() > list.items[i].text.toLowerCase()) 
			i++;
		return list.add ("item", new_item, i);
		}

	// Return a valid list-item name or null
	function getValidName (list, s, title)
		{
		var w = new Window ('dialog', title, undefined, {closeButton: false});
			var gr = w.add("group");
				gr.add("statictext", undefined, "New name: ")
				var e = gr.add ("edittext", undefined, s);
					e.characters = 30; e.active = true;
				var buttons = w.add("group"); buttons.alignment = "right";
					var save = buttons.add("button", undefined, "Save", {name:"ok"});
					buttons.add("button", undefined, "Cancel", {name:"cancel"});

			//set_font (w, defaultFont);

			e.onChanging = function ()
				{
				if (list.find (e.text) != null)
					save.text = 'Replace';
				else
					save.text = 'Save';
				}

			save.onClick = function ()
				{
				if ((this.text == 'Save') || (list.find (e.text) != null && this.text == 'Replace'))
					w.close(1);
				}
		if (w.show()==2)
			return null;
		else
			return e.text;
		} // getValidName


	// Display a confirm window; return true or false
	function AskYN (s)
		{
		var w2 = new Window ("dialog", "Confirm", undefined, {closeButton: false});
			var t = w2.add ("group");
				t.add ("statictext", undefined, s);
			var b = w2.add ("group");
				b.add ("button", undefined, "Yes", {name: "ok"});
				b.add ("button", undefined, "No", {name: "cancel"});
		//set_font (w2, defaultFont);
		var temp = w2.show ();
		w2.close ();
		return temp == 1;
		}

//~ 	function set_font (control, font) {
//~ 		for (var i = 0; i < control.children.length; i++) {
//~ 			if ("GroupPanel".indexOf (control.children[i].constructor.name) > -1)
//~ 				set_font (control.children[i], font);
//~ 			else
//~ 				control.children[i].graphics.font = font;
//~ 		}
//~ 	}
	
	w.onChange = function () {
		ChainList.active = true;
	}
	
// End Tools ==========================================================================================
	
	w.onResizing = function () {
		this.layout.resize ();
	}

	w.onShow = function () {
		w.layout.layout();
		w.minimumSize.height = buttons.size[1];
		updateList (QList, "");
		// If the previously selected chain no longer exists, then preselect [Custom]
		ChainList.selection = (ChainList.find (HISTORY.chain) || 0);
		if (HISTORY.chain == "[Custom]") {
			try {
				QList.selection = null;
				var temp = HISTORY.queries;
				for (var i = 0; i < temp.length; i++) {
					QList.selection = QList.find (temp[i]);
				}
			} catch (_) {
			};
		}
		try {
			collect.value = HISTORY.collect_items;
		} catch (_) {
		};
//~ 		execute_panel.enabled = app.documents.length > 0;
		try {
			help_b.value = HISTORY.helptips;
		} catch (_) {
			help_b.value = true;
		}
		SetHelpTips (help_b.value);
		ChainList.active = true;
	}
	w.show ();
} // show_grep_queries

// Export selected queries ============================================================

function export_queries (QList) {
	var story = create_document();
	var doc = story.parent;
	var find, replace;
	for (var i = 0; i < QList.selection.length; i++) {
		story.insertionPoints[-1].contents = QList.selection[i].text + "\r";
		story.insertionPoints[-1].contents = strip_for_dialog (QList.selection[i].subItems[0].text) + "\r";
		story.insertionPoints[-1].contents = QList.selection[i].subItems[1].text + "\r";
	}
	
	var next_frame;
	var gb = story.textContainers[0].geometricBounds;
	doc.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
	while (story.overflows) {
		doc.pages.add (LocationOptions.AT_END);
		next_frame = doc.pages[-1].textFrames.add ({geometricBounds: gb});
		story.textContainers.pop().nextTextFrame = next_frame;
	}
	
	var p = story.paragraphs.everyItem().getElements();
	for (var i = 0; i < p.length; i=i+3) {
		p[i].appliedParagraphStyle = app.activeDocument.paragraphStyles.item ("query_name");
		p[i+1].appliedParagraphStyle = app.activeDocument.paragraphStyles.item ("find_what");
		p[i+2].appliedParagraphStyle = app.activeDocument.paragraphStyles.item ("change_to");
	}
} // export_queries


function create_document () {
	
		function add_character_styles (doc) {
			
			function add_character_style (s, array) {
				doc.colors.add ({name: s, colorValue: array});
				doc.characterStyles.add ({name: s, fillColor: s});
			}

			var le = doc.swatches.length;
			for (var i = le-1; i > -1; i--) {
				try {
					doc.swatches[i].remove();
				} catch (_) {
				};
			}
			add_character_style ("black", [100,100,100,100]);
			add_character_style ("blue-dark", [100,30,0,0]);
			add_character_style ("blue-light", [100,0,0,0]);
			add_character_style ("green", [100,20,100,0]);
			add_character_style ("green-light", [70,0,100,0]);
			add_character_style ("orange", [0,65,100,0]);
			add_character_style ("red", [0,100,100,0]);
			add_character_style ("yellow", [0,0,100,0]);
		} // add_character_styles


		function create_nested_styles (pstyle) {
			var comment;
			var cstyles = pstyle.parent.characterStyles;
			
			comment = "(?#*.?! not preceded by \\)"; // (?<!\\)[*.?!]
			pstyle.nestedGrepStyles.add({grepExpression: "(?<!\\\\)[*.?!+]"+comment, appliedCharacterStyle: cstyles.item("orange")});
			
			comment = "(?# InDesign specials such as ~F and ~=)"; // (?<!\\)\~.
			pstyle.nestedGrepStyles.add({grepExpression: "(?<!\\\\)\\~."+comment, appliedCharacterStyle: cstyles.item("orange")});
			
			comment = "(?# The lookbehinds and lookaheads)"; // \(\?<?[=!]
			pstyle.nestedGrepStyles.add({grepExpression: "\\(\\?<?[=!]"+comment, appliedCharacterStyle: cstyles.item("blue-light")});
			
			comment = "(?# Brackets, braces, etc. not preceded by \\)"; // (?<!\\)[()\[\]\{\}|]
			pstyle.nestedGrepStyles.add({grepExpression: "(?<!\\\\)[()\\[\\]\{\\}|]"+comment, appliedCharacterStyle: cstyles.item("blue-light")});
			
			comment = "(?# Word character not preceded by \\)";  // (?<!\\)\\\w
			pstyle.nestedGrepStyles.add({grepExpression: "(?<!\\\\)\\\\\\w"+comment, appliedCharacterStyle: cstyles.item("red")});
			
			comment = "(?# POSIX and char. equivalents)"; // \[?\[[=:]\w+?[\=:]\]\]?
			pstyle.nestedGrepStyles.add({grepExpression: "\\[?\\[[=:]\\w+?[\\=:]\\]\\]?"+comment, appliedCharacterStyle: cstyles.item("red")});
			
			comment = "(?# The modifiers)";  // \(\?-?[imsx]\)
			pstyle.nestedGrepStyles.add({grepExpression: "\\(\\?-?[imsx]\\)"+comment, appliedCharacterStyle: cstyles.item("blue-light")});
			
			comment = "(?# Non-marking expressions)"; // (\?:
			pstyle.nestedGrepStyles.add({grepExpression: "\\(\\?:"+comment, appliedCharacterStyle: cstyles.item("blue-light")});
			
			comment = "(?# Unicode characters)"; // \\x\{\w\w\w\w\}
			pstyle.nestedGrepStyles.add({grepExpression: "\\\\x\\{\\w\\w\\w\\w\\}"+comment, appliedCharacterStyle: cstyles.item("orange")});
			
			comment = "(?# Unicode characters)"; // \\x\w\w
			pstyle.nestedGrepStyles.add({grepExpression: "\\\\x\\w\\w"+comment, appliedCharacterStyle: cstyles.item("orange")});
			
			comment = "(?# Boundaries)"; // \\[AaBbZz<>]
			pstyle.nestedGrepStyles.add({grepExpression: "\\\\[AaBbZz]"+comment, appliedCharacterStyle: cstyles.item("blue-dark")});
			
			comment = "(?# Boundaries)"; // (?<!\\)[$^]
			pstyle.nestedGrepStyles.add({grepExpression: "(?<!\\\\)[$^]"+comment, appliedCharacterStyle: cstyles.item("blue-dark")});
			
			comment = "(?# Line comments)"; // //.*
			pstyle.nestedGrepStyles.add({grepExpression: "//.*"+comment, appliedCharacterStyle: cstyles.item("green")});
			
			comment = "(?# Nested comments)"; // \(\?#.+?\)
			pstyle.nestedGrepStyles.add({grepExpression: "\\(\\?#.+?\\)"+comment, appliedCharacterStyle: cstyles.item("green")});
			
		} // create_nested_styles

	// BEGIN create_document
	
	var doc = app.documents.add();
	add_character_styles (doc);
	doc.paragraphStyles.add ({name: "query_name", spaceBefore: "6pt", basedOn: doc.paragraphStyles[1]});

	var changeto = doc.paragraphStyles.add ({name: "change_to", basedOn: doc.paragraphStyles[1]});
	changeto.nestedGrepStyles.add ({grepExpression: "\\x{0024}\\d", appliedCharacterStyle: doc.characterStyles.item ("red")});
	changeto.nestedGrepStyles.add ({grepExpression: "(?<!\\\\)\\~.", appliedCharacterStyle: doc.characterStyles.item ("orange")});
	
	var pstyle = doc.paragraphStyles.add ({name: "find_what", basedOn: doc.paragraphStyles[1]});
	create_nested_styles (pstyle);
	
	var m = doc.pages[0].marginPreferences;
	var gb = [m.top, m.left, 
		doc.documentPreferences.pageHeight - m.bottom, 
		doc.documentPreferences.pageWidth - m.right];	

	var story = doc.pages[0].textFrames.add ({geometricBounds: gb}).parentStory;
	story.characterDirection = CharacterDirectionOptions.LEFT_TO_RIGHT_DIRECTION;
	story.justification = Justification.LEFT_ALIGN;
	story.digitsType = DigitsTypeOptions.ARABIC_DIGITS;
	return story;
} // create_document

//===========================================================================

function encode_grep_for_query (s) {
	// Remove trailing returns
	var temp = s.replace (/[\n\r]+$/, "");
	// Replace remaining returns with (?#) as placeholders for line breaks
	temp = temp.replace (/[\n\r]/g, "(?#)");
	// Replace tabs with (?#T)
	temp = temp.replace (/\t/g, "(?#T)");
	// If string contains spaces and doesn't start with (?x), add it
	if (temp.indexOf(" ") > -1 && temp.slice(0,4) != "(?x)") {
		temp = "(?x)" + temp;
	}
	temp = temp.replace (/&/g, "&amp;");
	temp = temp.replace (/>/g, "&gt;");
	temp = temp.replace (/</g, "&lt;");
	temp = temp.replace (/"/g, "&quot;");
	temp = temp.replace (/'/g, "&apos;");
	return temp;
}


function strip_for_dialog (s) {
	s = s.replace (/\(\?#\)/g, '');
	s = s.replace(/\(\?#T\)/g, '');
	return s;
}


function readable (s) {
	s = s.replace (/&lt;/g, "<");
	s = s.replace (/&gt;/g, ">");
	s = s.replace (/&apos;/g, "'");
	s = s.replace (/&quot;/g, '"');
	s = s.replace (/&amp;/g, "&");
	s = s.replace (/\(\?#\)/g, "\r");
	return s;
}


function script_folder () {
	try {
		return File (app.activeScript).path + '/';
	} catch (e) {
		return File (e.fileName).path + '/';
	}
}


function define_buttons () {
	return {
		bin: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x14\b\x02\x00\x00\x00\x0B\x00* \x00\x00\x00\tpHYs\x00\x00\x12t\x00\x00\x12t\x01\u00DEf\x1Fx\x00\x00\nOiCCPPhotoshop ICC profile\x00\x00x\u00DA\u009DSgTS\u00E9\x16=\u00F7\u00DE\u00F4BK\u0088\u0080\u0094KoR\x15\b RB\u008B\u0080\x14\u0091&*!\t\x10J\u0088!\u00A1\u00D9\x15Q\u00C1\x11EE\x04\x1B\u00C8\u00A0\u0088\x03\u008E\u008E\u0080\u008C\x15Q,\f\u008A\n\u00D8\x07\u00E4!\u00A2\u008E\u0083\u00A3\u0088\u008A\u00CA\u00FB\u00E1{\u00A3k\u00D6\u00BC\u00F7\u00E6\u00CD\u00FE\u00B5\u00D7>\u00E7\u00AC\u00F3\u009D\u00B3\u00CF\x07\u00C0\b\f\u0096H3Q5\u0080\f\u00A9B\x1E\x11\u00E0\u0083\u00C7\u00C4\u00C6\u00E1\u00E4.@\u0081\n$p\x00\x10\b\u00B3d!s\u00FD#\x01\x00\u00F8~<<+\"\u00C0\x07\u00BE\x00\x01x\u00D3\x0B\b\x00\u00C0M\u009B\u00C00\x1C\u0087\u00FF\x0F\u00EAB\u0099\\\x01\u0080\u0084\x01\u00C0t\u00918K\b\u0080\x14\x00@z\u008EB\u00A6\x00@F\x01\u0080\u009D\u0098&S\x00\u00A0\x04\x00`\u00CBcb\u00E3\x00P-\x00`'\x7F\u00E6\u00D3\x00\u0080\u009D\u00F8\u0099{\x01\x00[\u0094!\x15\x01\u00A0\u0091\x00 \x13e\u0088D\x00h;\x00\u00AC\u00CFV\u008AE\x00X0\x00\x14fK\u00C49\x00\u00D8-\x000IWfH\x00\u00B0\u00B7\x00\u00C0\u00CE\x10\x0B\u00B2\x00\b\f\x000Q\u0088\u0085)\x00\x04{\x00`\u00C8##x\x00\u0084\u0099\x00\x14F\u00F2W<\u00F1+\u00AE\x10\u00E7*\x00\x00x\u0099\u00B2<\u00B9$9E\u0081[\b-q\x07WW.\x1E(\u00CEI\x17+\x146a\x02a\u009A@.\u00C2y\u0099\x192\u00814\x0F\u00E0\u00F3\u00CC\x00\x00\u00A0\u0091\x15\x11\u00E0\u0083\u00F3\u00FDx\u00CE\x0E\u00AE\u00CE\u00CE6\u008E\u00B6\x0E_-\u00EA\u00BF\x06\u00FF\"bb\u00E3\u00FE\u00E5\u00CF\u00ABp@\x00\x00\u00E1t~\u00D1\u00FE,/\u00B3\x1A\u0080;\x06\u0080m\u00FE\u00A2%\u00EE\x04h^\x0B\u00A0u\u00F7\u008Bf\u00B2\x0F@\u00B5\x00\u00A0\u00E9\u00DAW\u00F3p\u00F8~<<E\u00A1\u0090\u00B9\u00D9\u00D9\u00E5\u00E4\u00E4\u00D8J\u00C4B[a\u00CAW}\u00FEg\u00C2_\u00C0W\u00FDl\u00F9~<\u00FC\u00F7\u00F5\u00E0\u00BE\u00E2$\u00812]\u0081G\x04\u00F8\u00E0\u00C2\u00CC\u00F4L\u00A5\x1C\u00CF\u0092\t\u0084b\u00DC\u00E6\u008FG\u00FC\u00B7\x0B\u00FF\u00FC\x1D\u00D3\"\u00C4Ib\u00B9X*\x14\u00E3Q\x12q\u008ED\u009A\u008C\u00F32\u00A5\"\u0089B\u0092)\u00C5%\u00D2\u00FFd\u00E2\u00DF,\u00FB\x03>\u00DF5\x00\u00B0j>\x01{\u0091-\u00A8]c\x03\u00F6K'\x10Xt\u00C0\u00E2\u00F7\x00\x00\u00F2\u00BBo\u00C1\u00D4(\b\x03\u0080h\u0083\u00E1\u00CFw\u00FF\u00EF?\u00FDG\u00A0%\x00\u0080fI\u0092q\x00\x00^D$.T\u00CA\u00B3?\u00C7\b\x00\x00D\u00A0\u0081*\u00B0A\x1B\u00F4\u00C1\x18,\u00C0\x06\x1C\u00C1\x05\u00DC\u00C1\x0B\u00FC`6\u0084B$\u00C4\u00C2B\x10B\nd\u0080\x1Cr`)\u00AC\u0082B(\u0086\u00CD\u00B0\x1D*`/\u00D4@\x1D4\u00C0Qh\u0086\u0093p\x0E.\u00C2U\u00B8\x0E=p\x0F\u00FAa\b\u009E\u00C1(\u00BC\u0081\t\x04A\u00C8\b\x13a!\u00DA\u0088\x01b\u008AX#\u008E\b\x17\u0099\u0085\u00F8!\u00C1H\x04\x12\u008B$ \u00C9\u0088\x14Q\"K\u00915H1R\u008AT UH\x1D\u00F2=r\x029\u0087\\F\u00BA\u0091;\u00C8\x002\u0082\u00FC\u0086\u00BCG1\u0094\u0081\u00B2Q=\u00D4\f\u00B5C\u00B9\u00A87\x1A\u0084F\u00A2\x0B\u00D0dt1\u009A\u008F\x16\u00A0\u009B\u00D0r\u00B4\x1A=\u008C6\u00A1\u00E7\u00D0\u00ABh\x0F\u00DA\u008F>C\u00C70\u00C0\u00E8\x18\x073\u00C4l0.\u00C6\u00C3B\u00B18,\t\u0093c\u00CB\u00B1\"\u00AC\f\u00AB\u00C6\x1A\u00B0V\u00AC\x03\u00BB\u0089\u00F5c\u00CF\u00B1w\x04\x12\u0081E\u00C0\t6\x04wB a\x1EAHXLXN\u00D8H\u00A8 \x1C$4\x11\u00DA\t7\t\x03\u0084Q\u00C2'\"\u0093\u00A8K\u00B4&\u00BA\x11\u00F9\u00C4\x18b21\u0087XH,#\u00D6\x12\u008F\x13/\x10{\u0088C\u00C47$\x12\u0089C2'\u00B9\u0090\x02I\u00B1\u00A4T\u00D2\x12\u00D2F\u00D2nR#\u00E9,\u00A9\u009B4H\x1A#\u0093\u00C9\u00DAdk\u00B2\x079\u0094, +\u00C8\u0085\u00E4\u009D\u00E4\u00C3\u00E43\u00E4\x1B\u00E4!\u00F2[\n\u009Db@q\u00A4\u00F8S\u00E2(R\u00CAjJ\x19\u00E5\x10\u00E54\u00E5\x06e\u00982AU\u00A3\u009AR\u00DD\u00A8\u00A1T\x115\u008FZB\u00AD\u00A1\u00B6R\u00AFQ\u0087\u00A8\x134u\u009A9\u00CD\u0083\x16IK\u00A5\u00AD\u00A2\u0095\u00D3\x1Ah\x17h\u00F7i\u00AF\u00E8t\u00BA\x11\u00DD\u0095\x1EN\u0097\u00D0W\u00D2\u00CB\u00E9G\u00E8\u0097\u00E8\x03\u00F4w\f\r\u0086\x15\u0083\u00C7\u0088g(\x19\u009B\x18\x07\x18g\x19w\x18\u00AF\u0098L\u00A6\x19\u00D3\u008B\x19\u00C7T071\u00EB\u0098\u00E7\u0099\x0F\u0099oUX*\u00B6*|\x15\u0091\u00CA\n\u0095J\u0095&\u0095\x1B*/T\u00A9\u00AA\u00A6\u00AA\u00DE\u00AA\x0BU\u00F3U\u00CBT\u008F\u00A9^S}\u00AEFU3S\u00E3\u00A9\t\u00D4\u0096\u00ABU\u00AA\u009DP\u00EBS\x1BSg\u00A9;\u00A8\u0087\u00AAg\u00A8oT?\u00A4~Y\u00FD\u0089\x06Y\u00C3L\u00C3OC\u00A4Q\u00A0\u00B1_\u00E3\u00BC\u00C6 \x0Bc\x19\u00B3x,!k\r\u00AB\u0086u\u00815\u00C4&\u00B1\u00CD\u00D9|v*\u00BB\u0098\u00FD\x1D\u00BB\u008B=\u00AA\u00A9\u00A19C3J3W\u00B3R\u00F3\u0094f?\x07\u00E3\u0098q\u00F8\u009CtN\t\u00E7(\u00A7\u0097\u00F3~\u008A\u00DE\x14\u00EF)\u00E2)\x1B\u00A64L\u00B91e\\k\u00AA\u0096\u0097\u0096X\u00ABH\u00ABQ\u00ABG\u00EB\u00BD6\u00AE\u00ED\u00A7\u009D\u00A6\u00BDE\u00BBY\u00FB\u0081\x0EA\u00C7J'\\'Gg\u008F\u00CE\x05\u009D\u00E7S\u00D9S\u00DD\u00A7\n\u00A7\x16M=:\u00F5\u00AE.\u00AAk\u00A5\x1B\u00A1\u00BBDw\u00BFn\u00A7\u00EE\u0098\u009E\u00BE^\u0080\u009ELo\u00A7\u00DEy\u00BD\u00E7\u00FA\x1C}/\u00FDT\u00FDm\u00FA\u00A7\u00F5G\fX\x06\u00B3\f$\x06\u00DB\f\u00CE\x18<\u00C55qo<\x1D/\u00C7\u00DB\u00F1QC]\u00C3@C\u00A5a\u0095a\u0097\u00E1\u0084\u0091\u00B9\u00D1<\u00A3\u00D5F\u008DF\x0F\u008Ci\u00C6\\\u00E3$\u00E3m\u00C6m\u00C6\u00A3&\x06&!&KM\u00EAM\u00EE\u009ARM\u00B9\u00A6)\u00A6;L;L\u00C7\u00CD\u00CC\u00CD\u00A2\u00CD\u00D6\u00995\u009B=1\u00D72\u00E7\u009B\u00E7\u009B\u00D7\u009B\u00DF\u00B7`ZxZ,\u00B6\u00A8\u00B6\u00B8eI\u00B2\u00E4Z\u00A6Y\u00EE\u00B6\u00BCn\u0085Z9Y\u00A5XUZ]\u00B3F\u00AD\u009D\u00AD%\u00D6\u00BB\u00AD\u00BB\u00A7\x11\u00A7\u00B9N\u0093N\u00AB\u009E\u00D6g\u00C3\u00B0\u00F1\u00B6\u00C9\u00B6\u00A9\u00B7\x19\u00B0\u00E5\u00D8\x06\u00DB\u00AE\u00B6m\u00B6}agb\x17g\u00B7\u00C5\u00AE\u00C3\u00EE\u0093\u00BD\u0093}\u00BA}\u008D\u00FD=\x07\r\u0087\u00D9\x0E\u00AB\x1DZ\x1D~s\u00B4r\x14:V:\u00DE\u009A\u00CE\u009C\u00EE?}\u00C5\u00F4\u0096\u00E9/gX\u00CF\x10\u00CF\u00D83\u00E3\u00B6\x13\u00CB)\u00C4i\u009DS\u009B\u00D3Gg\x17g\u00B9s\u0083\u00F3\u0088\u008B\u0089K\u0082\u00CB.\u0097>.\u009B\x1B\u00C6\u00DD\u00C8\u00BD\u00E4Jt\u00F5q]\u00E1z\u00D2\u00F5\u009D\u009B\u00B3\u009B\u00C2\u00ED\u00A8\u00DB\u00AF\u00EE6\u00EEi\u00EE\u0087\u00DC\u009F\u00CC4\u009F)\u009EY3s\u00D0\u00C3\u00C8C\u00E0Q\u00E5\u00D1?\x0B\u009F\u00950k\u00DF\u00AC~OCO\u0081g\u00B5\u00E7#/c/\u0091W\u00AD\u00D7\u00B0\u00B7\u00A5w\u00AA\u00F7a\u00EF\x17>\u00F6>r\u009F\u00E3>\u00E3<7\u00DE2\u00DEY_\u00CC7\u00C0\u00B7\u00C8\u00B7\u00CBO\u00C3o\u009E_\u0085\u00DFC\x7F#\u00FFd\u00FFz\u00FF\u00D1\x00\u00A7\u0080%\x01g\x03\u0089\u0081A\u0081[\x02\u00FB\u00F8z|!\u00BF\u008E?:\u00DBe\u00F6\u00B2\u00D9\u00EDA\u008C\u00A0\u00B9A\x15A\u008F\u0082\u00AD\u0082\u00E5\u00C1\u00AD!h\u00C8\u00EC\u0090\u00AD!\u00F7\u00E7\u0098\u00CE\u0091\u00CEi\x0E\u0085P~\u00E8\u00D6\u00D0\x07a\u00E6a\u008B\u00C3~\f'\u0085\u0087\u0085W\u0086?\u008Ep\u0088X\x1A\u00D11\u00975w\u00D1\u00DCCs\u00DFD\u00FAD\u0096D\u00DE\u009Bg1O9\u00AF-J5*>\u00AA.j<\u00DA7\u00BA4\u00BA?\u00C6.fY\u00CC\u00D5X\u009DXIlK\x1C9.*\u00AE6nl\u00BE\u00DF\u00FC\u00ED\u00F3\u0087\u00E2\u009D\u00E2\x0B\u00E3{\x17\u0098/\u00C8]py\u00A1\u00CE\u00C2\u00F4\u0085\u00A7\x16\u00A9.\x12,:\u0096@L\u0088N8\u0094\u00F0A\x10*\u00A8\x16\u008C%\u00F2\x13w%\u008E\ny\u00C2\x1D\u00C2g\"/\u00D16\u00D1\u0088\u00D8C\\*\x1EN\u00F2H*Mz\u0092\u00EC\u0091\u00BC5y$\u00C53\u00A5,\u00E5\u00B9\u0084'\u00A9\u0090\u00BCL\rL\u00DD\u009B:\u009E\x16\u009Av m2=:\u00BD1\u0083\u0092\u0091\u0090qB\u00AA!M\u0093\u00B6g\u00EAg\u00E6fv\u00CB\u00ACe\u0085\u00B2\u00FE\u00C5n\u008B\u00B7/\x1E\u0095\x07\u00C9k\u00B3\u0090\u00AC\x05Y-\n\u00B6B\u00A6\u00E8TZ(\u00D7*\x07\u00B2geWf\u00BF\u00CD\u0089\u00CA9\u0096\u00AB\u009E+\u00CD\u00ED\u00CC\u00B3\u00CA\u00DB\u00907\u009C\u00EF\u009F\u00FF\u00ED\x12\u00C2\x12\u00E1\u0092\u00B6\u00A5\u0086KW-\x1DX\u00E6\u00BD\u00ACj9\u00B2<qy\u00DB\n\u00E3\x15\x05+\u0086V\x06\u00AC<\u00B8\u008A\u00B6*m\u00D5O\u00AB\u00EDW\u0097\u00AE~\u00BD&zMk\u0081^\u00C1\u00CA\u0082\u00C1\u00B5\x01k\u00EB\x0BU\n\u00E5\u0085}\u00EB\u00DC\u00D7\u00ED]OX/Y\u00DF\u00B5a\u00FA\u0086\u009D\x1B>\x15\u0089\u008A\u00AE\x14\u00DB\x17\u0097\x15\x7F\u00D8(\u00DCx\u00E5\x1B\u0087o\u00CA\u00BF\u0099\u00DC\u0094\u00B4\u00A9\u00AB\u00C4\u00B9d\u00CFf\u00D2f\u00E9\u00E6\u00DE-\u009E[\x0E\u0096\u00AA\u0097\u00E6\u0097\x0En\r\u00D9\u00DA\u00B4\r\u00DFV\u00B4\u00ED\u00F5\u00F6E\u00DB/\u0097\u00CD(\u00DB\u00BB\u0083\u00B6C\u00B9\u00A3\u00BF<\u00B8\u00BCe\u00A7\u00C9\u00CE\u00CD;?T\u00A4T\u00F4T\u00FAT6\u00EE\u00D2\u00DD\u00B5a\u00D7\u00F8n\u00D1\u00EE\x1B{\u00BC\u00F64\u00EC\u00D5\u00DB[\u00BC\u00F7\u00FD>\u00C9\u00BE\u00DBU\x01UM\u00D5f\u00D5e\u00FBI\u00FB\u00B3\u00F7?\u00AE\u0089\u00AA\u00E9\u00F8\u0096\u00FBm]\u00ADNmq\u00ED\u00C7\x03\u00D2\x03\u00FD\x07#\x0E\u00B6\u00D7\u00B9\u00D4\u00D5\x1D\u00D2=TR\u008F\u00D6+\u00EBG\x0E\u00C7\x1F\u00BE\u00FE\u009D\u00EFw-\r6\rU\u008D\u009C\u00C6\u00E2#pDy\u00E4\u00E9\u00F7\t\u00DF\u00F7\x1E\r:\u00DAv\u008C{\u00AC\u00E1\x07\u00D3\x1Fv\x1Dg\x1D/jB\u009A\u00F2\u009AF\u009BS\u009A\u00FB[b[\u00BAO\u00CC>\u00D1\u00D6\u00EA\u00DEz\u00FCG\u00DB\x1F\x0F\u009C4<YyJ\u00F3T\u00C9i\u00DA\u00E9\u0082\u00D3\u0093g\u00F2\u00CF\u008C\u009D\u0095\u009D}~.\u00F9\u00DC`\u00DB\u00A2\u00B6{\u00E7c\u00CE\u00DFj\x0Fo\u00EF\u00BA\x10t\u00E1\u00D2E\u00FF\u008B\u00E7;\u00BC;\u00CE\\\u00F2\u00B8t\u00F2\u00B2\u00DB\u00E5\x13W\u00B8W\u009A\u00AF:_m\u00EAt\u00EA<\u00FE\u0093\u00D3O\u00C7\u00BB\u009C\u00BB\u009A\u00AE\u00B9\\k\u00B9\u00EEz\u00BD\u00B5{f\u00F7\u00E9\x1B\u009E7\u00CE\u00DD\u00F4\u00BDy\u00F1\x16\u00FF\u00D6\u00D5\u009E9=\u00DD\u00BD\u00F3zo\u00F7\u00C5\u00F7\u00F5\u00DF\x16\u00DD~r'\u00FD\u00CE\u00CB\u00BB\u00D9w'\u00EE\u00AD\u00BCO\u00BC_\u00F4@\u00EDA\u00D9C\u00DD\u0087\u00D5?[\u00FE\u00DC\u00D8\u00EF\u00DC\x7Fj\u00C0w\u00A0\u00F3\u00D1\u00DCG\u00F7\x06\u0085\u0083\u00CF\u00FE\u0091\u00F5\u008F\x0FC\x05\u008F\u0099\u008F\u00CB\u0086\r\u0086\u00EB\u009E8>99\u00E2?r\u00FD\u00E9\u00FC\u00A7C\u00CFd\u00CF&\u009E\x17\u00FE\u00A2\u00FE\u00CB\u00AE\x17\x16/~\u00F8\u00D5\u00EB\u00D7\u00CE\u00D1\u0098\u00D1\u00A1\u0097\u00F2\u0097\u0093\u00BFm|\u00A5\u00FD\u00EA\u00C0\u00EB\x19\u00AF\u00DB\u00C6\u00C2\u00C6\x1E\u00BE\u00C9x31^\u00F4V\u00FB\u00ED\u00C1w\u00DCw\x1D\u00EF\u00A3\u00DF\x0FO\u00E4| \x7F(\u00FFh\u00F9\u00B1\u00F5S\u00D0\u00A7\u00FB\u0093\x19\u0093\u0093\u00FF\x04\x03\u0098\u00F3\u00FCc3-\u00DB\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F9\u00FF\x00\x00\u0080\u00E9\x00\x00u0\x00\x00\u00EA`\x00\x00:\u0098\x00\x00\x17o\u0092_\u00C5F\x00\x00\x02\u0087IDATx\u00DA\u0094\u0092\u00CFO\x13A\x14\u00C7\u00DF\u00CE\u00FE(Mw\u00BBK\x17vYcp\u00B1\u00D5\u0080\x07k(\u00A5\u0081\u00C6\u0090H\x1A95%&\u00BD\x10\u00943I/\u009C\u008C\t\u00FF\bG\x13\u0095\x03\u0089\u0089\\\u0094\u0094\x1A1U \x04\u00F1\u0082\u009At\r\u00A0mlS\t\u0089%\u00DB\u00EE\u00CCn=l)\u0082\u009A\u00E8;\u00BD\u0099\u00F9~\u00F2}\u00DF\u00C9\u00A3\u00AA\u00E5\u008F\u00F0?\u00C5\u00FC~\u00F5r\u00ED]\u00BB\x1F\u008E\x0E\u00FB\u00BC\u00F8\u00CF@\u00BD\u00DE0>\x7Fy\u00B5\u00B6\u00FE\u00FCE\u00F6\u00E0\u00E0\u00AB\u00E38\u0081N)\x1E\u008F\u008D\u008F\u00DF\x1C\u008A\\\u00F7\x0B\u00BC+\u00A3\u00DC\u0091\u008A\u00A5\u00F2\u00DB\u00F5\x1D\u00CE#\u00E4\u00F3y\u00CB\u00B2fff8\u008E[XX\u00A8V\u00AB\u00BA\u00AE[\u008D\x1F\u00F7\u00EE\u00A6\u00AF\r\\\x05\x00\u00E4r\u00AB\u00B97\u00DA\x05=\u0099L\u0086\u00C3\u00E1\u00E9\u00E9\u00E9p8\x1C\n\u0085\u00C6\u00C6\u00C6\b!SSS\u00DD\u00CA\u00C5\u00C7O\u009E\x12b7\u009B\u00CD\x16\u00B0\u00F3\u00FEC\x7F\x7F\u00BF,\u00CB\u0099L&\u0091H\u00C8\u00B2\u00DC\u00D3\u00D3\u00A3iZ\"\u0091\u00C0\x18\u0087B\u00A1\u00D5\u00DCk\u00D34\x1D\u00C7ie\u00F0\x0B\u009El6+\u008A\u00A2\u00AA\u00AA\x00P.\u0097\x01 \x12\u0089 \u0084J\u00A5\u00D2\u00D6\u00D6Vt\u00E8F\u00ADv\u00EC\u00F1p- \u0095\u00BC\u00FD\u00F0\u00D1\u00B3J\u00A5\u00A2iZWW\u0097\u00D7\u00EB%\u0084\x1C\x1E\x1E\x16\u008B\u00C5\u00CD\u00CD\u00CD\u00DD\u00DD\u00DD\x07\u00F73\u0098\x10\u00DB>q\x18\x18\u00B8b\x18\x06\u00C6xee\u00E5\u00E8\u00E8\b!\u00D4l6m\u00DB\x16E\u00B1\u00B7\u00B7\u00B7P(\x04\u0083:C\u00D34\u008DZ\x00\u00C30\u00F9|~nnncc#\x16\u008B\x01\u00C0\u00F6\u00F6\u00F6\u00E0\u00E0`.\u0097K\u00A7\u00D3KKK,\u00CBtx;h\u009An\u0085F\b\x01\u0080\u00AE\u00EB\x00099\u0099J\u00A5\x00 \x1E\u008F\x03\x00!\x04\x00\x10\u0085X\u0086A\u00E8\u00C4\u0081\u00A2(\u00B7\u0091$\u0089\u00A2(\u00F7\u00E8\u00F3\u00F9\x04A\u00B0,\u00CB\x15\u00B8\u0085\u00CE\u00ED\u0085\u00A2(n#\b\x02\x00\x04\x02\u0081F\u00A3\u00F1\u00D7]r\x1CGUU\u00D341\u00C6\u0092$\u00ED\u00ED\u00ED)\u008Ab\u00DB\u00F6\u00AF\u009AS\u0087\u0091\u0091\u0091\u00FD\u00FD}UU\u00EB\u00F5\u00BAi\u009A\u00AE\u00B4\u00AF\u00AF\u00AFR\u00A9D\u00A3\u00D1\u00B6\u008Cj\u00AF\u00F7\u00A7\u00C2\u00F7\u00F9\u00F9\u00F9\u0089\u0089\u0089`0\u00D8~6\fcyyyvv\u00F6\u00F2\u00A5NU\u00ED\u00E6y\u00DF)P\u00AB\x1D\x17\u00BF\u00D5\x17\x17\x171\u00C6\x00`\u00DB6!\u0084\u00E7\u00F9\u00D1\u00D1QE\u00E6x\u00DE\u00E7\x02\u00A7\x19\x18\u0086\u00F6z\u00EAwR\u00B7l\u00DB9\u00F7\x134\u008DX\u008Ee\x18\u00FALh\u0096eE\u00BF\x00\x00\u00D8\u00C2\u00E7\x00\u0096cE\u00BF\u00C0\u00B2\u00EC\u0099\f\u00FFX?\x07\x00\u0091\u00AA\u00FEE\u0098\u00C1\u00C4\u0084\x00\x00\x00\x00IEND\u00AEB`\u0082",
		copy: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x11\x00\x00\x00\x13\b\x06\x00\x00\x00v\u00A5\u00E6\u00F1\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\nOiCCPPhotoshop ICC profile\x00\x00x\u00DA\u009DSgTS\u00E9\x16=\u00F7\u00DE\u00F4BK\u0088\u0080\u0094KoR\x15\b RB\u008B\u0080\x14\u0091&*!\t\x10J\u0088!\u00A1\u00D9\x15Q\u00C1\x11EE\x04\x1B\u00C8\u00A0\u0088\x03\u008E\u008E\u0080\u008C\x15Q,\f\u008A\n\u00D8\x07\u00E4!\u00A2\u008E\u0083\u00A3\u0088\u008A\u00CA\u00FB\u00E1{\u00A3k\u00D6\u00BC\u00F7\u00E6\u00CD\u00FE\u00B5\u00D7>\u00E7\u00AC\u00F3\u009D\u00B3\u00CF\x07\u00C0\b\f\u0096H3Q5\u0080\f\u00A9B\x1E\x11\u00E0\u0083\u00C7\u00C4\u00C6\u00E1\u00E4.@\u0081\n$p\x00\x10\b\u00B3d!s\u00FD#\x01\x00\u00F8~<<+\"\u00C0\x07\u00BE\x00\x01x\u00D3\x0B\b\x00\u00C0M\u009B\u00C00\x1C\u0087\u00FF\x0F\u00EAB\u0099\\\x01\u0080\u0084\x01\u00C0t\u00918K\b\u0080\x14\x00@z\u008EB\u00A6\x00@F\x01\u0080\u009D\u0098&S\x00\u00A0\x04\x00`\u00CBcb\u00E3\x00P-\x00`'\x7F\u00E6\u00D3\x00\u0080\u009D\u00F8\u0099{\x01\x00[\u0094!\x15\x01\u00A0\u0091\x00 \x13e\u0088D\x00h;\x00\u00AC\u00CFV\u008AE\x00X0\x00\x14fK\u00C49\x00\u00D8-\x000IWfH\x00\u00B0\u00B7\x00\u00C0\u00CE\x10\x0B\u00B2\x00\b\f\x000Q\u0088\u0085)\x00\x04{\x00`\u00C8##x\x00\u0084\u0099\x00\x14F\u00F2W<\u00F1+\u00AE\x10\u00E7*\x00\x00x\u0099\u00B2<\u00B9$9E\u0081[\b-q\x07WW.\x1E(\u00CEI\x17+\x146a\x02a\u009A@.\u00C2y\u0099\x192\u00814\x0F\u00E0\u00F3\u00CC\x00\x00\u00A0\u0091\x15\x11\u00E0\u0083\u00F3\u00FDx\u00CE\x0E\u00AE\u00CE\u00CE6\u008E\u00B6\x0E_-\u00EA\u00BF\x06\u00FF\"bb\u00E3\u00FE\u00E5\u00CF\u00ABp@\x00\x00\u00E1t~\u00D1\u00FE,/\u00B3\x1A\u0080;\x06\u0080m\u00FE\u00A2%\u00EE\x04h^\x0B\u00A0u\u00F7\u008Bf\u00B2\x0F@\u00B5\x00\u00A0\u00E9\u00DAW\u00F3p\u00F8~<<E\u00A1\u0090\u00B9\u00D9\u00D9\u00E5\u00E4\u00E4\u00D8J\u00C4B[a\u00CAW}\u00FEg\u00C2_\u00C0W\u00FDl\u00F9~<\u00FC\u00F7\u00F5\u00E0\u00BE\u00E2$\u00812]\u0081G\x04\u00F8\u00E0\u00C2\u00CC\u00F4L\u00A5\x1C\u00CF\u0092\t\u0084b\u00DC\u00E6\u008FG\u00FC\u00B7\x0B\u00FF\u00FC\x1D\u00D3\"\u00C4Ib\u00B9X*\x14\u00E3Q\x12q\u008ED\u009A\u008C\u00F32\u00A5\"\u0089B\u0092)\u00C5%\u00D2\u00FFd\u00E2\u00DF,\u00FB\x03>\u00DF5\x00\u00B0j>\x01{\u0091-\u00A8]c\x03\u00F6K'\x10Xt\u00C0\u00E2\u00F7\x00\x00\u00F2\u00BBo\u00C1\u00D4(\b\x03\u0080h\u0083\u00E1\u00CFw\u00FF\u00EF?\u00FDG\u00A0%\x00\u0080fI\u0092q\x00\x00^D$.T\u00CA\u00B3?\u00C7\b\x00\x00D\u00A0\u0081*\u00B0A\x1B\u00F4\u00C1\x18,\u00C0\x06\x1C\u00C1\x05\u00DC\u00C1\x0B\u00FC`6\u0084B$\u00C4\u00C2B\x10B\nd\u0080\x1Cr`)\u00AC\u0082B(\u0086\u00CD\u00B0\x1D*`/\u00D4@\x1D4\u00C0Qh\u0086\u0093p\x0E.\u00C2U\u00B8\x0E=p\x0F\u00FAa\b\u009E\u00C1(\u00BC\u0081\t\x04A\u00C8\b\x13a!\u00DA\u0088\x01b\u008AX#\u008E\b\x17\u0099\u0085\u00F8!\u00C1H\x04\x12\u008B$ \u00C9\u0088\x14Q\"K\u00915H1R\u008AT UH\x1D\u00F2=r\x029\u0087\\F\u00BA\u0091;\u00C8\x002\u0082\u00FC\u0086\u00BCG1\u0094\u0081\u00B2Q=\u00D4\f\u00B5C\u00B9\u00A87\x1A\u0084F\u00A2\x0B\u00D0dt1\u009A\u008F\x16\u00A0\u009B\u00D0r\u00B4\x1A=\u008C6\u00A1\u00E7\u00D0\u00ABh\x0F\u00DA\u008F>C\u00C70\u00C0\u00E8\x18\x073\u00C4l0.\u00C6\u00C3B\u00B18,\t\u0093c\u00CB\u00B1\"\u00AC\f\u00AB\u00C6\x1A\u00B0V\u00AC\x03\u00BB\u0089\u00F5c\u00CF\u00B1w\x04\x12\u0081E\u00C0\t6\x04wB a\x1EAHXLXN\u00D8H\u00A8 \x1C$4\x11\u00DA\t7\t\x03\u0084Q\u00C2'\"\u0093\u00A8K\u00B4&\u00BA\x11\u00F9\u00C4\x18b21\u0087XH,#\u00D6\x12\u008F\x13/\x10{\u0088C\u00C47$\x12\u0089C2'\u00B9\u0090\x02I\u00B1\u00A4T\u00D2\x12\u00D2F\u00D2nR#\u00E9,\u00A9\u009B4H\x1A#\u0093\u00C9\u00DAdk\u00B2\x079\u0094, +\u00C8\u0085\u00E4\u009D\u00E4\u00C3\u00E43\u00E4\x1B\u00E4!\u00F2[\n\u009Db@q\u00A4\u00F8S\u00E2(R\u00CAjJ\x19\u00E5\x10\u00E54\u00E5\x06e\u00982AU\u00A3\u009AR\u00DD\u00A8\u00A1T\x115\u008FZB\u00AD\u00A1\u00B6R\u00AFQ\u0087\u00A8\x134u\u009A9\u00CD\u0083\x16IK\u00A5\u00AD\u00A2\u0095\u00D3\x1Ah\x17h\u00F7i\u00AF\u00E8t\u00BA\x11\u00DD\u0095\x1EN\u0097\u00D0W\u00D2\u00CB\u00E9G\u00E8\u0097\u00E8\x03\u00F4w\f\r\u0086\x15\u0083\u00C7\u0088g(\x19\u009B\x18\x07\x18g\x19w\x18\u00AF\u0098L\u00A6\x19\u00D3\u008B\x19\u00C7T071\u00EB\u0098\u00E7\u0099\x0F\u0099oUX*\u00B6*|\x15\u0091\u00CA\n\u0095J\u0095&\u0095\x1B*/T\u00A9\u00AA\u00A6\u00AA\u00DE\u00AA\x0BU\u00F3U\u00CBT\u008F\u00A9^S}\u00AEFU3S\u00E3\u00A9\t\u00D4\u0096\u00ABU\u00AA\u009DP\u00EBS\x1BSg\u00A9;\u00A8\u0087\u00AAg\u00A8oT?\u00A4~Y\u00FD\u0089\x06Y\u00C3L\u00C3OC\u00A4Q\u00A0\u00B1_\u00E3\u00BC\u00C6 \x0Bc\x19\u00B3x,!k\r\u00AB\u0086u\u00815\u00C4&\u00B1\u00CD\u00D9|v*\u00BB\u0098\u00FD\x1D\u00BB\u008B=\u00AA\u00A9\u00A19C3J3W\u00B3R\u00F3\u0094f?\x07\u00E3\u0098q\u00F8\u009CtN\t\u00E7(\u00A7\u0097\u00F3~\u008A\u00DE\x14\u00EF)\u00E2)\x1B\u00A64L\u00B91e\\k\u00AA\u0096\u0097\u0096X\u00ABH\u00ABQ\u00ABG\u00EB\u00BD6\u00AE\u00ED\u00A7\u009D\u00A6\u00BDE\u00BBY\u00FB\u0081\x0EA\u00C7J'\\'Gg\u008F\u00CE\x05\u009D\u00E7S\u00D9S\u00DD\u00A7\n\u00A7\x16M=:\u00F5\u00AE.\u00AAk\u00A5\x1B\u00A1\u00BBDw\u00BFn\u00A7\u00EE\u0098\u009E\u00BE^\u0080\u009ELo\u00A7\u00DEy\u00BD\u00E7\u00FA\x1C}/\u00FDT\u00FDm\u00FA\u00A7\u00F5G\fX\x06\u00B3\f$\x06\u00DB\f\u00CE\x18<\u00C55qo<\x1D/\u00C7\u00DB\u00F1QC]\u00C3@C\u00A5a\u0095a\u0097\u00E1\u0084\u0091\u00B9\u00D1<\u00A3\u00D5F\u008DF\x0F\u008Ci\u00C6\\\u00E3$\u00E3m\u00C6m\u00C6\u00A3&\x06&!&KM\u00EAM\u00EE\u009ARM\u00B9\u00A6)\u00A6;L;L\u00C7\u00CD\u00CC\u00CD\u00A2\u00CD\u00D6\u00995\u009B=1\u00D72\u00E7\u009B\u00E7\u009B\u00D7\u009B\u00DF\u00B7`ZxZ,\u00B6\u00A8\u00B6\u00B8eI\u00B2\u00E4Z\u00A6Y\u00EE\u00B6\u00BCn\u0085Z9Y\u00A5XUZ]\u00B3F\u00AD\u009D\u00AD%\u00D6\u00BB\u00AD\u00BB\u00A7\x11\u00A7\u00B9N\u0093N\u00AB\u009E\u00D6g\u00C3\u00B0\u00F1\u00B6\u00C9\u00B6\u00A9\u00B7\x19\u00B0\u00E5\u00D8\x06\u00DB\u00AE\u00B6m\u00B6}agb\x17g\u00B7\u00C5\u00AE\u00C3\u00EE\u0093\u00BD\u0093}\u00BA}\u008D\u00FD=\x07\r\u0087\u00D9\x0E\u00AB\x1DZ\x1D~s\u00B4r\x14:V:\u00DE\u009A\u00CE\u009C\u00EE?}\u00C5\u00F4\u0096\u00E9/gX\u00CF\x10\u00CF\u00D83\u00E3\u00B6\x13\u00CB)\u00C4i\u009DS\u009B\u00D3Gg\x17g\u00B9s\u0083\u00F3\u0088\u008B\u0089K\u0082\u00CB.\u0097>.\u009B\x1B\u00C6\u00DD\u00C8\u00BD\u00E4Jt\u00F5q]\u00E1z\u00D2\u00F5\u009D\u009B\u00B3\u009B\u00C2\u00ED\u00A8\u00DB\u00AF\u00EE6\u00EEi\u00EE\u0087\u00DC\u009F\u00CC4\u009F)\u009EY3s\u00D0\u00C3\u00C8C\u00E0Q\u00E5\u00D1?\x0B\u009F\u00950k\u00DF\u00AC~OCO\u0081g\u00B5\u00E7#/c/\u0091W\u00AD\u00D7\u00B0\u00B7\u00A5w\u00AA\u00F7a\u00EF\x17>\u00F6>r\u009F\u00E3>\u00E3<7\u00DE2\u00DEY_\u00CC7\u00C0\u00B7\u00C8\u00B7\u00CBO\u00C3o\u009E_\u0085\u00DFC\x7F#\u00FFd\u00FFz\u00FF\u00D1\x00\u00A7\u0080%\x01g\x03\u0089\u0081A\u0081[\x02\u00FB\u00F8z|!\u00BF\u008E?:\u00DBe\u00F6\u00B2\u00D9\u00EDA\u008C\u00A0\u00B9A\x15A\u008F\u0082\u00AD\u0082\u00E5\u00C1\u00AD!h\u00C8\u00EC\u0090\u00AD!\u00F7\u00E7\u0098\u00CE\u0091\u00CEi\x0E\u0085P~\u00E8\u00D6\u00D0\x07a\u00E6a\u008B\u00C3~\f'\u0085\u0087\u0085W\u0086?\u008Ep\u0088X\x1A\u00D11\u00975w\u00D1\u00DCCs\u00DFD\u00FAD\u0096D\u00DE\u009Bg1O9\u00AF-J5*>\u00AA.j<\u00DA7\u00BA4\u00BA?\u00C6.fY\u00CC\u00D5X\u009DXIlK\x1C9.*\u00AE6nl\u00BE\u00DF\u00FC\u00ED\u00F3\u0087\u00E2\u009D\u00E2\x0B\u00E3{\x17\u0098/\u00C8]py\u00A1\u00CE\u00C2\u00F4\u0085\u00A7\x16\u00A9.\x12,:\u0096@L\u0088N8\u0094\u00F0A\x10*\u00A8\x16\u008C%\u00F2\x13w%\u008E\ny\u00C2\x1D\u00C2g\"/\u00D16\u00D1\u0088\u00D8C\\*\x1EN\u00F2H*Mz\u0092\u00EC\u0091\u00BC5y$\u00C53\u00A5,\u00E5\u00B9\u0084'\u00A9\u0090\u00BCL\rL\u00DD\u009B:\u009E\x16\u009Av m2=:\u00BD1\u0083\u0092\u0091\u0090qB\u00AA!M\u0093\u00B6g\u00EAg\u00E6fv\u00CB\u00ACe\u0085\u00B2\u00FE\u00C5n\u008B\u00B7/\x1E\u0095\x07\u00C9k\u00B3\u0090\u00AC\x05Y-\n\u00B6B\u00A6\u00E8TZ(\u00D7*\x07\u00B2geWf\u00BF\u00CD\u0089\u00CA9\u0096\u00AB\u009E+\u00CD\u00ED\u00CC\u00B3\u00CA\u00DB\u00907\u009C\u00EF\u009F\u00FF\u00ED\x12\u00C2\x12\u00E1\u0092\u00B6\u00A5\u0086KW-\x1DX\u00E6\u00BD\u00ACj9\u00B2<qy\u00DB\n\u00E3\x15\x05+\u0086V\x06\u00AC<\u00B8\u008A\u00B6*m\u00D5O\u00AB\u00EDW\u0097\u00AE~\u00BD&zMk\u0081^\u00C1\u00CA\u0082\u00C1\u00B5\x01k\u00EB\x0BU\n\u00E5\u0085}\u00EB\u00DC\u00D7\u00ED]OX/Y\u00DF\u00B5a\u00FA\u0086\u009D\x1B>\x15\u0089\u008A\u00AE\x14\u00DB\x17\u0097\x15\x7F\u00D8(\u00DCx\u00E5\x1B\u0087o\u00CA\u00BF\u0099\u00DC\u0094\u00B4\u00A9\u00AB\u00C4\u00B9d\u00CFf\u00D2f\u00E9\u00E6\u00DE-\u009E[\x0E\u0096\u00AA\u0097\u00E6\u0097\x0En\r\u00D9\u00DA\u00B4\r\u00DFV\u00B4\u00ED\u00F5\u00F6E\u00DB/\u0097\u00CD(\u00DB\u00BB\u0083\u00B6C\u00B9\u00A3\u00BF<\u00B8\u00BCe\u00A7\u00C9\u00CE\u00CD;?T\u00A4T\u00F4T\u00FAT6\u00EE\u00D2\u00DD\u00B5a\u00D7\u00F8n\u00D1\u00EE\x1B{\u00BC\u00F64\u00EC\u00D5\u00DB[\u00BC\u00F7\u00FD>\u00C9\u00BE\u00DBU\x01UM\u00D5f\u00D5e\u00FBI\u00FB\u00B3\u00F7?\u00AE\u0089\u00AA\u00E9\u00F8\u0096\u00FBm]\u00ADNmq\u00ED\u00C7\x03\u00D2\x03\u00FD\x07#\x0E\u00B6\u00D7\u00B9\u00D4\u00D5\x1D\u00D2=TR\u008F\u00D6+\u00EBG\x0E\u00C7\x1F\u00BE\u00FE\u009D\u00EFw-\r6\rU\u008D\u009C\u00C6\u00E2#pDy\u00E4\u00E9\u00F7\t\u00DF\u00F7\x1E\r:\u00DAv\u008C{\u00AC\u00E1\x07\u00D3\x1Fv\x1Dg\x1D/jB\u009A\u00F2\u009AF\u009BS\u009A\u00FB[b[\u00BAO\u00CC>\u00D1\u00D6\u00EA\u00DEz\u00FCG\u00DB\x1F\x0F\u009C4<YyJ\u00F3T\u00C9i\u00DA\u00E9\u0082\u00D3\u0093g\u00F2\u00CF\u008C\u009D\u0095\u009D}~.\u00F9\u00DC`\u00DB\u00A2\u00B6{\u00E7c\u00CE\u00DFj\x0Fo\u00EF\u00BA\x10t\u00E1\u00D2E\u00FF\u008B\u00E7;\u00BC;\u00CE\\\u00F2\u00B8t\u00F2\u00B2\u00DB\u00E5\x13W\u00B8W\u009A\u00AF:_m\u00EAt\u00EA<\u00FE\u0093\u00D3O\u00C7\u00BB\u009C\u00BB\u009A\u00AE\u00B9\\k\u00B9\u00EEz\u00BD\u00B5{f\u00F7\u00E9\x1B\u009E7\u00CE\u00DD\u00F4\u00BDy\u00F1\x16\u00FF\u00D6\u00D5\u009E9=\u00DD\u00BD\u00F3zo\u00F7\u00C5\u00F7\u00F5\u00DF\x16\u00DD~r'\u00FD\u00CE\u00CB\u00BB\u00D9w'\u00EE\u00AD\u00BCO\u00BC_\u00F4@\u00EDA\u00D9C\u00DD\u0087\u00D5?[\u00FE\u00DC\u00D8\u00EF\u00DC\x7Fj\u00C0w\u00A0\u00F3\u00D1\u00DCG\u00F7\x06\u0085\u0083\u00CF\u00FE\u0091\u00F5\u008F\x0FC\x05\u008F\u0099\u008F\u00CB\u0086\r\u0086\u00EB\u009E8>99\u00E2?r\u00FD\u00E9\u00FC\u00A7C\u00CFd\u00CF&\u009E\x17\u00FE\u00A2\u00FE\u00CB\u00AE\x17\x16/~\u00F8\u00D5\u00EB\u00D7\u00CE\u00D1\u0098\u00D1\u00A1\u0097\u00F2\u0097\u0093\u00BFm|\u00A5\u00FD\u00EA\u00C0\u00EB\x19\u00AF\u00DB\u00C6\u00C2\u00C6\x1E\u00BE\u00C9x31^\u00F4V\u00FB\u00ED\u00C1w\u00DCw\x1D\u00EF\u00A3\u00DF\x0FO\u00E4| \x7F(\u00FFh\u00F9\u00B1\u00F5S\u00D0\u00A7\u00FB\u0093\x19\u0093\u0093\u00FF\x04\x03\u0098\u00F3\u00FCc3-\u00DB\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F9\u00FF\x00\x00\u0080\u00E9\x00\x00u0\x00\x00\u00EA`\x00\x00:\u0098\x00\x00\x17o\u0092_\u00C5F\x00\x00\x01=IDATx\u00DA\u00ACT=K\x03A\x14\u009C=\u00DE\u00E6\u00C0B\x0E\u00D2x?\u00E0\u00E0*\x03ZYy\u0090\u00DA\x7F\u00A0\u00A0i\x04\u00D1 h'\u0088M\u00B0P\x0B\u00D3]#\"\u00B6V\u00A9\u00AD\u00AFJ\u00A1\u0085\u008D\u0085\u009D\u00B7\u0085i\u00BD\u00C2\u00E2Y\u00C4\u00BD\u00EC}$\u00DEi\x06\x16\u0096}o\u0086\u0099\x07\u00FB\x043\u00E3\u00BF\u00A0\u00FC\u0083\u00D8\u00BA\u00FA]\u00F5\u00FEX\x00\u00806@y\u00A2$\u00C2\u00A8\u00DF)\u00E56\u00BB7\x18\u00F5;h\x12\u00F1\u00D7\u00ED\u00A1\u00C881\u0089KGw\x19\u00A2\x19WJ\x023\u00E3\u00E3z\x07\u00AE$\x06 \x00\u00C0\u00D2E\u00D3I^D\x1FI\u0094\u00DE\u00DF/6\u00E1\u00EC\u0085\u009Cq\u00A2\u00D1\u0090r\u00AA\u0093\u0086\u0094\u00F0N\x1F\n\u00BD\u0094'\u00969\u00D1\u0088\u00BA\u00EB\u0088\u00E3\x18J)(\u00A5p\u00FE\u00B6\u0088I\x1C\u0083hF\u00CB\u00C7I\u0092\x04\u008E\u00E3\u00C0\u00F7}\x04A\u0090\u00F6R\u0095\u0099h\u00B8\u00AE\u009B\u00A9Iz\u00A9\u00E6d\x16~z\u0097K\u009CL\x1FlAd\u00DC\u00FBl\u0095\x11\u00EB\u00A0\u00D5\x1B\u008C\u00E3\u00CC\u0082m\u00DB\u00F5\u00FF\u00CE_\u0084,\u00CC\x01\x05'\u009F\u00AFC\u00AC\x1C\f+\x0B,x\u00AB\x10\u00CC\fo\u00FB\u00AC\u00D6R\u0089.\u00F7\u00D3{;\u008C\u0084`f\u00B4z\x03\x00\u00C0\u00E3\u00EEZ%\u00B1v\x18\u0089\u00A7\u0093\u008D\u00C9\x0E\u009A\u00C7f\u00FB\x1E\x00\u00F9\u00BEvdN8\u00D4\u00A8\x00\x00\x00\x00IEND\u00AEB`\u0082",
		info: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x17\x00\x00\x00\x17\b\x06\x00\x00\x00\u00E0*\u00D4\u00A0\x00\x00\nEiCCPICC Profile\x00\x00x\u009C\u009DSgTS\u00E9\x16=\u00F7\u00DE\u00F4BK\u0088\u0080\u0094KoR\x15\b RB\u008B\u0080Ti\u00A2\x12\u0092\x00\u00A1\u0084\x18\x12@\u00EC\u0088\u00A8\u00C0\u0088\u00A2\"\u0082\x15\x19\x14q\u00C0\u00D1\x11\u0090\u00B1\"\u008A\u0085A\u00B1\u00F7\x01y\b(\u00E3\u00E0(6T\u00DE\x0F\u00DE\x1A}\u00B3\u00E6\u00BD7o\u00F6\u00AF\u00BD\u00F69g\u009D\u00EF\u009C}>\x00F`\u00B0D\u009A\u0085\u00AA\x01dJ\x15\u00F2\u0088\x00\x1F<6.\x1E'w\x03\nT \u0081\x03\u0080@\u0098-\x0B\u0089\u00F4\u008F\x02\x00\u00E0\u00FB\u00F1\u00F0\u00EC\u0088\x00\x1F\u00F8\x02\x04\u00E0\u00CDm@\x00\x00n\u00D8\x04\u0086\u00E18\u00FC\x7FP\x17\u00CA\u00E4\n\x00$\f\x00\u00A6\u008B\u00C4\u00D9B\x00\u00A4\x10\x002r\x152\x05\x002\n\x00\u00EC\u00A4t\u0099\x02\x00%\x00\x00[\x1E\x1B\x17\x0F\u0080j\x01\x00;e\u0092O\x03\x00v\u00D2$\u00F7\x02\x00\u00B6(S*\x02@\u00A3\x00@&\u00CA\x14\u0089\x00\u00D0\x0E\x00X\u0097\u00A3\x14\u008B\x00\u00B0`\x00(\u00CA\u0091\u0088s\x01\u00B0\u009B\x00`\u0092\u00A1\u00CC\u0094\x00`\u00EF\x00\u0080\u009D)\x16d\x03\x10\x18\x00`\u00A2\x10\x0BS\x01\b\u00F6\x00\u00C0\u0090GE\u00F0\x00\b3\x01(\u008C\u0094\u00AFx\u00D2W\\!\u00CES\x00\x00\u00F0\u00B2d\u008B\u00E5\u0092\u0094T\x05n!\u00B4\u00C4\x1D\\]\u00B9x\u00A087C\u00ACP\u00D8\u0084\t\u0084\u00E9\x02\u00B9\b\u00E7ee\u00CA\x04\u00D2\u00C5\x00\u00933\x03\x00\u0080FvD\u0080\x0F\u00CE\u00F7\u00E39;\u00B8:;\u00DB8\u00DA:|\u00B5\u00A8\u00FF\x1A\u00FC\u008B\u0088\u008D\u008B\u00FF\u0097?\u00AF\u00C2\x01\x01\x00\u0084\u00D3\u00F5E\u00FB\u00B3\u00BC\u00AC\x1A\x00\u00EE\x18\x00\u00B6\u00F1\u008B\u0096\u00B4\x1D\u00A0e\r\u0080\u00D6\u00FD/\u009A\u00C9\x1E\x00\u00D5B\u0080\u00E6\u00AB_\u00CD\u00C3\u00E1\u00FB\u00F1\u00F0T\u0085B\u00E6fg\u0097\u009B\u009Bk+\x11\x0Bm\u0085\u00A9_\u00F5\u00F9\u009F\t\x7F\x01_\u00F5\u00B3\u00E5\u00FB\u00F1\u00F0\u00DF\u00D7\u0083\u00FB\u008A\u0093\x05\u00CA\f\x05\x1E\x11\u00E0\u0083\x0B\u00B32\u00B2\u0094r<[&\x10\u008Aq\u009B?\x1E\u00F1\u00DF.\u00FC\u00F3wL\u008B\x10'\u008B\u00E5b\u00A9P\u008CGK\u00C4\u00B9\x12i\n\u00CE\u00CB\u0092\u008A$\nI\u0096\x14\u0097H\u00FF\u0093\u0089\x7F\u00B3\u00EC\x0F\u0098\u00BCk\x00`\u00D5~\x06\u00F6B[P\u00BB\u00CA\x06\u00EC\u0097. \u00B0\u00E8\u0080%\u00EC\x02\x00\u00E4w\u00DF\u0082\u00A9\u00D1\x10\x06\x001\x06\u0083\u0093w\x0F\x000\u00F9\u009B\u00FF\x1Dh\x19\x00\u00A0\u00D9\u0092\x14\x1C\x00\u0080\x17\x11\u0085\x0B\u0095\u00F2\u009C\u00C9\x18\x01\x00\u0080\b4P\x056h\u0083>\x18\u0083\x05\u00D8\u0080#\u00B8\u0080;x\u0081\x1F\u00CC\u0086P\u0088\u00828X\x00BH\u0085L\u0090C.,\u0085UP\x04%\u00B0\x11\u00B6B\x15\u00EC\u0086Z\u00A8\u0087F8\x02-p\x02\u00CE\u00C2\x05\u00B8\x02\u00D7\u00E0\x16<\u0080^\x18\u0080\u00E70\no`\x1CA\x102\u00C2DX\u00886b\u0080\u0098\"\u00D6\u0088#\u00C2Ef!~H0\x12\u0081\u00C4!\u0089H\n\"E\u0094\u00C8Rd5R\u0082\u0094#U\u00C8^\u00A4\x1E\u00F9\x1E9\u008E\u009CE.!=\u00C8=\u00A4\x0F\x19F~C>\u00A0\x18\u00CA@\u00D9\u00A8\x1Ej\u0086\u00DA\u00A1\\\u00D4\x1B\rB\u00A3\u00D0\u00F9h\n\u00BA\b\u00CDG\x0B\u00D1\rh%Z\u0083\x1EB\u009B\u00D1\u00B3\u00E8\x15\u00F4\x16\u00DA\u008B>G\u00C70\u00C0\u00E8\x18\x073\u00C4l0.\u00C6\u00C3B\u00B1x,\x19\u0093c\u00CB\u00B1b\u00AC\x02\u00AB\u00C1\x1A\u00B16\u00AC\x13\u00BB\u0081\u00F5b#\u00D8{\x02\u0089\u00C0\"\u00E0\x04\x1B\u0082;!\u00900\u0097 $,\",'\u0094\x12\u00AA\b\x07\b\u00CD\u0084\x0E\u00C2\rB\x1Fa\u0094\u00F0\u0099\u00C8$\u00EA\x12\u00AD\u0089nD>1\u0096\u0098B\u00CC%\x16\x11+\u0088u\u00C4c\u00C4\u00F3\u00C4[\u00C4\x01\u00E2\x1B\x12\u0089\u00C4!\u0099\u0093\\H\u0081\u00A48R\x1Ai\t\u00A9\u0094\u00B4\u0093\u00D4D:C\u00EA!\u00F5\u0093\u00C6\u00C8d\u00B26\u00D9\u009A\u00ECA\x0E%\x0B\u00C8\nr\x11y;\u00F9\x10\u00F94\u00F9:y\u0080\u00FC\u008EB\u00A7\x18P\x1C)\u00FE\u0094x\u008A\u0094R@\u00A9\u00A0\x1C\u00A4\u009C\u00A2\\\u00A7\fR\u00C6\u00A9jTS\u00AA\x1B5\u0094*\u00A2.\u00A6\u0096Qk\u00A9m\u00D4\u00AB\u00D4\x01\u00EA8M\u009DfN\u00F3\u00A0E\u00D1\u00D2h\u00ABh\u0095\u00B4F\u00DAy\u00DAC\u00DA+:\u009DnDw\u00A5\u0087\u00D3%\u00F4\u0095\u00F4J\u00FAa\u00FAEz\x1F\u00FD=C\u0083a\u00C5\u00E01\x12\x18J\u00C6\x06\u00C6~\u00C6\x19\u00C6=\u00C6+&\u0093i\u00C6\u00F4b\u00C63\x15\u00CC\r\u00CCz\u00E69\u00E6c\u00E6;\x15\u0096\u008A\u00AD\n_E\u00A4\u00B2B\u00A5Z\u00A5Y\u00E5\u00BA\u00CA\x0BU\u00AA\u00AA\u00A9\u00AA\u00B7\u00EA\x02\u00D5|\u00D5\n\u00D5\u00A3\u00AAWUG\u00D4\u00A8jfj<5\u0081\u00DAr\u00B5j\u00B5\u00E3jw\u00D4\u00C6\u00D4Y\u00EA\x0E\u00EA\u00A1\u00EA\u0099\u00EA\u00A5\u00EA\x07\u00D5/\u00A9\x0Fi\u00905\u00CC4\u00FC4D\x1A\u0085\x1A\u00FB4\u00CEi\u00F4\u00B30\u00961\u008B\u00C7\x12\u00B2V\u00B3jY\u00E7Y\x03l\x12\u00DB\u009C\u00CDg\u00A7\u00B1K\u00D8\u00DF\u00B1\u00BB\u00D9\u00A3\u009A\x1A\u009A34\u00A35\u00F34\u00AB5Oj\u00F6r0\u008E\x19\u0087\u00CF\u00C9\u00E0\u0094q\u008Epns>L\u00D1\u009B\u00E2=E<e\u00FD\u0094\u00C6)\u00D7\u00A7\u00BC\u00D5\u009A\u00AA\u00E5\u00A5%\u00D6*\u00D6j\u00D2\u00BA\u00A5\u00F5A\x1B\u00D7\u00F6\u00D3N\u00D7\u00DE\u00A4\u00DD\u00A2\u00FDH\u0087\u00A0c\u00A5\x13\u00AE\u0093\u00AB\u00B3K\u00E7\u00BC\u00CE\u00C8T\u00F6T\u00F7\u00A9\u00C2\u00A9\u00C5S\u008FL\u00BD\u00AF\u008B\u00EAZ\u00E9F\u00E8.\u00D1\u00DD\u00A7\u00DB\u00A5;\u00A6\u00A7\u00AF\x17\u00A0'\u00D3\u00DB\u00AEwNoD\u009F\u00A3\u00EF\u00A5\u009F\u00A6\u00BFE\u00FF\u0094\u00FE\u00B0\x01\u00CB`\u0096\u0081\u00C4`\u008B\u00C1i\u0083g\u00B8&\u00EE\u008Dg\u00E0\u0095x\x07>j\u00A8k\x18h\u00A84\u00DCk\u00D8m8ndn4\u00D7\u00A8\u00C0\u00A8\u00C9\u00E8\u00911\u00CD\u0098k\u009Cl\u00BC\u00C5\u00B8\u00DDx\u00D4\u00C4\u00C0$\u00C4d\u00A9I\u0083\u00C9}S\u00AA)\u00D74\u00D5t\u009Bi\u00A7\u00E9[3s\u00B3\x18\u00B3\u00B5f-fC\u00E6Z\u00E6|\u00F3|\u00F3\x06\u00F3\u0087\x16L\x0BO\u008BE\x165\x167-I\u0096\\\u00CBt\u00CB\u009D\u0096\u00D7\u00ACP+'\u00ABT\u00ABj\u00AB\u00AB\u00D6\u00A8\u00B5\u00B3\u00B5\u00C4z\u00A7u\u00CF4\u00E24\u00D7i\u00D2i5\u00D3\u00EE\u00D80l\u00BCmrl\x1Al\u00FAl9\u00B6\u00C1\u00B6\x05\u00B6-\u00B6/\u00ECL\u00EC\u00E2\u00ED6\u00D9u\u00DA}\u00B6w\u00B2\u00CF\u00B0\u00AF\u00B5\x7F\u00E0\u00A0\u00E10\u00DB\u00A1\u00C0\u00A1\u00CD\u00E17G+G\u00A1c\u00B5\u00E3\u00CD\u00E9\u00CC\u00E9\u00FE\u00D3WLo\u009D\u00FEr\u0086\u00F5\f\u00F1\u008C]3\u00EE:\u00B1\u009CB\u009C\u00D6:\u00B5;}rvq\u0096;7:\x0F\u00BB\u0098\u00B8$\u00BA\u00ECp\u00B9\u00C3es\u00C3\u00B8\u00A5\u00DC\u008B\u00AEDW\x1F\u00D7\x15\u00AE'\\\u00DF\u00BB9\u00BB)\u00DC\u008E\u00B8\u00FD\u00EAn\u00E3\u009E\u00EE~\u00D0}h\u00A6\u00F9L\u00F1\u00CC\u00DA\u0099\u00FD\x1EF\x1E\x02\u008F\u00BD\x1E\u00BD\u00B3\u00F0Y\u0089\u00B3\u00F6\u00CC\u00EA\u00F54\u00F4\x14x\u00D6x>\u00F12\u00F6\x12y\u00D5y\rz[z\u00A7y\x1F\u00F2~\u00E1c\u00EF#\u00F79\u00E6\u00F3\u0096\u00E7\u00C6[\u00C6;\u00E3\u008B\u00F9\x06\u00F8\x16\u00FBv\u00FBi\u00F8\u00CD\u00F5\u00AB\u00F2{\u00ECo\u00E4\u009F\u00E2\u00DF\u00E0?\x1A\u00E0\x14\u00B0$\u00E0L 10(pS\u00E0\x1D\u00BE\x1E_\u00C8\u00AF\u00E7\u008F\u00CEv\u0099\u00BDlvG\x10#(2\u00A8*\u00E8I\u00B0U\u00B0<\u00B8-\x04\r\u0099\x1D\u00B29\u00E4\u00E1\x1C\u00D39\u00D29-\u00A1\x10\u00CA\x0F\u00DD\x1C\u00FA(\u00CC<lQ\u00D8\u008F\u00E1\u00A4\u00F0\u00B0\u00F0\u00EA\u00F0\u00A7\x11\x0E\x11K#:#Y\u0091\x0B#\x0FF\u00BE\u0089\u00F2\u0089*\u008Bz0\u00D7b\u00AErn{\u00B4jtBt}\u00F4\u00DB\x18\u00DF\u0098\u00F2\u0098\u00DEX\u00BB\u00D8e\u00B1W\u00E2t\u00E2$q\u00AD\u00F1\u00E4\u00F8\u00E8\u00F8\u00BA\u00F8\u00B1y~\u00F3\u00B6\u00CE\x1BHpJ(J\u00B8=\u00DF|~\u00DE\u00FCK\x0Bt\x16d,8\u00B9Pu\u00A1`\u00E1\u00D1DbbL\u00E2\u00C1\u00C4\u008F\u0082PA\u008D`,\u0089\u009F\u00B4#iT\u00C8\x13n\x13>\x17y\u0089\u00B6\u0088\u0086\u00C5\x1E\u00E2r\u00F1`\u00B2Gry\u00F2P\u008AG\u00CA\u00E6\u0094\u00E1T\u00CF\u00D4\u008A\u00D4\x11\tOR%y\u0099\x16\u0098\u00B6;\u00EDmzh\u00FA\u00FE\u00F4\u0089\u008C\u0098\u008C\u00A6LJfb\u00E6q\u00A9\u00864]\u00DA\u0091\u00A5\u009F\u0095\u0097\u00D5#\u00B3\u0096\x15\u00C9z\x17\u00B9-\u00DA\u00BAhT\x1E$\u00AF\u00CBF\u00B2\u00E7g\u00B7*\u00D8\n\u0099\u00A2Ki\u00A1\\\u00A3\u00EC\u00CB\u0099\u0095S\u009D\u00F3.7:\u00F7h\u009Ez\u009E4\u00AFk\u00B1\u00D5\u00E2\u00F5\u008B\x07\u00F3\u00FD\u00F3\u00BF]BX\"\\\u00D2\u00BE\u00D4p\u00E9\u00AA\u00A5}\u00CB\u00BC\u0097\u00ED]\u008E,OZ\u00DE\u00BE\u00C2xE\u00E1\u008A\u0081\u0095\x01+\x0F\u00AC\u00A2\u00ADJ_\u00F5S\u0081}Ay\u00C1\u00EB\u00D51\u00AB\u00DB\n\u00F5\nW\x16\u00F6\u00AF\tX\u00D3P\u00A4R$/\u00BA\u00B3\u00D6}\u00ED\u00EEu\u0084u\u0092u\u00DD\u00EB\u00A7\u00AF\u00DF\u00BE\u00FEs\u00B1\u00A8\u00F8r\u0089}IE\u00C9\u00C7Ra\u00E9\u00E5o\x1C\u00BE\u00A9\u00FCfbC\u00F2\u0086\u00EE2\u00E7\u00B2]\x1BI\x1B\u00A5\x1Boo\u00F2\u00DCt\u00A0\\\u00BD<\u00BF\u00BC\x7Fs\u00C8\u00E6\u00E6-\u00F8\u0096\u00E2-\u00AF\u00B7.\u00DCz\u00A9bF\u00C5\u00EEm\u00B4m\u00CAm\u00BD\u0095\u00C1\u0095\u00AD\u00DBM\u00B6o\u00DC\u00FE\u00B1*\u00B5\u00EAV\u00B5Ou\u00D3\x0E\u00DD\x1D\u00EBw\u00BC\u00DD)\u00DAy}\u0097\u00D7\u00AE\u00C6\u00DDz\u00BBKv\x7F\u00D8#\u00D9swo\u00C0\u00DE\u00E6\x1A\u00B3\u009A\u008A}\u00A4}9\u00FB\u009E\u00D6F\u00D7v~\u00CB\u00FD\u00B6\u00BEN\u00A7\u00AE\u00A4\u00EE\u00D3~\u00E9\u00FE\u00DE\x03\x11\x07:\u00EA]\u00EA\u00EB\x0F\u00EA\x1E,k@\x1B\u0094\r\u00C3\u0087\x12\x0E]\u00FB\u00CE\u00F7\u00BB\u00D6F\u009B\u00C6\u00BDM\u009C\u00A6\u0092\u00C3pXy\u00F8\u00D9\u00F7\u0089\u00DF\u00DF>\x12t\u00A4\u00FD(\u00F7h\u00E3\x0F\u00A6?\u00EC8\u00C6:V\u00DC\u008C4/n\x1EmIm\u00E9m\u008Dk\u00ED9>\u00FBx{\u009B{\u00DB\u00B1\x1Fm\x7F\u00DC\x7F\u00C2\u00F0D\u00F5I\u00CD\u0093e\u00A7h\u00A7\nOM\u009C\u00CE?=vFvf\u00E4l\u00CA\u00D9\u00FE\u00F6\u0085\u00ED\x0F\u00CE\u00C5\u009E\u00BB\u00D9\x11\u00DE\u00D1}>\u00E8\u00FC\u00C5\x0B\u00FE\x17\u00CEuzw\u009E\u00BE\u00E8q\u00F1\u00C4%\u00B7K\u00C7/s/\u00B7\\q\u00BE\u00D2\u00DC\u00E5\u00D4u\u00EC'\u00A7\u009F\u008Eu;w7_u\u00B9\u00DAz\u00CD\u00F5Z[\u00CF\u00CC\u009ES\u00D7=\u00AF\u009F\u00BD\u00E1{\u00E3\u00C2M\u00FE\u00CD+\u00B7\u00E6\u00DC\u00EA\u00B9=\u00F7\u00F6\u00DD;\twz\u00EF\u008A\u00EE\x0E\u00DD\u00CB\u00B8\u00F7\u00F2~\u00CE\u00FD\u00F1\x07+\x1F\x12\x1F\x16?R{T\u00F1X\u00F7q\u00CD\u00CF\u0096?7\u00F5:\u00F7\u009E\u00EC\u00F3\u00ED\u00EBz\x12\u00F9\u00E4A\u00BF\u00B0\u00FF\u00F9?\u00B2\u00FF\u00F1q\u00A0\u00F0)\u00F3i\u00C5\u00A0\u00C1`\u00FD\u0090\u00E3\u00D0\u0089a\u00FF\u00E1k\u00CF\u00E6=\x1Bx.{>>R\u00F4\u008B\u00FA/;^X\u00BC\u00F8\u00E1W\u00AF_\u00BBFcG\x07^\u00CA_N\u00FCV\u00FAJ\u00FB\u00D5\u00FE\u00D73^\u00B7\u008F\u0085\u008D=~\u0093\u00F9f\u00FCm\u00F1;\u00EDw\x07\u00DEs\u00DFw~\u0088\u00F908\u009E\u00FB\u0091\u00FC\u00B1\u00F2\u0093\u00E5\u00A7\u00B6\u00CFA\u009F\x1FNdNL\u00FC\x13\x03\u0098\u00F3\u00FC\x00\u009F`\u00FB\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x03\u00EAIDATH\u0089\u00ED\u0095K\u0088\u0095e\x18\u00C7\x7F\u00DF\u00E5\u00DC\u00BE3gn\u009E\x1C\u009D\u0099\x1C3\u00CC&$\t\x15\n\u009A\u00A2\x10\u0083 \\E;\u00A1U-Z\u00C4\x10]6-\u00DA\x04\x15\u00B8\x10]\u00B90\u00B1\u0095X\x0B\u00A5M\u0081\x0B\x17\u00A9eh\u0081h\u00A6\u00E9\u00983\u00E3\u00DC\u00CE\u00E5;\u00DF\u00ED\u00BD\u00B68gd\x0E\x1Em\u00D5\u00AE\x07\x1E\u00BE\u00C5\u00CB\u00FB\u00FB\u00FE\u00EF\u00F3\u00FE\u009F\u00E7\u0085\u00FF\u00A3G8\u008FZ<\u00FC\u00CD\u00E9!\u00DF\u00D7\u00EFjc\u00DF\u00D0\u00DA\u00BE \u0095\"\u008AS\u00E2,;\x1F\u0086\u00CD\u00D3\u00F3\u00F3sGN\x1C\u00FEr\x010\u00BD\u00F6{\x0F\x03\x1F:\u00FE\u00DD\u0087\u00C5\u0082\u00FFm\u00A9\u00AF\u00FAz\u00A92\u00F2x\u00A12\u008A\x1Fl _\x1E\u00C1\u00C9U\u00C6q\u00FCW\u0085L\u00DF\u00D9\u00B0\u00EDY\u00EF\u00CF_\x7F:\u00D7\u00EB\x07=\u00E1\x07\u008E\u009E8\x1E\x04\u00A5\u00E9JuK!_\x1A\u00C2q\u00F3<\u00B7\u00B5\u00CA\u00F6\u00CDC$\u00C2\u00B0\x18Z\u00B47\u0080\u00F2\u00FA\x0Bam\u00F6\u0095`\u00F4\u00C9\u00C9\u00F9k\u0097N\x03\x1A\u00B0\x0F\u0085\x7Fv\u00F8\u00EB\u00E9r\x10|082\u0089\u00EF\u00E5q\x1C\u0087u\u00FDEv=U\u00A5R\u00CA\u00B1u\u00AC\u009F\x1F\u00CE]!\x12>\u00B1\u00F40\u00C5qV\x16\u00FEz\u00C6\x1D\u00A8\u00AA\u00F0\u00EF\u00EB\u00E7\x01\u00B5\u00CAr\u00D7\u0082\u00DF?p`\x10\u00EB|Z\x1C\u00D8\u008C6\x0EB[\u00842\u00D4\u00C2\f!\u00DB\u00A7\u00BEq{\u0086zc\u0085f\"iD\u0092zl\u00A8\u008C\u00EE\"W\b\u00A6\x0Bc[\u00C6\u0081\u00DC*\u00CF_\x0B\x17M\u00FB\u00B6;64`(!\u00A4\u00C1uA\x1BK\u00BDe8\u00F6\u00E35H\x16\u00B8|}\u00964\u00BF\u0089z3#L\x04RJ\x1Co\u0080`\u00F0\u0089J\u00DF\u00BA\u00A5\u00FD\u00D9\u00DD\u009B_t\u00D4\u009B.\u00E5i\u0096\u00ED\u00B3~?Q\u00A6\u00882E\u009C\u00B6\u00B3\x11\t\\\u00D7\u00A7<\u00BC\u0089=/\u00BD\u00C8\u00C2\u00D22\u00B5VF\u0096\t\u0084\x10\u00A4Y\u0086\x17\u00AC\u00C7\u00F5s{\u0081\u00D2j\u00B9\u00BB\u0094\u00B7\u00E2\u00ECe\u00E9\x04\u00C4\u0099\u00C2\u0093\x0E\x16\x18\x1D\x0Exo\u00DFd\u00D7\u00BD|~\u00E8\b\u0085\u00F5;\u0091B\u00A0\u0094DI\u0089\u00E3\u00F7\u00E3x\u00DEn\u00A0\u00D8\u00E1\u00CAnx\u0094\u00D0\u008C-\u00F9\u009C\u00C4u\x1C\u00B46\u00CC-\u00C7\u00CC\u00CE\u00CD\u00F2\u00C9\u00FE)\u00AC\u00B5H)\u0091R@\u009A\"\u00A5D)\u0081\u00D1\x1A\u00A3\u00C1Z\x03\u0090\u00EF\u00A9\u00BC\x19E,7Z\u0094\u0083\"\u00C6X\u0084\u00B2dBs\u00EB\u009E@)\u0085\x10\u00ED\x1AgI\u0082IS\u0094\u0096X\u00AD0F\u00A3\u0095\x00c\u00A1\u00DD\u0098\u00CE\x03\u00F0F\u00ABu\u00F6\u00CE\u00DD\u0099\u00A9\u00EA\u00FA\t\u00A42hm\u00B0V\u00A3\u0094$\u008E\u00E3\u00FBp!\x04\u0088\x14\u00AD\x15X\u008D5\x16\x19-`\u0094\u00B8H\u00DB\u00E7\u00F6A\u00E5\u00B5\u00F0T\u00CC\u00D5)\u00E9W)\u00FA\u00E0`PR\u00A1\u0094\u00EA\u0082K\u0091\u00E1\u00A9\f\u00A3\rX\u0083\u00C5\u0092\u0085w1Y|\x06\x10\u00B4\u009B\u00A9\u00DB\u00E7Yk\u00E1h\u00B4r\u00B5Q_\u009A!l%DqJ\u0092\u00A6\u00EC\u0098\u00E8#\u008Ec\u0092$!I\x12\u00B6o\u00DB\u008AV\x12k$\u00D6(d\u00BC\u0088h\u00DC\x0E[s7N\x02i\u00C7\u008A\u00DD\x1D\u00DA\u009A\u009FIK#\u009B\u00AD\u0088\u00EE\u00ED\u00F1\u00CAc(\u00A5\u0099\x1C\u00EF\u00E3\u00A37\u009FF\bq?\u00A7vLp\u00F9\u00B7K\u00AC\u00A49\u00AC\x11\u00B4\u00E6~FF\u00F5\u0083\u00F1\u00DC\u00CD\u00B3@\x03\u00C8\x00\u00DBk*\u00E6\x1F\u00DB\u00F5\u00DA1\u00CF/\u00BC\u00D57\u00FA<\u00B9\u00C2 \u00C9\u00FC\x05\u008C6X\u00A3\u00DB\u008E\u00B0\x167W\u00C6)\x0E\x11/\u00FE\u008E\u008Ak\u00A7jW/|\f,\x03\u00B5Niz\x0E.\x13\u00CF\u00DE\u00F8>?\u00BCQ\u008A\u00E6\u00ED\u009DJD\x05/\x18!W\x19'W\u00DE\u0088W\x1C\u00C6:\x1E2\u00A9\u0093,]\te\u00DC8X\u00FF\u00E3\u0097\u00AF:\u008AWU\u00B3j\u009B^\u00E1\x02\u00C5Bul<\x18\u0099\u00D8\u00EF\u00BA\u00FE^\u00C7\u00F5v[,X\u008B\u00D5\u00F2\u00A2\x16\u00E9\u0099\u00F8\u00DE\u00AD\u0093\u00B2\u00B9\u00B2\x04\u0084\u009DLY3z\x1F\u00F5X8\u00B4\u0087P\u0091vK\x17i7\u0088C\u00DBj\u00A2\x03K:_\u00C9\u009Aq\u00FBo\u00F0\u00B5\u00A7\u00F0h\u00DB\u00D6[\x03\u00D7\u00B4]\u00A1y\u00C8K\u00F4\u009F\u00C6?\u00B5\x1F<c\u00C0\u009B\u00C2\u00DD\x00\x00\x00\x00IEND\u00AEB`\u0082",
		print: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x1A\x00\x00\x00\f\b\x04\x00\x00\x00\u00D6\u00CCe\u00C3\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x04gAMA\x00\x00\u00D8\u00EB\u00F5\x1C\x14\u00AA\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F4%\x00\x00\u0084\u00D1\x00\x00m_\x00\x00\u00E8l\x00\x00<\u008B\x00\x00\x1BX\u0083\u00E7\x07x\x00\x00\x01OIDATx\u00DAb\u00FC\u00CF@:\x00\b FdMR`\u0091\u00DC\x7F \u00EA/\u00C32\u0086\u00FF\r\x1F\u009B\x19\u00FE?\u00FB\x0F\x16gx\x06W\x07\x10@\f\u00FF\u0091\u00A0$\b2\u00B5\u00FD\x07\u0081\u00EF\u00FFC\u00FF\x0B\u00FF\u00B7L\u0091d\u0091d\u0084\u00C8 \u00D4\x01\x04\x10\x13\u00AA\u00C5\u00CF\x18\u00CCx\x18\x18\u00FE0|bx\u00CB\u00F0\u0090\u00C1\u008D\u00E1\u00C9leQ\x06f)F\x06&\x06F\u0084*\u0080\x00bD\u00F5S\u009E\u00BB\u00E4\x0E\x06\u0086\x14\u00A0\u00A6\u008F\f\u009F\x19\u00BE0D\x00\u00C5\u00F2\x19\u00E6\u00B1\x01\u00B5\u00FCy\u00F6\x0F\u00A6\n \u0080P\u009D\u00C7\fr\u00DA\u00DF\u00FF<px\u00E3\u00FF\u00C5\u00FFF\u00FF%U%\u00B9%Y\x10\u00EA\x00\x02\u0088\x055X\x18\x18\u00BE2\u00FCb\u00B8\u00CD\u00F0\x13\b\u009F\x00\x05\u009E\x02\u00F1-\x06\u00DE_\f,@a8\x00\b &tM\u00DF\u0080\u00F0+\x18r1038\x035\x03\x013\x03\u008A:\u0080\x00b\u00C1\u00D4\u00B4\u0092a\x13\u00C3E\u00A8\x00\x170P\u0080\x00-2\x01\x02\bU\x13\u00D0\u00C0\r\fk\x19\u00F61pC\u00F9\u00A6\f\u00C1\f\u00EC\x18\u00DA\x00\x02\b5rY\x19\u00B8\u0082\u00F70\u0098\u00FCe\u00B8\u00C3p\x1C.*i\u00F4\u00E5-\u00C3\x07\u0086o\u00CF\u00FE\u00C0D\x00\x02\bU\x13\x0B\x03\x07\x03/\u00D0\x1Av$?\u00FCc\u00F8\x01\u00F4\u00E0g\u0086\x1F\u00CF\u00FE\u00C2\u0084\x00\x02\f\x00\n\u009E{\u00B2*\u00CD\n_\x00\x00\x00\x00IEND\u00AEB`\u0082",
		rename: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x11\x00\x00\x00\x13\b\x06\x00\x00\x00v\u00A5\u00E6\u00F1\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\nOiCCPPhotoshop ICC profile\x00\x00x\u00DA\u009DSgTS\u00E9\x16=\u00F7\u00DE\u00F4BK\u0088\u0080\u0094KoR\x15\b RB\u008B\u0080\x14\u0091&*!\t\x10J\u0088!\u00A1\u00D9\x15Q\u00C1\x11EE\x04\x1B\u00C8\u00A0\u0088\x03\u008E\u008E\u0080\u008C\x15Q,\f\u008A\n\u00D8\x07\u00E4!\u00A2\u008E\u0083\u00A3\u0088\u008A\u00CA\u00FB\u00E1{\u00A3k\u00D6\u00BC\u00F7\u00E6\u00CD\u00FE\u00B5\u00D7>\u00E7\u00AC\u00F3\u009D\u00B3\u00CF\x07\u00C0\b\f\u0096H3Q5\u0080\f\u00A9B\x1E\x11\u00E0\u0083\u00C7\u00C4\u00C6\u00E1\u00E4.@\u0081\n$p\x00\x10\b\u00B3d!s\u00FD#\x01\x00\u00F8~<<+\"\u00C0\x07\u00BE\x00\x01x\u00D3\x0B\b\x00\u00C0M\u009B\u00C00\x1C\u0087\u00FF\x0F\u00EAB\u0099\\\x01\u0080\u0084\x01\u00C0t\u00918K\b\u0080\x14\x00@z\u008EB\u00A6\x00@F\x01\u0080\u009D\u0098&S\x00\u00A0\x04\x00`\u00CBcb\u00E3\x00P-\x00`'\x7F\u00E6\u00D3\x00\u0080\u009D\u00F8\u0099{\x01\x00[\u0094!\x15\x01\u00A0\u0091\x00 \x13e\u0088D\x00h;\x00\u00AC\u00CFV\u008AE\x00X0\x00\x14fK\u00C49\x00\u00D8-\x000IWfH\x00\u00B0\u00B7\x00\u00C0\u00CE\x10\x0B\u00B2\x00\b\f\x000Q\u0088\u0085)\x00\x04{\x00`\u00C8##x\x00\u0084\u0099\x00\x14F\u00F2W<\u00F1+\u00AE\x10\u00E7*\x00\x00x\u0099\u00B2<\u00B9$9E\u0081[\b-q\x07WW.\x1E(\u00CEI\x17+\x146a\x02a\u009A@.\u00C2y\u0099\x192\u00814\x0F\u00E0\u00F3\u00CC\x00\x00\u00A0\u0091\x15\x11\u00E0\u0083\u00F3\u00FDx\u00CE\x0E\u00AE\u00CE\u00CE6\u008E\u00B6\x0E_-\u00EA\u00BF\x06\u00FF\"bb\u00E3\u00FE\u00E5\u00CF\u00ABp@\x00\x00\u00E1t~\u00D1\u00FE,/\u00B3\x1A\u0080;\x06\u0080m\u00FE\u00A2%\u00EE\x04h^\x0B\u00A0u\u00F7\u008Bf\u00B2\x0F@\u00B5\x00\u00A0\u00E9\u00DAW\u00F3p\u00F8~<<E\u00A1\u0090\u00B9\u00D9\u00D9\u00E5\u00E4\u00E4\u00D8J\u00C4B[a\u00CAW}\u00FEg\u00C2_\u00C0W\u00FDl\u00F9~<\u00FC\u00F7\u00F5\u00E0\u00BE\u00E2$\u00812]\u0081G\x04\u00F8\u00E0\u00C2\u00CC\u00F4L\u00A5\x1C\u00CF\u0092\t\u0084b\u00DC\u00E6\u008FG\u00FC\u00B7\x0B\u00FF\u00FC\x1D\u00D3\"\u00C4Ib\u00B9X*\x14\u00E3Q\x12q\u008ED\u009A\u008C\u00F32\u00A5\"\u0089B\u0092)\u00C5%\u00D2\u00FFd\u00E2\u00DF,\u00FB\x03>\u00DF5\x00\u00B0j>\x01{\u0091-\u00A8]c\x03\u00F6K'\x10Xt\u00C0\u00E2\u00F7\x00\x00\u00F2\u00BBo\u00C1\u00D4(\b\x03\u0080h\u0083\u00E1\u00CFw\u00FF\u00EF?\u00FDG\u00A0%\x00\u0080fI\u0092q\x00\x00^D$.T\u00CA\u00B3?\u00C7\b\x00\x00D\u00A0\u0081*\u00B0A\x1B\u00F4\u00C1\x18,\u00C0\x06\x1C\u00C1\x05\u00DC\u00C1\x0B\u00FC`6\u0084B$\u00C4\u00C2B\x10B\nd\u0080\x1Cr`)\u00AC\u0082B(\u0086\u00CD\u00B0\x1D*`/\u00D4@\x1D4\u00C0Qh\u0086\u0093p\x0E.\u00C2U\u00B8\x0E=p\x0F\u00FAa\b\u009E\u00C1(\u00BC\u0081\t\x04A\u00C8\b\x13a!\u00DA\u0088\x01b\u008AX#\u008E\b\x17\u0099\u0085\u00F8!\u00C1H\x04\x12\u008B$ \u00C9\u0088\x14Q\"K\u00915H1R\u008AT UH\x1D\u00F2=r\x029\u0087\\F\u00BA\u0091;\u00C8\x002\u0082\u00FC\u0086\u00BCG1\u0094\u0081\u00B2Q=\u00D4\f\u00B5C\u00B9\u00A87\x1A\u0084F\u00A2\x0B\u00D0dt1\u009A\u008F\x16\u00A0\u009B\u00D0r\u00B4\x1A=\u008C6\u00A1\u00E7\u00D0\u00ABh\x0F\u00DA\u008F>C\u00C70\u00C0\u00E8\x18\x073\u00C4l0.\u00C6\u00C3B\u00B18,\t\u0093c\u00CB\u00B1\"\u00AC\f\u00AB\u00C6\x1A\u00B0V\u00AC\x03\u00BB\u0089\u00F5c\u00CF\u00B1w\x04\x12\u0081E\u00C0\t6\x04wB a\x1EAHXLXN\u00D8H\u00A8 \x1C$4\x11\u00DA\t7\t\x03\u0084Q\u00C2'\"\u0093\u00A8K\u00B4&\u00BA\x11\u00F9\u00C4\x18b21\u0087XH,#\u00D6\x12\u008F\x13/\x10{\u0088C\u00C47$\x12\u0089C2'\u00B9\u0090\x02I\u00B1\u00A4T\u00D2\x12\u00D2F\u00D2nR#\u00E9,\u00A9\u009B4H\x1A#\u0093\u00C9\u00DAdk\u00B2\x079\u0094, +\u00C8\u0085\u00E4\u009D\u00E4\u00C3\u00E43\u00E4\x1B\u00E4!\u00F2[\n\u009Db@q\u00A4\u00F8S\u00E2(R\u00CAjJ\x19\u00E5\x10\u00E54\u00E5\x06e\u00982AU\u00A3\u009AR\u00DD\u00A8\u00A1T\x115\u008FZB\u00AD\u00A1\u00B6R\u00AFQ\u0087\u00A8\x134u\u009A9\u00CD\u0083\x16IK\u00A5\u00AD\u00A2\u0095\u00D3\x1Ah\x17h\u00F7i\u00AF\u00E8t\u00BA\x11\u00DD\u0095\x1EN\u0097\u00D0W\u00D2\u00CB\u00E9G\u00E8\u0097\u00E8\x03\u00F4w\f\r\u0086\x15\u0083\u00C7\u0088g(\x19\u009B\x18\x07\x18g\x19w\x18\u00AF\u0098L\u00A6\x19\u00D3\u008B\x19\u00C7T071\u00EB\u0098\u00E7\u0099\x0F\u0099oUX*\u00B6*|\x15\u0091\u00CA\n\u0095J\u0095&\u0095\x1B*/T\u00A9\u00AA\u00A6\u00AA\u00DE\u00AA\x0BU\u00F3U\u00CBT\u008F\u00A9^S}\u00AEFU3S\u00E3\u00A9\t\u00D4\u0096\u00ABU\u00AA\u009DP\u00EBS\x1BSg\u00A9;\u00A8\u0087\u00AAg\u00A8oT?\u00A4~Y\u00FD\u0089\x06Y\u00C3L\u00C3OC\u00A4Q\u00A0\u00B1_\u00E3\u00BC\u00C6 \x0Bc\x19\u00B3x,!k\r\u00AB\u0086u\u00815\u00C4&\u00B1\u00CD\u00D9|v*\u00BB\u0098\u00FD\x1D\u00BB\u008B=\u00AA\u00A9\u00A19C3J3W\u00B3R\u00F3\u0094f?\x07\u00E3\u0098q\u00F8\u009CtN\t\u00E7(\u00A7\u0097\u00F3~\u008A\u00DE\x14\u00EF)\u00E2)\x1B\u00A64L\u00B91e\\k\u00AA\u0096\u0097\u0096X\u00ABH\u00ABQ\u00ABG\u00EB\u00BD6\u00AE\u00ED\u00A7\u009D\u00A6\u00BDE\u00BBY\u00FB\u0081\x0EA\u00C7J'\\'Gg\u008F\u00CE\x05\u009D\u00E7S\u00D9S\u00DD\u00A7\n\u00A7\x16M=:\u00F5\u00AE.\u00AAk\u00A5\x1B\u00A1\u00BBDw\u00BFn\u00A7\u00EE\u0098\u009E\u00BE^\u0080\u009ELo\u00A7\u00DEy\u00BD\u00E7\u00FA\x1C}/\u00FDT\u00FDm\u00FA\u00A7\u00F5G\fX\x06\u00B3\f$\x06\u00DB\f\u00CE\x18<\u00C55qo<\x1D/\u00C7\u00DB\u00F1QC]\u00C3@C\u00A5a\u0095a\u0097\u00E1\u0084\u0091\u00B9\u00D1<\u00A3\u00D5F\u008DF\x0F\u008Ci\u00C6\\\u00E3$\u00E3m\u00C6m\u00C6\u00A3&\x06&!&KM\u00EAM\u00EE\u009ARM\u00B9\u00A6)\u00A6;L;L\u00C7\u00CD\u00CC\u00CD\u00A2\u00CD\u00D6\u00995\u009B=1\u00D72\u00E7\u009B\u00E7\u009B\u00D7\u009B\u00DF\u00B7`ZxZ,\u00B6\u00A8\u00B6\u00B8eI\u00B2\u00E4Z\u00A6Y\u00EE\u00B6\u00BCn\u0085Z9Y\u00A5XUZ]\u00B3F\u00AD\u009D\u00AD%\u00D6\u00BB\u00AD\u00BB\u00A7\x11\u00A7\u00B9N\u0093N\u00AB\u009E\u00D6g\u00C3\u00B0\u00F1\u00B6\u00C9\u00B6\u00A9\u00B7\x19\u00B0\u00E5\u00D8\x06\u00DB\u00AE\u00B6m\u00B6}agb\x17g\u00B7\u00C5\u00AE\u00C3\u00EE\u0093\u00BD\u0093}\u00BA}\u008D\u00FD=\x07\r\u0087\u00D9\x0E\u00AB\x1DZ\x1D~s\u00B4r\x14:V:\u00DE\u009A\u00CE\u009C\u00EE?}\u00C5\u00F4\u0096\u00E9/gX\u00CF\x10\u00CF\u00D83\u00E3\u00B6\x13\u00CB)\u00C4i\u009DS\u009B\u00D3Gg\x17g\u00B9s\u0083\u00F3\u0088\u008B\u0089K\u0082\u00CB.\u0097>.\u009B\x1B\u00C6\u00DD\u00C8\u00BD\u00E4Jt\u00F5q]\u00E1z\u00D2\u00F5\u009D\u009B\u00B3\u009B\u00C2\u00ED\u00A8\u00DB\u00AF\u00EE6\u00EEi\u00EE\u0087\u00DC\u009F\u00CC4\u009F)\u009EY3s\u00D0\u00C3\u00C8C\u00E0Q\u00E5\u00D1?\x0B\u009F\u00950k\u00DF\u00AC~OCO\u0081g\u00B5\u00E7#/c/\u0091W\u00AD\u00D7\u00B0\u00B7\u00A5w\u00AA\u00F7a\u00EF\x17>\u00F6>r\u009F\u00E3>\u00E3<7\u00DE2\u00DEY_\u00CC7\u00C0\u00B7\u00C8\u00B7\u00CBO\u00C3o\u009E_\u0085\u00DFC\x7F#\u00FFd\u00FFz\u00FF\u00D1\x00\u00A7\u0080%\x01g\x03\u0089\u0081A\u0081[\x02\u00FB\u00F8z|!\u00BF\u008E?:\u00DBe\u00F6\u00B2\u00D9\u00EDA\u008C\u00A0\u00B9A\x15A\u008F\u0082\u00AD\u0082\u00E5\u00C1\u00AD!h\u00C8\u00EC\u0090\u00AD!\u00F7\u00E7\u0098\u00CE\u0091\u00CEi\x0E\u0085P~\u00E8\u00D6\u00D0\x07a\u00E6a\u008B\u00C3~\f'\u0085\u0087\u0085W\u0086?\u008Ep\u0088X\x1A\u00D11\u00975w\u00D1\u00DCCs\u00DFD\u00FAD\u0096D\u00DE\u009Bg1O9\u00AF-J5*>\u00AA.j<\u00DA7\u00BA4\u00BA?\u00C6.fY\u00CC\u00D5X\u009DXIlK\x1C9.*\u00AE6nl\u00BE\u00DF\u00FC\u00ED\u00F3\u0087\u00E2\u009D\u00E2\x0B\u00E3{\x17\u0098/\u00C8]py\u00A1\u00CE\u00C2\u00F4\u0085\u00A7\x16\u00A9.\x12,:\u0096@L\u0088N8\u0094\u00F0A\x10*\u00A8\x16\u008C%\u00F2\x13w%\u008E\ny\u00C2\x1D\u00C2g\"/\u00D16\u00D1\u0088\u00D8C\\*\x1EN\u00F2H*Mz\u0092\u00EC\u0091\u00BC5y$\u00C53\u00A5,\u00E5\u00B9\u0084'\u00A9\u0090\u00BCL\rL\u00DD\u009B:\u009E\x16\u009Av m2=:\u00BD1\u0083\u0092\u0091\u0090qB\u00AA!M\u0093\u00B6g\u00EAg\u00E6fv\u00CB\u00ACe\u0085\u00B2\u00FE\u00C5n\u008B\u00B7/\x1E\u0095\x07\u00C9k\u00B3\u0090\u00AC\x05Y-\n\u00B6B\u00A6\u00E8TZ(\u00D7*\x07\u00B2geWf\u00BF\u00CD\u0089\u00CA9\u0096\u00AB\u009E+\u00CD\u00ED\u00CC\u00B3\u00CA\u00DB\u00907\u009C\u00EF\u009F\u00FF\u00ED\x12\u00C2\x12\u00E1\u0092\u00B6\u00A5\u0086KW-\x1DX\u00E6\u00BD\u00ACj9\u00B2<qy\u00DB\n\u00E3\x15\x05+\u0086V\x06\u00AC<\u00B8\u008A\u00B6*m\u00D5O\u00AB\u00EDW\u0097\u00AE~\u00BD&zMk\u0081^\u00C1\u00CA\u0082\u00C1\u00B5\x01k\u00EB\x0BU\n\u00E5\u0085}\u00EB\u00DC\u00D7\u00ED]OX/Y\u00DF\u00B5a\u00FA\u0086\u009D\x1B>\x15\u0089\u008A\u00AE\x14\u00DB\x17\u0097\x15\x7F\u00D8(\u00DCx\u00E5\x1B\u0087o\u00CA\u00BF\u0099\u00DC\u0094\u00B4\u00A9\u00AB\u00C4\u00B9d\u00CFf\u00D2f\u00E9\u00E6\u00DE-\u009E[\x0E\u0096\u00AA\u0097\u00E6\u0097\x0En\r\u00D9\u00DA\u00B4\r\u00DFV\u00B4\u00ED\u00F5\u00F6E\u00DB/\u0097\u00CD(\u00DB\u00BB\u0083\u00B6C\u00B9\u00A3\u00BF<\u00B8\u00BCe\u00A7\u00C9\u00CE\u00CD;?T\u00A4T\u00F4T\u00FAT6\u00EE\u00D2\u00DD\u00B5a\u00D7\u00F8n\u00D1\u00EE\x1B{\u00BC\u00F64\u00EC\u00D5\u00DB[\u00BC\u00F7\u00FD>\u00C9\u00BE\u00DBU\x01UM\u00D5f\u00D5e\u00FBI\u00FB\u00B3\u00F7?\u00AE\u0089\u00AA\u00E9\u00F8\u0096\u00FBm]\u00ADNmq\u00ED\u00C7\x03\u00D2\x03\u00FD\x07#\x0E\u00B6\u00D7\u00B9\u00D4\u00D5\x1D\u00D2=TR\u008F\u00D6+\u00EBG\x0E\u00C7\x1F\u00BE\u00FE\u009D\u00EFw-\r6\rU\u008D\u009C\u00C6\u00E2#pDy\u00E4\u00E9\u00F7\t\u00DF\u00F7\x1E\r:\u00DAv\u008C{\u00AC\u00E1\x07\u00D3\x1Fv\x1Dg\x1D/jB\u009A\u00F2\u009AF\u009BS\u009A\u00FB[b[\u00BAO\u00CC>\u00D1\u00D6\u00EA\u00DEz\u00FCG\u00DB\x1F\x0F\u009C4<YyJ\u00F3T\u00C9i\u00DA\u00E9\u0082\u00D3\u0093g\u00F2\u00CF\u008C\u009D\u0095\u009D}~.\u00F9\u00DC`\u00DB\u00A2\u00B6{\u00E7c\u00CE\u00DFj\x0Fo\u00EF\u00BA\x10t\u00E1\u00D2E\u00FF\u008B\u00E7;\u00BC;\u00CE\\\u00F2\u00B8t\u00F2\u00B2\u00DB\u00E5\x13W\u00B8W\u009A\u00AF:_m\u00EAt\u00EA<\u00FE\u0093\u00D3O\u00C7\u00BB\u009C\u00BB\u009A\u00AE\u00B9\\k\u00B9\u00EEz\u00BD\u00B5{f\u00F7\u00E9\x1B\u009E7\u00CE\u00DD\u00F4\u00BDy\u00F1\x16\u00FF\u00D6\u00D5\u009E9=\u00DD\u00BD\u00F3zo\u00F7\u00C5\u00F7\u00F5\u00DF\x16\u00DD~r'\u00FD\u00CE\u00CB\u00BB\u00D9w'\u00EE\u00AD\u00BCO\u00BC_\u00F4@\u00EDA\u00D9C\u00DD\u0087\u00D5?[\u00FE\u00DC\u00D8\u00EF\u00DC\x7Fj\u00C0w\u00A0\u00F3\u00D1\u00DCG\u00F7\x06\u0085\u0083\u00CF\u00FE\u0091\u00F5\u008F\x0FC\x05\u008F\u0099\u008F\u00CB\u0086\r\u0086\u00EB\u009E8>99\u00E2?r\u00FD\u00E9\u00FC\u00A7C\u00CFd\u00CF&\u009E\x17\u00FE\u00A2\u00FE\u00CB\u00AE\x17\x16/~\u00F8\u00D5\u00EB\u00D7\u00CE\u00D1\u0098\u00D1\u00A1\u0097\u00F2\u0097\u0093\u00BFm|\u00A5\u00FD\u00EA\u00C0\u00EB\x19\u00AF\u00DB\u00C6\u00C2\u00C6\x1E\u00BE\u00C9x31^\u00F4V\u00FB\u00ED\u00C1w\u00DCw\x1D\u00EF\u00A3\u00DF\x0FO\u00E4| \x7F(\u00FFh\u00F9\u00B1\u00F5S\u00D0\u00A7\u00FB\u0093\x19\u0093\u0093\u00FF\x04\x03\u0098\u00F3\u00FCc3-\u00DB\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F9\u00FF\x00\x00\u0080\u00E9\x00\x00u0\x00\x00\u00EA`\x00\x00:\u0098\x00\x00\x17o\u0092_\u00C5F\x00\x00\x01\u0081IDATx\u00DA\u00ACT=H\u00C3@\x18}\x17\u00EE*8\u00D8\u0084R0c\u0087H'\x03:9X\n\u009D\u00A5S7\u0085\u00DAE\x10\u0095@\u00DC\u0084\u00E2\u00D2IS\u00F0\x06!K\u0090\u00E0\u00AAP\u00BA\u00C6\u00B9S\u00A1:\t.\u009D\u009C\ft\u00EA\u00E2p\x0E\u009A\u0098\u00A4\u00D1F\u00EC\u0083\u0083\u00FBy\u00EF\u00F1\u00BE;\u00EE#B\b\u00FC\x174\u00B9A\u00F6\u00AC\u00F9\u00AE\u00B7\u00A7\x04\x00\u0082\x004)d\u0094\u00C2\u00E7\u00ADTm\u00E1\u00C4\u0081\u00CF[(P*\u00DEo\f\x12K\x12\x15\u00AE\u009AnL\x18-\u00971\n!\x04\u00DE\u00AE\u00F6\u00A12*\x00\x10\x00\u0090\u0082\u00C3h\u0092\u00A4I0\x18\u00A5\u00E1\u00FC\u00F5b\x17\u00F2\u00A1-bI\x02\u00E4\x18\u00FB1I\u008E1h\u00ED\u00BB\x19\u00AE\u0094\x14F\r\u00EB\u00F5:\x14E\u0081\u00A2((\u0095Jh.=\u00E3\u00BE\u00B1\u0086\u00EB\u00ED\x15\u00B4\u00B5i\u00C8\u0095\u0092\u00C2hi\x00\u00D0\u00EDv\u00E1\u00FB>\x1C\u00C7\u0081m\u00DB\u00F0<\x0F\u00E5r\x19\u00D5j5\u00E4\u00CE\u00BD\u0093\u00A0\u00A4J\u00A5\x02\u00C300\x1A\u008D\u00A0\u00AA*TU\u00CD\u009E$\nY\u00961\u0099L\u0092\u00DCu:\u009B\u0084\u00A5\u00BE\x0E\x00\u008C\u00C7c\u00E4\u00F3\u00F9p\u00FD\u00C5}\u00A2i\u00C24\u00B8\u00AE\x0B\u00CE9<\u00CF\u008B\u00ED\u00EB\u009D\u00FEg9\u00BF\u00C14M\x14\u008BEp\u00CEaY\x16t]\u009F\u00FFw\u00A2\u00E8\u00F5z\u0099>\u00A0\u0084\x05`&\u00C9\u00F4e\u0088\u008D\u00E3af\u0083em\x13D\b\x01\u00ADy\u00FE\u00A7\u00A62\u00B8<\n\u00E75{@\u0088\x10\x02z\u00A7\x0F\x00x8\u00D8\u00CAdV\u00B3\x07\u00E4\u00F1l\u00E7\u00BB\x07-\u00A2\u00B3}\f\x00\bq\u008A0L\x0E\x1F\u00CF\x00\x00\x00\x00IEND\u00AEB`\u0082",
		save: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x16\x00\x00\x00\x12\b\x06\x00\x00\x00_%.-\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x04gAMA\x00\x00\u00D8\u00EB\u00F5\x1C\x14\u00AA\x00\x00\x00 cHRM\x00\x00z%\x00\x00\u0080\u0083\x00\x00\u00F4%\x00\x00\u0084\u00D1\x00\x00m_\x00\x00\u00E8l\x00\x00<\u008B\x00\x00\x1BX\u0083\u00E7\x07x\x00\x00\x02\u00F2IDATx\u00DAb\u00FC\u00FF\u00FF?\x03-\x00@\x00\u00B1 sd\u00E5\u00CC\u0099\\\x03\u00A6\u00FEe`\x02r@\u0098\x19\u008A\x19\u00910\u00CC\x1D\u00FF!\u00FC\u00DD+\u00F3\u00B8\x18\u0098\u0098\u00FE00\u00FC\u00FE\u00FB\u00FF\u00CB\u00A3\x7F0\u00B3\x00\x02\b\u00C5`\x06&V\u00901\f\u00DD\u00F5z\f_\u00BF\u00FFaX\u00BAp\"CAA\x01\u00C3\u00BF\x7F\u00FF\u00C0\u0098\u008F\u008F\x0F\u00AC\u00EC\u00D5\u00ABW\fbbb\fiMg\x18\u00BE\u00FE\u00FC\u00F9\u008D\u009B\u008BC\u0084\u0081\u0089\u00FD+#\u00AF\u00DC\u00AF\u00FF\u009F!\u0086\x03\x04\x10\x13\u008A\u00C1\u00FF\u00FF\u00B1\u0080\\\u00F1\u00FD\u00C7_\u0086o@|\u00EC\u00F81\u00B8\u00A1\x7F\u00FF\u00C2\x1D\x03\u00E6\u0083\u00C0\u00C7\u00DF\u00BF\x19LB\u00FB\x19\u00BE\u00FE\u00F8\u00F1\u0086\u0081\u00F1??\x03\x0B;\x1B#\u009F\x1C\u00D8L\u0080\x00Bu1#3\u0098\u00FF\u00E5\u00DB\x1F\u00B0\u008B\u009F>y\n1\u00F4\u00DF_\u00B8a \u00F0\u00F7\u00EF_0\u00FD\u00E1\u00C7o\u0086\x1F\x7F\u00BE\u00C2\u0082I\u0094\u00E1\u00FF\u00DF?\f\u00CC\u00AC \u00C9\x7F\x00\x01\u00C4\u0082\u00E6bF\u00B0\u00C1_\u00FF0|\u00FA\u00F6\u009B\u00E1\u00DD\u00BBw\f\u00FF\u00FE\u00FE\u0085\u00BA\u00F8/\u00C3\u008B\x17/\u00C0\u00F4?\u00A8\u00EB\u00BF\u00FD\u00FA\u00CA\u00F0\u00FB\u00D7G\u00A8\u00C1L\"@\x03\u00BE0\u00FC\u00FB\u00FD\x1D\u00C8\u00FB\x03\x10@,\x18\u00D1\tT\u00F4\u00E9\u00CBo\u0086/@\x17\u00DBF\u00ADb\x10\x10\x14\u00C4\x1A\u00EB\x06\x11\x13\x18~\u00FF\u00F8\u00C0\u00F0\u00FB'\u00D4`\u0086\u00FF<@\u0082\x03\u00C8a\x05\u00D2\u00DF\x01\x02\u0088\x05\u009B&\u0090\u008B?\x02]l\u00A1/\u00CC\u00A0\u00B5\u00E0:\u00C3\u00C7\u00EF\u00BF\x19\u00DE\x7F\u00FD\u00C5\u00F0\x11\u00E8\u00F5\x0F_\x7F3|\u00FB\u00FE\x15b\u00E8\u008F\u008F\f\u00BF\u00BF\x7F\u0084:\u0088\u0091\x05\u0098RX\u00FE\u00FF\u00FF\x0B\ncF\u0080\x00\u00C2\u00EA\u00E2\u00CF\u00C00\u00DE\u00B0\u00EF\x19\u00C3\u00BAIVx\u00D3\u00AA\u009A{!\x033;\x17rX2\u00C2X\x00\x01\u00C4\u0082n(\b\x7F\u00F8\u00FC\x1Bl(<L\u00A1a\f\n\u00EF\u00BF\u00B0\u00C8\x04\u0086\u00B3\u0096\u0096\x16\u0083\u00AA[\x1E\u00D4L\u00A8\u00A1\u0090xb\x04\b L\x17\x03=\u00F2\x11\u00E8]X\u00EC\u00C3\f\u0085\u00B1A\x06\u00C2\u0092 \b\u00FC\u00FE\u00FE\t\u00C9\u00C1\b\x17\x03\x04\x10\u00D6\u00A0\u00F8\u00F8\u00E57<\u00BD\u00A2\x18\u00FA\x0F\u00E2bd\u0083\u00FF\u00FE\u00FA\u00865\u0098\x00\x02\u0088\t\u009B\u00C8\u00FB/\u00BF\u00E0.F\x18\n\u00C9$\u00FF\u00D0\f\u00FE\u00F3\u00F3+V\u0083\x01\x02\u0088\t#\u008C\u0081\"\u009F\u00BE\u00A3\x06\x05<\u008C\u0091\f\u0085\x15^\x7F\x7Fbw1@\x00aF\x1EPd\u00D7\u00FCl\x06AY#\x06\x13\u00C7PD\u00E1\u0083\x05\b*\x18!\u0092\x1B\x1A\x00\b F\u00E4bSV\u00C5\u0096\x17\u00E8bI`i\u00A5\u00C8\u00C0\u00C4(\n4\u0090\x0B\u0097\u00A1\u00A8\u00E0\u00FF\x0F\u00A0\x17\u00DE0\u00FC\u00FBs\u00FF\u00FF\u00BF\u00DF/\x18>=\u00F9\x04\x10@h\u0091\x07\u00CC\u00EB\u008C\u00CC@\u00BF\u00FD\u00FF\x00\u00C4\u00A0`\u00FA\u00CA@Tq\u00FD\u00FF\x170\u0099}\x00\u0096\x15?\x18\u00FE\u00FE\u00FE\x03\x12\x01\b \u00B4b\x13X\u00AE\u00FE\u00FF\u00FD\x19h\u00F8s\u00A0\x0B>1\u00FCc`\x03\u0096Z\u0084\u00DD\u00FC\u00FF?0R\u00FE\x7F\u00FF\u00FF\u00F7\u00D7gpA\x04\u00E4\x00\x04\x18\x00\u00CD&\u00AA2\fs\x1B\x05\x00\x00\x00\x00IEND\u00AEB`\u0082",
		update: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x12\x00\x00\x00\x12\b\x06\x00\x00\x00V\u00CE\u008EW\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x02\u00AAIDATx\u00DA\u00ACTMh\x13A\x18\u009D\u00DD\u00EC6\u00DB4m\u00EA\x0Fi5\u00A1\u00C5\u00BFzi\u00E9\u00A1\u00A0 A\n\u00A2\x07\u00A9\x07=\u00B4\u0082\x07\x13\u00B4X0h\u00C1\u0093\u00D1F\u008B\x14E!\u008A(\u009E\u0082\"\u00A8\u00D1z\u00D1S\x0F\u00E2\x1F\u00AD\u00F6R\x0FI\x0F\u008AZ\u0088\"Z\u00A8\u00D8\u00DA\u0094\u00FD\u009B\u00DDq\u00BE\u00ED7\u00B2D\u00F4\u00E4\u00C0c\u00B2\u00B33o\u00DE{\u00DF\u0097\u0095\x18c\u00E4\x7F\f\u00E9/k2G\x00g\u00B1\x07nt9\x1C\u009C\u00D9\u00BF\u0088\u00E0\u00A0\u00DAu\u00A6\u00D0\u00AD\u0086\x1B\u008FJ\u00B2\u00BC\u009D?G\u00F0\u00DD\x02s\u00DD\u0097ve\u00FE\u00FA\u00D4\u00F0\u00FE\x17H(\u00C8\u0099\u00EC#\x01\x05\u00C1\u00CE\u00E1\u0087Y7X7f\u00DA\u00F6\x1E\u00C34#\x1C\x04\x11\u00815x\u00D7yv4\u00CB\u00F7\u0086\u00B7\\\x1C\u00B3\u00E1b\x10 \u00F9\u0094\x04\u00DB2wO\u00CBjM\u00C6\u00F3\u00E1:\u00E3\u00C6\u0097\u00F7w\u00E6\u009E?\u0098\u0086\u00E7\u00D5\u00DD\u00BD\u00EDZl\u00D3\x01I\x0E$@]H\u00D3<\u00A5oN\u00F64\u00F2IW\u00D0\u009E\u00BA\u00F6\u00E0H\u0097\u00E5\u0090\fq,\u00C2l\u00B3P\u00CE\u00A5.\u00F0u\u0083\x03n%K3\u00C59>M\u00C6\u008F\\\u00DE\u00B7\"\u00BEn\u00C8\u00A6T8\u00D18L\x05\u00D5\u00D4\u00D0\u0086\u00E8\u0080\u00C3-\x10\u00D7\x1D\u009F\u00BDzh\u0084\u00AF\u00FD\u00E4\u00A8 \x11\\V\u00CB\u00D1X\u00DF\u00DC2D\u00A9\u00E3\u00CF\u00D5\x13#\u0088T\u0093:=\u0084o\u00B0\u00DE\u00BE\u00BA\x04\u00D29\u00E6Q\u0091\u0083{\u00C8\u00C6S\u00F7\u00BF\u00F9\u0094\u0088\u00E1\u0085-\u00ACI\u00BAn\x14a\u00D5zv\x1B\u00E6E\u00F0\u00CDA}\u00D5u?\u008C\u00F4\u00C5A\x15\x04\u008D\x15\u00AB\u0088\u00EA\u00C1\u0086\x1A|\x11A\u0099F\x15\u0091+rD{u+;\x12M\u009B\u0093\u00D9)\u00B8\u00E1\u00F5\u0089]\u00AB\u0080PAf\u00D64xs\u00A6Z\u00F3\u00EC\u0095\u0094\u0086\x191$5\u00A1Mb{\u00D3\u00BD:\u00E4\u00C9XQ\u00D8\x16\x19)\u00B4\u00CA\u00FB\u00F7k\u00FD-\u00A8\u0096\u00FA:\u0099\u00B5$\u00CF\u00B5[D\x19\u00E0\u008DEh\u00E5\u00C7\u00A8X\x17\x7F\x01\x05B\x14\b\u0087B\x0Bk\u0092\u00E7wBo!@Y(\u009E\u00BE\u0091\u0092\u00A2\u00EB\x1F\x19\x06oT]/}\u00CC\u00F5\u00DF\x13\x19\u0089\u00B0eQ\u00D2pH+\u00E9\u00A6\u00D1A\"\u00D1|\u00F4x\u00BE\u00CC\u00E5\u0097\u0097\u00E3\u0096Z-BZ\u0089\t\x11\u00B2OK\u0093\u008F\u008FA{\u00A1]WdD=5\u00B7\x06\u00B7\u009A\u00CD\x1B\x1Ajw\u00A7\x0FKj\u00B0\u008F\u00C0\u00C1e\u00FC\x1E\u008CZ\x05\u00E3I>G\u00CB\u00A5\u00AFH\x04\x19\u00BA\u00A2jP\u008Dz\u00AC\f\u0090+r\u00C7\u008E\u0098\u00D4\u00B6-!\x05\u00D4z\u008F\u00C0\u00B1\x17\u00D9\u00BB\u0089\tw\u00FA\u00E9g\u00AC\u00AA\u00BF\u00B2^\u00F9\x03xX\u00C5\u00E0e\u00FC\u00ADa>\x01\x14\u00E3\u00A0\r\x1Da\t\x12\u00D1h~\u00F8\u00BFG\u00AA\u00AF\u00AA\u00A2\u0083)Z\u00F9\u00E3\u009B\u00F4K\u0080\x01\x00\u00F9\u00E7'\nf\x14K\x10\x00\x00\x00\x00IEND\u00AEB`\u0082",
		view: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x16\x00\x00\x00\x12\b\x06\x00\x00\x00_%.-\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x03\x17IDATx\u00DA\u00D4\u0094kHTQ\x10\u00C7\u00E7\u00EE\u00E3\u00DE\u00DC\u00D5\u00F5\u00BD\u009A\u0086m\u00D9\u00A6\u00A6bJaI\u0081%Q\u0081=\u00B0/\x15\u00E5\u0093\f\u00A1\u00A2>\u0094`}*+*\u008C2\x02\u00A10\b\u00C3 \x13\u00FCP\x12bT\u0092\u00A1\u0089Z\u00B2Yj\u00BA\u00B4j\u00E2\u00A3\u00D5]\u00F7y\u00EF\u00EE4wYArK\f\u00FA\u00D0\u00C0\u008F{\u00E0\u00CC\u00FCg\u00EE\u00CC9\u0087AD\u00F8\x17\u00C6\u00FCw\u00C2\u00B2\x05\u0099\x18\u00C6\u00F3\u00BDXz5\u00D92\u00E4.\u00EE\x1B\u00D5\u00F1\u0086\u00E1oY\x0E\u00DE\u00AE\u00F4\u0093+\u00C0\u00EC\u009C1\u00BB\u0080\x7F\u00AFT(\u008D.\u008E\x7F\u00F4Q\u00D7\u00AD#w7\u0081\x7F\u00AC\u00B8\u00E4x\u00C9\u00B2Hs\\U\u0084\x10\u009B\x17\u0093\u00AA\x06\u00C7,\x0F\u00C9\u00BBW\u0081\\!\x03\x17\u00EF\x06\u00DB\u008C\x03\u00F4\u00EDc0=:\x0Bgj\u008E\u00F6S\u00A2\x1A\u00BB\u00C3v\u008DB\u009D\u00F3\u00C5\x17\b\u00E7o;\u00F9t\u00FB\u009A=9i9Z\x18\u00FF:\r\u00D7\u00EF\\\u0081\u0081)\x1D\u0084)#=\u00FB\u00DA\u00B0$(,*\x04\u00A3\u00C1\f\u00A1+U\u00F0\u00B6\u00A1\x13*\u00DE\u009Ek\u00D5j\u00D6V\u00B6\u00F5\u00B4>%\x17\u0097\u0098`\u0081\u00B0J\x19x>Y\u009D^>>;\n\u00AC\u0094\u0083\u00DE\u00F1.\bU\u00A8AN\u00EB\x00.\x10Lv#\x04\u00FB\u0085Qi\b\u00A9Q\x19\u0090\u00B1r\u0087'\u00AE\u00B2\u00FDBc\u00FF\u00F7O\u0087i9K\b\u0092_{\u00DC\u00D3\u00D2W\u00BE9&\x0BV\u0087\u00C4C8U\x19\u00AD\u00D2\u00C0\u00E3\u00CB\u00CF!'\u00A9\x00,N3D\x04\u00AC\u0080\u00B8\u00F0\x148\u0098R\x02\x1D\u00C3-\u00D0<\u00D0\x00\u00A9\u00FB\u00B500\u00D6\u00FB\u0081\u00C2\u00FD\b\u00A9GH\u00ACx>4\u00BC\u00BAWU\u00DD(\u0092\x19\u009B\u008D\u00B7\u00F7\u00D6\u00A1hG\u00D3N\u00A1\\\u00CA\u00E2\u00BE\u00C4\\\u00AC.h\u00C4\u0089\u00C1i\u00AC)i\u00C2\x04\u00F5z\f\u00F0\x0BzGR\t\u0084\u009A\u0090\u00FB\x14\x0E\t\tM2\u008E\u0098\u00B1\u00BE\u00AC\x05\u00A5\x12\x19\u00FAs*\u00B1WHm\u00C0\u00FD\u0089yX\u009AY\u0081\x15\u00D9\u00B5\u00A8k\u00D2\u00A3\u00D3\u00CAc\u00D1\u00C6\u00B3\u00B8U\u00BBs\u0098|b\u0089\x00qn>\u0087\u00A7\u00D1hX\u00BD^\u00EF@7z\\\u00B2\u00D7\x1D\u0082\u00B4\u00E8-\u009E>3\u008C\x04\\n\x01\u008A\u00EE\u00ED\x01\u00A9L\x02'v\u0095\u0081]\u00B0\u0081^\u00D2\u0093\u00DB\u00D6\u00D5\u00FA\u009A\u00C2'\b\u009BOaj\x05s$\u00EB\u00D8\u00CDx\u00D9\u00A6\u00D3\u00C5ws\u00C0\u00EDB\u00E0\x1D\x02\u00B8\x05\x04\x19'\x05E \x07S\x06\x13\u00D4_z\t?\u009C\u00E3\u00A6\u00FA/\u00D5\u00B5}\x06]\x03\u0085v\x10\u00D3\x04\u00EF\u00F3\u0082\u0088\u00BFmr\x1A\r\u009D\u0093oF:\u00EA\u0092\u00A2W\u00A7/\u00F7\x1C+\u00B1\x001\u0089y\u00C2\n\x0Fo<i\x1B\u009A\x1A\u0088\u00FE8\u00D3z\u008BD\u009FQ\u00CC\fa\u00F1\x1E5\u00F8]\u00C5s\t\u0083\x0Fl\u00C8\x7F\u00E1/\x0BR+9%\u00B2,k\u00992M\u00AA\u00E4r\u0099\x059\u00D7\u00E7\x07\u00CD\u0095\u00F7\u00C9\u00C7At\x12f\u00EF\x05YT\u0098\u00F1NW\x11\x12\x14\u009AI>v\u0096c'\x04^\u0088\u00B2\u00DA\u00AD6\u009B\u00CD:H{v\u00C2\u00EA\u00FD:\u00BD\u00D7\x1A\x16\x13\u009E3\u00F1L\u00B2^\u00C0{e\x19\u00AF\u0088\u00D8Ka\u00DE;\u0081K\x11\u009E\u00AB\u009E\u00F11\x0B\u00F7\u0092\u009EM\x1F\u00C2\x7Fe?\x05\x18\x00\u0089\u0097\u0083\u008DWu\u0082\u00A3\x00\x00\x00\x00IEND\u00AEB`\u0082",
	}
}
