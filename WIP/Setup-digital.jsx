﻿//DESCRIPTION:Configure all preferences and settings for digital// Setup-digital.jsx//// Modified 2017-04-07// Keith Gilbert, Gilbert Consulting// www.gilbertconsulting.com//Main();function Main() {	// Check to see whether any InDesign documents are open.	// If no documents are open, display an error message.	if (app.documents.length > 0) {		var myDoc = app.activeDocument;		var myAppVersion = Number(app.version.match(/\d+\.\d+/));// The following settings are arranged in the order in which they appear in InDesign's menus and preferences dialog box// Preferences : General		if (myAppVersion >= 11.2) {			app.generalPreferences.showStartWorkspace = false; // Introduced in 11.2			app.generalPreferences.showEnhancedFileOpen = false; // Introduced in 11.2		}		if (myAppVersion >= 12.1) {			app.generalPreferences.showLegacyNewDocumentDialog = true; // Introduced in 12.1					}		app.generalPreferences.pageNumbering = PageNumberingOptions.SECTION; // ABSOLUTE, SECTION		app.generalPreferences.completeFontDownloadGlyphLimit = 2000;		app.generalPreferences.preventSelectingLockedItems = true;		app.transformPreferences.whenScaling = WhenScalingOptions.APPLY_TO_CONTENT; // ADJUST_SCALING_PERCENTAGE		app.transformPreferences.adjustEffectsWhenScaling = true;		app.transformPreferences.adjustStrokeWeightWhenScaling = true;		app.generalPreferences.useIncomingSpotUponConflict = false;// Preferences : Interface		app.generalPreferences.uiBrightnessPreference = 0; // 0.0 to 1.0		app.generalPreferences.pasteboardColorPreference = 0; // 0 to set preference to Default White, 1 to set preference to Match to Theme Color		app.generalPreferences.toolTips = ToolTipOptions.FAST; // NORMAL, NONE, FAST		app.generalPreferences.placeCursorUsesThumbnails = true;		app.generalPreferences.showTransformationValues = true;		app.generalPreferences.enableMultiTouchGestures = false;		app.generalPreferences.highlightObjectUnderSelectionTool = true;		app.generalPreferences.toolsPanel = ToolsPanelOptions.SINGLE_COLUMN; // SINGLE_COLUMN, DOUBLE_COLUMN, SINGLE_ROW		app.generalPreferences.autoCollapseIconPanels = false;		app.generalPreferences.autoShowHiddenPanels = true;		app.generalPreferences.openDocumentsAsTabs = true;		app.generalPreferences.enableFloatingWindowDocking = true;		if (myAppVersion >= 12.0) {			app.generalPreferences.panelTabHeightPreference = false; // Show small panel tabs. Set to true to show large panel tabs		}		app.grabberPreferences.grabberPanning = PanningTypes.NO_GREEKING; // NO_GREEKING, GREEK_IMAGES, GREEK_IMAGES_AND_TEXT		app.liveScreenDrawing = LiveDrawingOptions.DELAYED; // NEVER, IMMEDIATELY, DELAYED		app.generalPreferences.greekVectorGraphicsOnDrag = false;// Preferences : Type		myDoc.textPreferences.typographersQuotes = true;		app.textEditingPreferences.singleClickConvertsFramesToTextFrames = true;		myDoc.textPreferences.useOpticalSize = true;		app.textEditingPreferences.tripleClickSelectsLine = true;		myDoc.textPreferences.useParagraphLeading = false;		app.textEditingPreferences.smartCutAndPaste = true;		// Font preview size????		// Number of recent fonts????		app.textEditingPreferences.dragAndDropTextInLayout = true;		app.textEditingPreferences.allowDragAndDropTextInStory = true;		myDoc.textPreferences.smartTextReflow = true;		myDoc.textPreferences.addPages = AddPageOptions.END_OF_STORY; // END_OF_STORY, END_OF_SECTION, END_OF_DOCUMENT		myDoc.textPreferences.limitToMasterTextFrames = true;		myDoc.textPreferences.preserveFacingPageSpreads = false;		myDoc.textPreferences.deleteEmptyPages = false;// Preferences : Advanced Type		myDoc.textPreferences.superscriptSize = 58.3; // 1-200		myDoc.textPreferences.superscriptPosition = 33.3; // -500 - +500		myDoc.textPreferences.subscriptSize = 58.3; // 1-200		myDoc.textPreferences.subscriptPosition = 33.3; // -500 - +500		myDoc.textPreferences.smallCap = 70; // 1-200		app.imePreferences.inlineInput = true;		app.imePreferences.useNativeDigits = false;		app.fontLockingPreferences.fontInputLocking = false;		app.fontLockingPreferences.fontChangeLocking = false;		myDoc.textDefaults.composer = "Adobe Paragraph Composer";		if (myAppVersion >= 11.2) {			app.typeContextualUiPrefs.showAlternatesUi = true;			app.typeContextualUiPrefs.showFractionsUi = true;		}// Preferences : Composition		myDoc.textPreferences.highlightKeeps = false;		myDoc.textPreferences.highlightSubstitutedFonts = true;		myDoc.textPreferences.highlightHjViolations = false;		myDoc.textPreferences.highlightSubstitutedGlyphs = false;		myDoc.textPreferences.highlightCustomSpacing = false;		myDoc.textPreferences.justifyTextWraps = false;		myDoc.textPreferences.abutTextToTextWrap = true;		myDoc.textPreferences.zOrderTextWrap = false;// Preferences : Units & Increments		myDoc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN; // SPREAD_ORIGIN, PAGE_ORIGIN, SPINE_ORIGIN		myDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.PIXELS; // POINTS, PICAS, INCHES, INCHES_DECIMAL, MILLIMETERS, CENTIMETERS, CICEROS, CUSTOM, AGATES, U, BAI, MILS, PIXELS, Q, HA, AMERICAN_POINTS		myDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.PIXELS; // POINTS, PICAS, INCHES, INCHES_DECIMAL, MILLIMETERS, CENTIMETERS, CICEROS, CUSTOM, AGATES, U, BAI, MILS, PIXELS, Q, HA, AMERICAN_POINTS		myDoc.viewPreferences.strokeMeasurementUnits = MeasurementUnits.POINTS;		myDoc.viewPreferences.pointsPerInch = 72; // 60-80		myDoc.viewPreferences.cursorKeyIncrement = "1pt"; // Range depends on the measurement unit. For points: 0.001 to 100; picas: 0p0.001 to 8p4; mm: 0 to 35.278; cm: 0 to 3.5278; inches: 0 to 1.3889; ciceros: 0c0.001 to 7c9.839)		myDoc.textPreferences.baselineShiftKeyIncrement = "0.25pt"; // .001-100		myDoc.textPreferences.leadingKeyIncrement = "1pt"; // .001-100		myDoc.textPreferences.kerningKeyIncrement = 1; // 1-100// Preferences : Grids		myDoc.gridPreferences.baselineColor = UIColors.LIGHT_BLUE;		myDoc.gridPreferences.baselineStart = "3p0";		myDoc.gridPreferences.baselineGridRelativeOption = BaselineGridRelativeOption.TOP_OF_PAGE_OF_BASELINE_GRID_RELATIVE_OPTION; // TOP_OF_MARGIN_OF_BASELINE_GRID_RELATIVE_OPTION		myDoc.gridPreferences.baselineDivision = "12pt";		myDoc.gridPreferences.baselineViewThreshold = 75;		myDoc.gridPreferences.gridColor = UIColors.LIGHT_GRAY;		myDoc.gridPreferences.horizontalGridlineDivision = "6p0";		myDoc.gridPreferences.horizontalGridSubdivision = 8;		myDoc.gridPreferences.verticalGridlineDivision = "6p0";		myDoc.gridPreferences.verticalGridSubdivision = 8;		myDoc.gridPreferences.gridsInBack = true;// Preferences : Guides & Pasteboard		myDoc.documentPreferences.marginGuideColor = UIColors.MAGENTA;		myDoc.documentPreferences.columnGuideColor = UIColors.VIOLET;		myDoc.pasteboardPreferences.bleedGuideColor = UIColors.MAGENTA;		myDoc.pasteboardPreferences.slugGuideColor = UIColors.GRID_BLUE;		myDoc.pasteboardPreferences.matchPreviewBackgroundToThemeColor = false;		myDoc.pasteboardPreferences.previewBackgroundColor = UIColors.LIGHT_GRAY;		myDoc.guidePreferences.rulerGuidesColor = UIColors.LIGHT_GRAY;		app.smartGuidePreferences.guideColor = UIColors.GRID_GREEN;		myDoc.viewPreferences.guideSnaptoZone = 4; // (1-36)		myDoc.guidePreferences.guidesInBack = false;		app.smartGuidePreferences.alignToObjectCenter = true;		app.smartGuidePreferences.smartDimensions = true;		app.smartGuidePreferences.alignToObjectEdges = true;		app.smartGuidePreferences.smartSpacing = true;		myDoc.pasteboardPreferences.pasteboardMargins = [-1,"60p0"]; // A horizontal margin of -1 means one document page width// Preferences : Dictionary		myDoc.textDefaults.appliedLanguage = "English: USA";		app.languagesWithVendors.itemByName('English: USA').addDictionaryPath(File('~/Library/Application Support/Adobe/Linguistics/UserDictionaries/Adobe Custom Dictionary/en_US'));		var fullPathOfUDC = "Macintosh HD:Users:keithgilbert:Dropbox:Templates:keith_indesign_dictionary.udc";  			  		if (File(fullPathOfUDC).exists) {  			var languages = app.languagesWithVendors.everyItem().getElements();    			for (var n=0; n<languages.length; n++) {  				if (languages[n].name == app.translateKeyString("$ID/English: USA")) {					var result = languages[n].addDictionaryPath(fullPathOfUDC);  					languages[n].hyphenationVendor = "Hunspell";					languages[n].spellingVendor = "Hunspell";					// languages[n].doubleQuotes = ;					// languages[n].singleQuotes = ;				}			}		} 		myDoc.dictionaryPreferences.composition = ComposeUsing.BOTH;		myDoc.dictionaryPreferences.mergeUserDictionary = false;		myDoc.dictionaryPreferences.recomposeWhenChanged = true;// Preferences : Spelling		app.spellPreferences.checkMisspelledWords = true;		app.spellPreferences.checkRepeatedWords = false;		app.spellPreferences.checkCapitalizedWords = false;		app.spellPreferences.checkCapitalizedSentences = false;		app.spellPreferences.dynamicSpellCheck = true;		app.spellPreferences.misspelledWordColor = UIColors.RED;		app.spellPreferences.repeatedWordColor = UIColors.GREEN;		app.spellPreferences.uncapitalizedWordColor = UIColors.GREEN;		app.spellPreferences.uncapitalizedSentenceColor = UIColors.GREEN;// Preferences : Autocorrect		app.autoCorrectPreferences.autoCorrect = true;		app.autoCorrectPreferences.autoCorrectCapitalizationErrors = false;		// Autocorrect language?		// Preferences : Notes		app.notePreferences.noteColorChoices = NoteColorChoices.USE_USER_COLOR; // USE_NOTE_PREF_COLOR		app.notePreferences.showNoteTips = true;		app.notePreferences.spellCheckNotes = true;		app.notePreferences.findAndReplaceNoteContents = true;		app.notePreferences.noteBackgroundColor = NoteBackgrounds.GALLEY_BACKGROUND_COLOR; // USE_NOTE_COLOR// Preferences : Track Changes		app.trackChangesPreferences.showAddedText = true;		app.trackChangesPreferences.addedTextColorChoice = ChangeTextColorChoices.CHANGE_USES_GALLEY_TEXT_COLOR; // CHANGE_USES_CHANGE_PREF_COLOR		app.trackChangesPreferences.addedBackgroundColorChoice = ChangeBackgroundColorChoices.CHANGE_BACKGROUND_USES_USER_COLOR; // CHANGE_BACKGROUND_USES_GALLEY_BACKGROUND_COLOR, CHANGE_BACKGROUND_USES_CHANGE_PREF_COLOR		app.trackChangesPreferences.markingForAddedText = ChangeMarkings.NONE; // STRIKETHROUGH, UNDERLINE_SINGLE, OUTLINE		app.trackChangesPreferences.showDeletedText = true;		app.trackChangesPreferences.deletedTextColorChoice = ChangeTextColorChoices.CHANGE_USES_GALLEY_TEXT_COLOR; // CHANGE_USES_CHANGE_PREF_COLOR		app.trackChangesPreferences.deletedBackgroundColorChoice = ChangeBackgroundColorChoices.CHANGE_BACKGROUND_USES_USER_COLOR; // CHANGE_BACKGROUND_USES_GALLEY_BACKGROUND_COLOR, CHANGE_BACKGROUND_USES_CHANGE_PREF_COLOR		app.trackChangesPreferences.markingForDeletedText = ChangeMarkings.STRIKETHROUGH; // NONE, UNDERLINE_SINGLE, OUTLINE		app.trackChangesPreferences.showMovedText = true;		app.trackChangesPreferences.movedTextColorChoice = ChangeTextColorChoices.CHANGE_USES_GALLEY_TEXT_COLOR; // CHANGE_USES_CHANGE_PREF_COLOR		app.trackChangesPreferences.movedBackgroundColorChoice = ChangeBackgroundColorChoices.CHANGE_BACKGROUND_USES_USER_COLOR; // CHANGE_BACKGROUND_USES_GALLEY_BACKGROUND_COLOR, CHANGE_BACKGROUND_USES_CHANGE_PREF_COLOR		app.trackChangesPreferences.markingForMovedText = ChangeMarkings.OUTLINE; // NONE, STRIKETHROUGH, UNDERLINE_SINGLE		app.trackChangesPreferences.preventDuplicateColor = false;		app.trackChangesPreferences.showChangeBars = true;		app.trackChangesPreferences.changeBarColor = InCopyUIColors.CYAN;		app.trackChangesPreferences.locationForChangeBar = ChangebarLocations.LEFT_ALIGN; // RIGHT_ALIGN		app.trackChangesPreferences.spellCheckDeletedText = true;// Preferences : Story Editor Display		myDoc.galleyPreferences.displayFont = "Letter Gothic Std";		myDoc.galleyPreferences.displayFontSize = "18pt";		myDoc.galleyPreferences.lineSpacingValue = LineSpacingType.SINGLE_SPACE; // ONE_AND_HALF_SPACE, DOUBLE_SPACE, TRIPLE_SPACE		myDoc.galleyPreferences.textColor = InCopyUIColors.BLACK;		myDoc.galleyPreferences.backgroundColor = InCopyUIColors.WHITE;		myDoc.galleyPreferences.smoothText = true;		myDoc.galleyPreferences.antiAliasType = AntiAliasType.GRAY_ANTIALIASING; // COLOR_ANTIALIASING, THICKER_ANTIALIASING		myDoc.galleyPreferences.cursorType = CursorTypes.STANDARD_CURSOR; // THICK_CURSOR, BARBELL_CURSOR, BLOCK_CURSOR		myDoc.galleyPreferences.blinkCursor = true;// Preferences : Display Performance		app.displayPerformancePreferences.defaultDisplaySettings = ViewDisplaySettings.HIGH_QUALITY; // TYPICAL, OPTIMIZED		app.displayPerformancePreferences.persistLocalSettings = false;		app.displaySettings[0].raster = TagRaster.GRAY_OUT; // GRAY_OUT, PROXY, HIGH_RESOLUTION, DEFAULT_VALUE		app.displaySettings[0].vector = TagVector.GRAY_OUT; // GRAY_OUT, PROXY, HIGH_RESOLUTION, DEFAULT_VALUE		app.displaySettings[0].transparency = TagTransparency.OFF; // OFF, LOW_QUALITY, MEDIUM_QUALITY, HIGH_QUALITY, DEFAULT_VALUE		app.displaySettings[0].antialiasing = false;		app.displaySettings[0].greekBelow = 7;		app.displaySettings[1].raster = TagRaster.HIGH_RESOLUTION; // GRAY_OUT, PROXY, HIGH_RESOLUTION, DEFAULT_VALUE		app.displaySettings[1].vector = TagVector.PROXY; // GRAY_OUT, PROXY, HIGH_RESOLUTION, DEFAULT_VALUE		app.displaySettings[1].transparency = TagTransparency.MEDIUM_QUALITY; // OFF, LOW_QUALITY, MEDIUM_QUALITY, HIGH_QUALITY, DEFAULT_VALUE		app.displaySettings[1].antialiasing = true;		app.displaySettings[1].greekBelow = 0;		app.displaySettings[2].raster = TagRaster.HIGH_RESOLUTION; // GRAY_OUT, PROXY, HIGH_RESOLUTION, DEFAULT_VALUE		app.displaySettings[2].vector = TagVector.HIGH_RESOLUTION; // GRAY_OUT, PROXY, HIGH_RESOLUTION, DEFAULT_VALUE		app.displaySettings[2].transparency = TagTransparency.HIGH_QUALITY; // OFF, LOW_QUALITY, MEDIUM_QUALITY, HIGH_QUALITY, DEFAULT_VALUE		app.displaySettings[2].antialiasing = true;		app.displaySettings[2].greekBelow = 0;// Preferences : GPU Performance		if (myAppVersion >= 11.4) {			app.gpuPerformancePreferences.enableGpuPerformance = true;			app.gpuPerformancePreferences.enableAnimatedZoom = false;		}// Preferences : Appearance of Black		app.colorSettings.idealizedBlackToScreen = true;		app.colorSettings.idealizedBlackToExport = true;		myDoc.documentPreferences.overprintBlack = true;// Preferences : File Handling		// app.generalPreferences.temporaryFolder = File location in which to store temporary files 		app.generalPreferences.openRecentLength = 10; // 0 to 30		app.generalPreferences.includePreview = true;		app.generalPreferences.previewPages = PreviewPagesOptions.FIRST_10_PAGES; // FIRST_PAGE, FIRST_2_PAGES, FIRST_5_PAGES, FIRST_10_PAGES, ALL_PAGES		app.generalPreferences.previewSize = PreviewSizeOptions.EXTRA_LARGE; // SMALL, MEDIUM, LARGE, EXTRA_LARGE		myDoc.documentPreferences.snippetImportUsesOriginalLocation = false;		app.linkingPreferences.checkLinksAtOpen = true;		app.linkingPreferences.findMissingLinksAtOpen = true;		myDoc.textPreferences.linkTextFilesWhenImporting = false;		app.imagePreferences.preserveBounds = true;		// Default Relink folder?		// Hide New Layers When Updating or Relinking?// Preferences : Clipboard Handling		app.clipboardPreferences.preferPDFWhenPasting = false;		app.clipboardPreferences.copyPDFToClipboard = true;		app.clipboardPreferences.preservePdfClipboardAtQuit = false;		app.clipboardPreferences.preferStyledTextWhenPasting = false;// Preferences : Publish Online		if (myAppVersion >= 11.0) {			app.generalPreferences.enablePublishOnline = true; // Introduced in 11.0		}// Type > Show hidden characters		myDoc.textPreferences.showInvisibles = true;// View > Overprint preview		app.activeWindow.overprintPreview = false;// View > Screen Mode > Normal		app.activeWindow.screenMode = ScreenModeOptions.PREVIEW_OFF;// View > Display Performance > High Quality Display		app.activeWindow.viewDisplaySetting = ViewDisplaySettings.HIGH_QUALITY; // OPTIMIZED, TYPICAL// View > Show Rulers		myDoc.viewPreferences.showRulers = true;// View > Extras		myDoc.viewPreferences.showFrameEdges = true;		// There is no reliable way to force show Text Threads		// I can't locate a way to show (InCopy) assigned frames			// I can't locate a way to show hyperlinks			myDoc.viewPreferences.showNotes = true;		// I can't locate a way to show the Links badge			app.generalPreferences.showContentGrabber = false;		app.generalPreferences.showLiveCorners = true;		app.generalPreferences.showAnchorObjectAdornment = true;		app.generalPreferences.showConveyor = false;		if (myAppVersion >= 11.4) {			app.generalPreferences.showStockPurchaseAdornment = true;		}// View > Grids & Guides		myDoc.guidePreferences.guidesShown = true;		myDoc.guidePreferences.guidesLocked = false;		myDoc.documentPreferences.columnGuideLocked = true;		myDoc.guidePreferences.guidesSnapto = true;		app.smartGuidePreferences.enabled = false;		myDoc.gridPreferences.baselineGridShown = false;		myDoc.gridPreferences.documentGridShown = false;		myDoc.gridPreferences.documentGridSnapto = false;// View > Structure		myDoc.xmlViewPreferences.showStructure = false;		myDoc.xmlViewPreferences.showTagMarkers = true;		myDoc.xmlViewPreferences.showTaggedFrames = true;// Window > Application Frame			app.generalPreferences.useApplicationFrame = true;// Edit > Transparency Blend Space		myDoc.transparencyPreferences.blendingSpace = BlendingSpace.RGB;// Automatically add swatches and styles to CC Libraries		if (myAppVersion >= 11) {			app.generalPreferences.autoAddCharStyleToCCLibraries = false;			app.generalPreferences.autoAddParaStyleToCCLibraries = false;			app.generalPreferences.autoAddSwatchToCCLibraries = false;		}// Control panel menu		app.transformPreferences.dimensionsIncludeStrokeWeight = true;		app.transformPreferences.transformationsAreTotals = true;		app.transformPreferences.showContentOffset = true;		app.transformPreferences.adjustStrokeWeightWhenScaling = true;		app.transformPreferences.adjustEffectsWhenScaling = true;// Hyperlinks panel		// Turn on "AutoUpdateURLStatus" from "Hyperlinks" panel		var autoUpdateURLStatus = app.menuActions.itemByName("$ID/AutoUpdateURLStatus");		var hyperLinksPanel = app.panels.itemByName("$ID/Hyperlinks");		var visibility = hyperLinksPanel.visible;		if (!visibility) {			hyperLinksPanel.visible = true		}		if (autoUpdateURLStatus.checked == false) {			autoUpdateURLStatus.invoke();		}		hyperLinksPanel.visible = visibility;// Layers panel		app.generalPreferences.ungroupRemembersLayers = true;		app.clipboardPreferences.pasteRemembersLayers = false;	// Pages panel		app.panels.itemByName("Pages").pagesViewSetting = PageViewOptions.HORIZONTALLY; // VERTICALLY, BY_ALTERNATE_LAYOUT		app.panels.itemByName("Pages").iconSize = IconSizes.LARGE_ICON; // EXTRA_SMALL_ICON, SMALL_ICON, MEDIUM_ICON, LARGE_ICON, EXTRA_LARGE_ICON, JUMBO_ICON		app.panels.itemByName("Pages").pagesThumbnails = true;		app.panels.itemByName("Pages").masterIconSize = IconSizes.EXTRA_SMALL_ICON; // EXTRA_SMALL_ICON, SMALL_ICON, MEDIUM_ICON, LARGE_ICON, EXTRA_LARGE_ICON, JUMBO_ICON		app.panels.itemByName("Pages").mastersThumbnails = false;		app.panels.itemByName("Pages").masterVerticalView = true;		app.panels.itemByName("Pages").transparencyIcons = false;		app.panels.itemByName("Pages").rotationIcons = true;		app.panels.itemByName("Pages").transitionsIcons = true;		app.panels.itemByName("Pages").pagesOnTop = false;		app.panels.itemByName("Pages").resizeBehavior = PanelLayoutResize.MASTERS_FIXED; // PROPORTIONAL_RESIZE, PAGES_FIXED, MASTERS_FIXED// Paragraph Styles panel		if (myAppVersion >= 11.4) {			myDoc.textPreferences.enableStylePreviewMode = false; // Style override highlighter;		}// Structure Panel menu		myDoc.xmlViewPreferences.showStructure = true;		myDoc.xmlViewPreferences.showAttributes = true;		// I can't locate a way to show show comments		// I can't locate a way to show text processing instructions		myDoc.xmlViewPreferences.showTextSnippets = true;		myDoc.xmlViewPreferences.showStructure = false;// Preflight panel		app.preflightOptions.preflightOff = false; 		try {			myDoc.preflightOptions.preflightWorkingProfile = "DigitalPublishing";		}		catch (myError) {}		myDoc.preflightOptions.preflightWhichLayers = PreflightLayerOptions.PREFLIGHT_VISIBLE_LAYERS; // PREFLIGHT_ALL_LAYERS, PREFLIGHT_VISIBLE_LAYERS, PREFLIGHT_VISIBLE_PRINTABLE_LAYERS		myDoc.preflightOptions.preflightIncludeObjectsOnPasteboard = false;		myDoc.preflightOptions.preflightIncludeNonprintingObjects = false;		myDoc.preflightOptions.preflightScope = PreflightScopeOptions.PREFLIGHT_ALL_PAGES; // PREFLIGHT_SELECTED_DOCUMENTS, PREFLIGHT_ALL_DOCUMENTS// Other useful stuff				app.generalPreferences.showWhatsNewOnStartup = false;		app.generalPreferences.objectsMoveWithPage = false;		app.generalPreferences.showMasterPageOverlay = true;		app.activeWindow.transformReferencePoint = AnchorPoint.TOP_LEFT_ANCHOR;		// app.activeWindow.bounds=[22,0,1200,1920]; // Full screen on a retina MacBook Pro 15"		try {			app.applyShortcutSet("Keith");		}		catch (myError) {}		try {			app.applyWorkspace("Keith, laptop");		}		catch (myError) {}			// Other settings not in the UI?		// app.generalPreferences.customMonitorPpi = false;		// myDoc.viewPreferences.printDialogMeasurementUnits = MeasurementUnits.PICAS; // POINTS, PICAS, INCHES, INCHES_DECIMAL, MILLIMETERS, CENTIMETERS, CICEROS, CUSTOM, AGATES, U, BAI, MILS, PIXELS, Q, HA, AMERICAN_POINTS		// myDoc.viewPreferences.textSizeMeasurementUnits = MeasurementUnits.PICAS; // POINTS, PICAS, INCHES, INCHES_DECIMAL, MILLIMETERS, CENTIMETERS, CICEROS, CUSTOM, AGATES, U, BAI, MILS, PIXELS, Q, HA, AMERICAN_POINTS		// myDoc.viewPreferences.typographicMeasurementUnits = MeasurementUnits.PICAS; // POINTS, PICAS, INCHES, INCHES_DECIMAL, MILLIMETERS, CENTIMETERS, CICEROS, CUSTOM, AGATES, U, BAI, MILS, PIXELS, Q, HA, AMERICAN_POINTS		// app.generalPreferences.createLinksOnContentPlace = true; // I'm not sure what this does?????		// app.generalPreferences.mapStylesOnContentPlace = false; // I'm not sure what this does?????		// app.generalPreferences.useCustomMonitorResolution = true;	}	else {		// No documents are open, so display an error message.		alert("No InDesign documents are open. Please open a document and try again.")	}}