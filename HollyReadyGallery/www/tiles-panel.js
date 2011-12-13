if (typeof com === "undefined")
	com = {};
if (typeof com.kyrafre === "undefined")
	com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined")
	com.kyrafre.gallery = {};

com.kyrafre.gallery.TilesPanel = function(application)
{
    this.application = application;
    this.currentImages = [];
    this.imageIndex = 0;
    this.tiles = [];
};

com.kyrafre.gallery.TilesPanel.prototype.flipTile = function()
{
    var self = this;
    var t = Math.floor(Math.random() * self.tiles.length);
    var tile = self.tiles[t];
    var ii = t * 2;
    
    if (!tile.isFrontRevealed()) ++ii;
    
    if (++self.imageIndex >= self.application.imageMetadata.length) self.imageIndex = 0;
    
    var newImage = self.application.imageMetadata[self.imageIndex++];
    self.currentImages[ii] = newImage;
    tile.turn(newImage);
    self.flipTimer = setTimeout(function(){self.flipTile();}, 4000);
};

com.kyrafre.gallery.TilesPanel.prototype.getPanel = function()
{
    var self = this;
    
    if (typeof this.panel === "undefined")
    {        
        this.panel = new Ext.Panel(
        {
            monitorOrientation: true,
            layout:
            {
                type: "vbox",
                pack: "center"
            }
        });
        
        this.mediaBar = new com.kyrafre.gallery.MediaBar(this.application);
        this.panel.addDocked(this.mediaBar.getMediaBar());
        
        this.application.registerListener("BeforeCardSwitch", function(evt)
        {
            if (evt.payload.from === self.panel && typeof self.flipTimer !== "undefined")
                clearTimeout(self.flipTimer);
        });
        
        this.application.registerListener("ImageDataRefreshed", function(evt)
        {
            self.currentImages = [];
            self.imageIndex = 0;
            self.refreshContent();
        });
        
        this.application.registerListener("TileTapped", function(evt)
        {
            self.popupImage(evt.payload);
        });

        this.panel.on("activate", function(panel)
        {
            if (typeof self.activated === "undefined")
            {
                self.refreshContent();
                self.activated = true;
            }
            else
                self.flipTimer = setTimeout(function(){self.flipTile();}, 4000);
        });

        this.application.registerListener("OrientationChange", function(evt)
        {
            if (self.panel.isVisible())
            {
                self.refreshContent();
                      
                if (typeof self.selectedImageObj !== "undefined" && self.selectedImageObj !== null)
                    self.popupImage(self.selectedImageObj);
            }
            else
                delete self.activated;
        });
    }
    
    return this.panel;
};

com.kyrafre.gallery.TilesPanel.prototype.popupImage = function(imageObj)
{
    var self = this;
    clearTimeout(self.flipTimer);
    this.selectedImageObj = imageObj;
    var size = this.application.getMainPanelSize();
    var w = Math.floor(size.width * 0.75);
    var h = Math.floor(size.height * 0.75);
    var url = this.application.properties.renderImage + "?img=" + imageObj.url + "&w=" + (w - 8)
    + "&h=" + (h - 60);
    var html = "<ul>"
    + "<li>" + imageObj.title + "</li>"
    + "<li><img src=\"" + url + "\"/></li>"
    + "<li><span class=\"popupImageDescription\">" + imageObj.description + "</span></li>"
    + "</ul>";
    
    if (typeof this.popupImageContainer === "undefined")
    {
        this.popupImageContainer = new Ext.Sheet(
        {
            cls: "popupImage",
            height: h,
            width: w,
            stretchX: true,
            stretchY: true,
            centered: true,
            layout: "fit",
            html: html
        });
        
        var handler = function()
        {
            var img = Ext.DomQuery.selectNode("img", self.popupImageContainer.getEl().dom);
            Ext.EventManager.removeAll(img);
            Ext.EventManager.on(img, "click", function()
            {
                self.popupImageContainer.hide();
                self.selectedImageObj = null;
                self.flipTimer = setTimeout(function(){self.flipTile();}, 4000);
            });            
        };
        
        this.popupImageContainer.on("afterlayout", handler);
        this.popupImageContainer.on("show", handler);
    }
    else
    {
        this.popupImageContainer.setSize(w, h);
        this.popupImageContainer.update(html);
    }
    
    if (this.popupImageContainer.isVisible())
        this.popupImageContainer.doLayout();
    else
        this.popupImageContainer.show();
};

com.kyrafre.gallery.TilesPanel.prototype.refreshContent = function()
{
    var self = this;
    
    if (typeof this.flipTimer !== "undefined")
        clearTimeout(this.flipTimer);
    
    this.mediaBar.refresh();
    
    var size = this.application.getMainPanelSize();
    size.height -= this.mediaBar.getMediaBar().getHeight();

    var pixels = (size.width > 600 && size.height > 600) ? 200 : 100;
    var tilesPerPanel = Math.floor(size.width / pixels);
    var panels = Math.floor(size.height / pixels);
    var w = Math.floor(size.width / tilesPerPanel);
    var h = Math.floor(size.height / panels);
    
    var imageCount = panels * tilesPerPanel * 2;
    
    while (this.currentImages.length < imageCount)
    {
        if (this.imageIndex >= self.application.imageMetadata.length) this.imageIndex = 0;
        this.currentImages.push(self.application.imageMetadata[this.imageIndex++]);
    }
    
    this.panel.removeAll(true);
    this.tiles = [];
    
    var ii = 0;
    
    for (var p = 0; p < panels; ++p)
    {
        var tilePanel = new Ext.Panel(
        {
            height: h,
            layout:
            {
                type: "hbox",
                pack: "center"
            }
        });
        
        this.panel.add(tilePanel);
        
        for (var i = 0; i < tilesPerPanel; ++i)
        {
            var tile = new com.kyrafre.gallery.Tile(this.application, w, h);
            this.tiles.push(tile);

            for (var s = 0; s < 2; ++s)
            {
                tile.setImage(s, this.currentImages[ii++]);
            }
            
            tilePanel.add(tile.getTile());
        }
    }
    
    this.panel.doLayout();
    
    this.flipTimer = setTimeout(function(){self.flipTile();}, 4000);
};
