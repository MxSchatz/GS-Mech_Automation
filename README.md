# GS-Production_Automation

# Welcome to the G&S Production Automation Repository!

How to Install and use InDesign scripts:
+ Go to apps > indesign cc 2019 > Scripts > Scripts panel > paste .jsx file here, or make a folder
+ To find the script and use it, open InDesign, then go to the top menu: Window > Utilities > Scripts
+ To run the script, click on the script in the pannel

Scripts in progress:
+ Generic_Mech_Export_Singles.jsx
+ Syng_Mech_Export_Singles_v2.jsx
+ Review_PDF_spreads.jsx
+ HR_Crops-fix.jsx

Scripts in QA:
+ Syng_Mech_Export_Singles_v1.jsx
+ Generic_Mech_Export_Singles.jsx
+ Brochure_Review_PDF_singles.jsx

Mech Export "SinglesOnly" Script TO-DO:
+ FEATURE: Create "Exports" folder, then save files in there
+ FEATURE: Preflight Failsafe
+ BUG: HRcrops - crop mark offset broken depending on preferences
+ FEATURE: all Ruler types support
+ FEATURE: all page naming types support
+ Crop Marks feature that converts properly

Script Requests:
+ Mech-Export that relies on more specific export presets
+ Convert Spot swatches to Process CMYK
+ Create swatches from Colors used in the document
+ Pre-flights for specific printers
+ Custom GREP search for copyright symbols that aren't superscripted
+ Custom GREP search for layers that are turned off

Dream Requests:
+ "Math is hard" inside InDesign or Illustrator
+ Convert RGB to CMYK
+ Convert RGB swatches to CMYK

Future Scripts:
+ Final Mech with spreads
+ Mech for publications
+ Create swatches from unnamed used colors in the document
+ Production mech preferences

General Stuff
+ Make sure Rulers are inches
+ Doesn't support lettered pages
+ Export path and naming efficiencies don't work using Mountain Duck

Syng_Mech_Export_Singles_v1.jsx
+ Zoom-in to the first page for cover page feature

Bug for Syng_Mech_Export_Singles_v1.jsx, Generic_Mech_Export_Singles.jsx
+ Latest InDesign version breaks HR_Crops.
+ Manually Export HR_Crops for now.
