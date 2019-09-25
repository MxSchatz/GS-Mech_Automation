// Clean up spurious white space; optionally convert all caps to sentence case
// Peter Kahrel -- www.kahrel.plus.com

try
	{
	var caps = ask ();
	if (app.selection.length == 0)
		clean_up (app.activeDocument, caps);
	else
		clean_up (app.selection[0], caps);
	}
catch (e) {alert (e.message + " (line " + e.line + ")")};


function clean_up (scope, caps)
	{
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findChangeGrepOptions.includeFootnotes = true;
	app.findChangeGrepOptions.includeHiddenLayers = true;
	app.findChangeGrepOptions.includeLockedLayersForFind = true;
	app.findChangeGrepOptions.includeLockedStoriesForFind = true;
	app.findChangeGrepOptions.includeMasterPages = true;

	// series of tabs
	change_grep (scope, '\\t\\t+', '\\t');
	// series of returns
	change_grep (scope, '\\r\\r+', '\\r');
	// series of spaces
	change_grep (scope, '\\x{20}\\x{20}+', '\\x{20}');
	// trailing spaces and tabs
	change_grep (scope, '\\s+$', "");
	// leading spaces/tabs
	change_grep (scope, '^\\s+', "");
	// ALL UPPERCASE TO Sentence case
	// This fails on certain types of selection,
	// so you need to "try"
	if (caps == true)
		try {uc2sc (scope)} catch(_){}
	} // clean_up


function change_grep (obj, f, r)
	{
	app.findGrepPreferences.findWhat = f;
	app.changeGrepPreferences.changeTo = r;
	obj.changeGrep()
	}


function uc2sc (obj)
	{
	app.findGrepPreferences = null;
	app.findGrepPreferences.findWhat = '^[^\\l]+$'
	var f = obj.findGrep (true);
	for (var i = 0; i < f.length; i++)
		f[i].changecase (ChangecaseMode.sentencecase);
	}


function ask ()
	{
	var w = new Window ("dialog", "Clean up");
	w.alignChildren = "right";
	var panel = w.add ("panel");
		var chk = panel.add ("checkbox", undefined, "\u00A0All caps to sentence case");
	var buttons = w.add ("group");
		buttons.add ("button", undefined, "OK", {name: "ok"});
		buttons.add ("button", undefined, "Cancel", {name: "cancel"});
	if (w.show ()== 1)
		return chk.value;
	else
		exit ();
	}
	