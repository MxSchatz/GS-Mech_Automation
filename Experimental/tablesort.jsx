//DESCRIPTION: Sort a table
// Peter kahrel -- www.kahrel.plus.com

// Details at www.kahrel.plus.com/indesign/tablesort.html

#targetengine 'table_sort';

if (app.documents.length == 0) exit();

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
	if (f.exists) {
		return $.evalFile(f);
	}
	return null;
}


function errorM (m) {
	alert (m, 'Table sort', true);
	exit ();
}


function get_table () {
	try {
		if (app.selection[0].parent instanceof Cell)  // Insertion point in a cell
			return app.selection[0].parent.parent;
		if (app.selection[0].parent instanceof Table)  // Cell selected
			return app.selection[0].parent;
		if (app.selection[0] instanceof Table)   // All cells selected
			return app.selection[0];
		if (app.selection[0].tables.length == 1)   // The selection (text frame, paragraph, word) contains one table
			return app.selection[0].tables[0];
		if (app.selection[0].tables.length > 1)
			errorM ('The selection contains more than one table.');
	} catch(_) {
		errorM ('Select an insertion point in a table or some rows.');
	}
}


function hasMergedCells (table) {
	var spans = table.cells.everyItem().rowSpan.join('');
	if (spans.match(/^1+$/) !== null) {
		spans = table.cells.everyItem().columnSpan.join('');
		if (spans.match(/^1+$/) !== null) {
			return false;
		}
	}
	return true;
}



function strip_accents (s) {
	return s.replace (/[ÁÀÂÄÅĀĄĂÆ]/g, 'A').
		replace (/[ÇĆČĊ]/g, 'C').
		replace (/[ĎĐ]/g, 'D').
		replace (/[ÉÈÊËĘĒĔĖĚ]/g, 'E').
		replace (/[ĢĜĞĠ]/g, 'G').
		replace (/[ĤĦ]/g, 'H').
		replace (/[ÍÌÎÏĪĨĬĮİ]/g, 'I').
		replace (/[ĵ]/g, 'J').
		replace (/[ķ]/g, 'K').
		replace (/[ŁĹĻĽ]/g, 'L').
		replace (/[ÑŃŇŅŊ]/g, 'N').
		replace (/[ÓÒÔÖŌŎŐØŒ]/g, 'O').
		replace (/[ŔŘŖ]/g, 'R').
		replace (/[ŚŠŜŞȘß]/g, 'S').
		replace (/[ŢȚŤŦ]/g, 'T').
		replace (/[ÚÙÛÜŮŪŲŨŬŰŲ]/g, 'U').
		replace (/[Ŵ]/g, 'W').
		replace (/[ŸÝŶ]/g, 'Y').
		replace (/[ŹŻŽ]/g, 'Z')
}



function col_order (array, le) {
	var num;
	var temp = [];
	for (var i = 0; i < array.length; i++) {
		num = Number (array[i].text);
		if (isNaN (num) || num > le) {
			errorM ('Illegal column number for column ' + String (i+1));
		}
		if (num > 0) {
			temp.push (num-1);
		}
	}
	return temp;
}


function headers_footers (table) {
	if (app.selection[0] instanceof Cell && app.selection[0].rows.length > 1) {
		var c = app.selection[0].cells;
		var header = c[0].parentRow.index;
		var footer = c[-1].parentColumn.cells.length - c[-1].parentRow.index - 1;
		// Add a boolean that dims the header/footer panel
		return [true, header, footer];
	}
	return [false, table.headerRowCount, table.footerRowCount];
}


// Get the number of the selected column so we can plug that 
// into the dialog insertion point selected

function find_columns () { 
	if (app.selection[0].parent instanceof Cell) {
		return [String (app.selection[0].parent.parentColumn.index + 1)];
	}
	// several columns selected
	if (app.selection[0] instanceof Cell && app.selection[0].columns.length > 1) {
		var temp = [];
		for (var i = 0; i < app.selection[0].columns.length; i++) {
			if (i < 3) {
				temp.push (String (app.selection[0].columns[i].index + 1));
			}
		}
		return temp;
	}
	// More than one cell selected in the same column
	if (app.selection[0] instanceof Cell && app.selection[0].rows.length > 0) {
		return [String (app.selection[0].parentColumn.index + 1)];
	}
	// If nothing else works, this will:
	return ['1'];
}


function sort_keys_ascend (a, b) {
	return a.key > b.key;
}

function sort_keys_descend (a, b) {
	return a.key < b.key;
}


function pad (s, numeric, ascend) {
	if (numeric) {
		if (s == '') {
			return ascend ? '9' : '0';
		}
		return ('0000000000'+s).slice(-10);
	}
	var filler = ascend ? 'ZZZZZZZZZZ' : '..............................';
	return (s+filler).slice (0,30);
}


function build_keys () {
	var temp = '';
	var str = '';
	var keys = [];
	var rows = TSORT.table.rows.everyItem().getElements();
	var dummy = TSORT.ascend ? '~' : '.';
	var last = rows.length - TSORT.footers;
	for (var i = TSORT.headers; i < last; i++) {
		str = '';
		for (var j = 0; j < TSORT.column_order.length; j++) {
			temp = TSORT.table.columns[TSORT.column_order[j]].cells[i].contents;
			if (!TSORT.anumeric[j]) {
				if (TSORT.ignore_case) temp = temp.toUpperCase();
				temp = strip_accents (temp);
			} else {
				temp = temp.replace (TSORT.re, '');
			}
			str += pad (temp, TSORT.anumeric[j], TSORT.ascend);
		}
		TSORT.formatted ? keys.push (str) : keys.push ({key: str, contents: rows[i].cells.everyItem().contents})
	}
	return keys;
}


// Classic Quicksort to sort a formatted table
function sort_formatted (keys, first, last, head, rows, last_row, dir, row_length) {
	var i = first;
	var j = last;
	var pivot = keys[Math.floor((first+last)/2)];
	while ( i < j ) {
		while (larger_than (pivot, keys[i], dir))
			i++;
		while (larger_than (keys[j], pivot, dir))
			j--;
		if ( i <= j ) {
			swap (keys, i, j);
			swap_rows (rows, i+head, j+head, last_row, row_length);
			i++;
			j--;
		}
	} // while i < j
	if (first < j) sort_formatted (keys, first, j, head, rows, last_row, dir, row_length);
	if (i < last) sort_formatted (keys, i, last, head, rows, last_row, dir, row_length);
}


function swap (array, x, y) {
	var temp = array[x];
	array[x] = array[y];
	array[y] = temp;
}


/* Swap_rows swaps rows by moving a row x into the dummy row,
row y into row x, and the dummy into row y. As we can't move rows,
we have to move the contents of the cells. */

function swap_rows (r, x, y, last_row, le) {
	if (x != y) {
		for( var i = 0; i < le; i++ ) {
			r[x].cells[i].texts[0].move (LocationOptions.after, last_row.cells[i].insertionPoints[0]);
		}
		for( var i = 0; i < le; i++) {
			r[y].cells[i].texts[0].move (LocationOptions.after, r[x].cells[i].insertionPoints[0]);
		}
		for( var i = 0; i < le; i++ ) {
			last_row.cells[i].texts[0].move (LocationOptions.after, r[y].cells[i].insertionPoints[0]);
		}
	}
}

function larger_than (a, b, ascend) {
	if (ascend) return a > b;
	return a < b;
}

// Interface --------------------------------------------------------------------------------------------------------------------

function get_data (table) {
	//var table = get_table();
	var w = new Window ('dialog {text: "Table sort", orientation: "row", alignChildren: "top"}');
	
	var main = w.add ('panel {alignChildren: "fill", orientation: "column"}');

	var order = main.add ('panel {text: "Sort order", alignChildren: "right"}');
		var columns = [];
		var anum = [false, false, false];
		var g1 = order.add ('group {_: StaticText {text: "First sort on column"}}');
			columns[0] = g1.add ('edittext {text: ""}');
			anum[0] = g1.add ('checkbox {text: "Numeric"}');
		var g2 = order.add ('group {_: StaticText {text: "Then on column"}}');
			columns[1] = g2.add ('edittext {text: ""}');
			anum[1] = g2.add ('checkbox {text: "Numeric"}');
		var g3 = order.add ('group {_: StaticText {text: "Then on column"}}');
			columns[2] = g3.add ('edittext {text: ""}');
			anum[2] = g3.add ('checkbox {text: "Numeric"}');
		columns[0].characters = columns[1].characters = columns[2].characters = 2;

	var headers = main.add ('panel {text: "Headers/footers", alignChildren: "right"}');
		headers.margins.right = 65;
		var h1 = headers.add ('group {_: StaticText {text: "Number of header rows:"}}');
			var head = h1.add ('edittext {text: "0"}');
		var h2 = headers.add ('group {_: StaticText {text: "Number of footer rows:"}}');
			var foot = h2.add ('edittext {text: "0"}');
		head.characters = foot.characters = 2;

	var direction = main.add ('panel {text: "Direction", orientation: "row"}');
		var ascend = direction.add ('radiobutton {text: "Ascending"}');
		var descend = direction.add ('radiobutton {text: "Descending"}');
		//ascend.value = true;

	var misc = main.add ('panel {alignChildren: "left"}');
		var ignore_case = misc.add ('checkbox {text: "Ignore case"}');
		var formatted = misc.add ('checkbox {text: "Formatted text"}');
		ignore_case.value = true;
		formatted.value = false;
	
	var buttons = w.add ('group {orientation: "column"}');
		buttons.add ('button {text: "OK"}');
		buttons.add ('button {text: "Cancel"}');
	
	// Check if some rows are selected. If so, calculate the number of headers and foorter
	// and disable the header/footer section
	var head_foot = headers_footers (table);
	head.text = head_foot [1];
	foot.text = head_foot [2];
	if (head_foot[0] == true) {
		headers.enabled = false;
	}
	
	// Check which columns are selected
	var cols = find_columns (table);
	for (var i = 0; i < cols.length; i++) {
		columns[i].text = cols[i];
	}
	
	w.onShow = function () {
		var previous = getPrevious();
		if (previous !== null) {
			w.location = previous.location;
			formatted.value = previous.formatted;
			ignore_case.value = previous.ignore_case;
			ascend.value = previous.ascend;
			descend.value = previous.descend;
			var c = previous.columns;
			if (c) {
				for (var i = 0; i < c.length; i++) {
					columns[i].text = c[i].text;
					anum[i].value = c[i].num;
				}
			}
		}
//~ 		if (app.selection[0] instanceof InsertionPoint && /^[\d.,]+$/.test(app.selection[0].parent.texts[0].contents)) {
//~ 			anum[0].value = true;
//~ 		}
		columns[0].active = true;
	}
	
	if (w.show() == 2) exit();
	
	saveData ({
		location: [w.location.x, w.location.y],
		ascend: ascend.value,
		descend: descend.value,
		formatted: formatted.value,
		ignore_case: ignore_case.value,
		columns: [
			{text: columns[0].text, num: anum[0].value},
			{text: columns[1].text, num: anum[1].value},
			{text: columns[2].text, num: anum[2].value}
		]
	});

	TSORT.column_order = col_order (columns, table.columns.length);
	TSORT.anumeric = [anum[0].value, anum[1].value, anum[2].value];  // array of booleans
	TSORT.ascend = ascend.value;
	TSORT.headers = Number (head.text);
	TSORT.footers = Number (foot.text);
	TSORT.formatted = formatted.value;
	TSORT.ignore_case = ignore_case.value;
}

//----------------------------------------------------------------------------------------------

var TSORT = {};
TSORT.table = get_table();

if (hasMergedCells (TSORT.table)) {
	alert ('Cannot sort tables with merged cells.');
	exit();
}
get_data (TSORT.table);
TSORT.re = /^[£€$¥₹¤]/;

var keys = build_keys ();
if (TSORT.formatted) {
	TSORT.table.rows.add();
	sort_formatted (keys, 0, keys.length-1, TSORT.headers, TSORT.table.rows.everyItem().getElements(), TSORT.table.rows[-1], TSORT.ascend, TSORT.table.rows[0].cells.length);
	TSORT.table.rows[-1].remove();
} else {
	TSORT.ascend ? keys.sort (sort_keys_ascend) : keys.sort (sort_keys_descend);
	for (var i = 0; i < keys.length; i++) {
		TSORT.table.rows[i+TSORT.headers].contents = keys[i].contents;
	}
}
