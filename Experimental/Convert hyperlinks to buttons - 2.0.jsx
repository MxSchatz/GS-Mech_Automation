    /* Copyright 2014, Kasyan Servetsky 
    February 3, 2014 
    Written by Kasyan Servetsky 
    http://www.kasyan.ho.com.ua 
    e-mail: askoldich@yahoo.com */  
    //======================================================================================  
    var scriptName = "Convert hyperlinks to buttons - 2.0",  
    doc;  
      
    Main();  
      
    //===================================== FUNCTIONS  ======================================  
    function Main() {  
        var hyperlink, source, sourceText, destination, page, arr, outlinedText, gb, button, behavior, sourcePageItem,  
        barodeCount = 0,  
        hypCount = 0;  
        if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);  
        var startTime = new Date();  
          
        doc = app.activeDocument;  
        var layer = MakeLayer("Buttons");  
        var swatch = MakeColor("RGB Yellow", ColorSpace.RGB, ColorModel.process, [255, 255, 0]);  
        var hyperlinks = doc.hyperlinks;  
          
        var progressWin = new Window ("window", scriptName);  
        progressBar = progressWin.add ("progressbar", undefined, 0, undefined);  
        progressBar.preferredSize.width = 450;  
        progressTxt = progressWin.add("statictext", undefined,  "Starting processing hyperlinks");  
        progressTxt.preferredSize.width = 400;  
        progressTxt.preferredSize.height = 30;  
        progressTxt.alignment = "left";  
        progressBar.maxvalue = hyperlinks.length;  
        progressWin.show();  
          
        for (var i = hyperlinks.length-1; i >= 0; i--) {  
            hyperlink = hyperlinks[i];  
            source = hyperlink.source;  
            destination = hyperlink.destination;  
              
            if (source.constructor.name == "HyperlinkTextSource") {  
                sourceText = source.sourceText;  
                page = sourceText.parentTextFrames[0].parentPage;  
                arr = sourceText.createOutlines(false);  
                outlinedText = arr[0];  
                gb = outlinedText.geometricBounds;  
                outlinedText.remove();              
            }  
            else if (source.constructor.name == "HyperlinkPageItemSource") {  
                sourcePageItem = source.sourcePageItem;  
                gb = sourcePageItem.geometricBounds;  
                page = sourcePageItem.parentPage;  
            }  
              
            barodeCount++;  
            progressBar.value = barodeCount;  
            progressTxt.text = "Processing hyperlink " + hyperlink.name + " (Page - " + page.name + ")";  
              
            if (source.constructor.name == "HyperlinkTextSource" || source.constructor.name == "HyperlinkPageItemSource") {  
                button = page.buttons.add(layer, {geometricBounds: gb, name: hyperlink.name});  
                button.fillColor = swatch;  
                button.fillTint = 50;  
                button.groups[0].transparencySettings.blendingSettings.blendMode = BlendMode.MULTIPLY;      
                behavior = button.gotoURLBehaviors.add();  
                behavior.url = destination.destinationURL;  
                  
                hyperlink.remove();  
                source.remove();  
                  
                hypCount++;  
            }  
        }  
          
        var endTime = new Date();  
        var duration = GetDuration(startTime, endTime);  
        progressWin.close();  
      
        alert("Finished. " + hypCount + " hyperlinks were convertted to buttons.\n(time elapsed: " + duration + ")", scriptName);  
      
    }  
    //--------------------------------------------------------------------------------------------------------------------------------------------------------  
    function GetDuration(startTime, endTime) {  
        var str;  
        var duration = (endTime - startTime)/1000;  
        duration = Math.round(duration);  
        if (duration >= 60) {  
            var minutes = Math.floor(duration/60);  
            var seconds = duration - (minutes * 60);  
            str = minutes + ((minutes != 1) ? " minutes, " :  " minute, ") + seconds + ((seconds != 1) ? " seconds" : " second");  
            if (minutes >= 60) {  
                var hours = Math.floor(minutes/60);  
                minutes = minutes - (hours * 60);  
                str = hours + ((hours != 1) ? " hours, " : " hour, ") + minutes + ((minutes != 1) ? " minutes, " :  " minute, ") + seconds + ((seconds != 1) ? " seconds" : " second");  
            }  
        }  
        else {  
            str = duration + ((duration != 1) ? " seconds" : " second");  
        }  
      
        return str;  
    }  
    //--------------------------------------------------------------------------------------------------------------------------------------------------------  
    function MakeLayer(name, layerColor) {  
        var layer = doc.layers.item(name);  
        if (!layer.isValid) {  
            layer = doc.layers.add({name: name});  
            if (layerColor != undefined) layer.layerColor = layerColor;  
        }  
        return layer;  
    }  
    //--------------------------------------------------------------------------------------------------------------------------------------------------------  
    function MakeColor(colorName, colorSpace, colorModel, colorValue) {  
        var doc = app.activeDocument;  
        var color = doc.colors.item(colorName);  
        if (!color.isValid) {  
            color = doc.colors.add({name: colorName, space: colorSpace, model: colorModel, colorValue: colorValue});  
        }  
        return color;  
    }  
    //--------------------------------------------------------------------------------------------------------------------------------------------------------  
    function ErrorExit(error, icon) {  
        alert(error, scriptName, icon);  
        exit();  
    }  
    //--------------------------------------------------------------------------------------------------------------------------------------------------------  