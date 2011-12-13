if (typeof com === "undefined")
	com = {};
if (typeof com.kyrafre === "undefined")
	com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined")
	com.kyrafre.gallery = {};

com.kyrafre.gallery.SlideshowPanel = function(application)
{
    this.application = application;
    this.imageIndex = 0;
};

com.kyrafre.gallery.SlideshowPanel.prototype.getPanel = function()
{
    var self = this;
    
    if (typeof this.panel === "undefined")
    {
        this.panel = new Ext.Panel(
        {
            cls: "galleryImage",
            fullscreen: true,
            monitorOrientation: true
        });
        
        this.mediaBar = new com.kyrafre.gallery.MediaBar(this.application);
        this.panel.addDocked(this.mediaBar.getMediaBar());
        
        this.application.registerListener("BeforeCardSwitch", function(evt)
        {
            if (evt.payload.from === self.panel)
            {
                if (typeof self.slideshowTimer !== "undefined")
                    clearTimeout(self.slideshowTimer);
                                          
                self.application.toolBar.setPlayOn(true);
            }
        });
        
        this.application.registerListener("ImageDataRefreshed", function(evt)
        {
            self.imageIndex = 0;
            self.refreshContent();
        });
        
        this.application.registerListener("PlayButtonTapped", function(evt)
        {
            var isPlayOn = self.application.toolBar.isPlayOn();
                                          
            if (!isPlayOn)
            {
                self.application.setActiveItem(com.kyrafre.gallery.SLIDESHOW_PANEL);
                self.renderImage();
            }
            else
            {
                clearTimeout(self.slideshowTimer);
            }
        });
        
        
        this.panel.on("activate", function(panel)
        {
            self.refreshContent();
        });
        
        this.application.registerListener("OrientationChange", function(evt)
        {
            if (self.panel.isVisible())
                self.renderImage();

        });
    }
    
    return this.panel;
};

com.kyrafre.gallery.SlideshowPanel.prototype.refreshContent = function()
{
    this.panel.removeAll(true);
    this.renderImage();
};

com.kyrafre.gallery.SlideshowPanel.prototype.renderImage = function()
{
    var self = this;
    
    if (this.slideshowTimer !== "undefined")
        clearTimeout(this.slideshowTimer);
    
    this.panel.update(this.getHTML(this.imageIndex));
    var img = Ext.DomQuery.selectNode("img", this.panel.getEl().dom);
    Ext.EventManager.on(img, "load", function()
    {
        self.slideshowTimer = setTimeout(function()
        {
            Ext.Anim.run(self.panel.getEl(), "fade", {out: true});
                                     
            if (++self.imageIndex >= self.application.imageMetadata.length) self.imageIndex = 0;

            self.renderImage();
        }, 4000);
    });
};

com.kyrafre.gallery.SlideshowPanel.prototype.getHTML = function(imageIndex)
{
    var size = this.application.getMainPanelSize();
    size.height -= this.mediaBar.getMediaBar().getHeight();    
    var imageObj = this.application.imageMetadata[imageIndex];
    var base = this.application.properties.renderImage + "?img=";    
    var url = base + imageObj.url + "&amp;w=" + (size.width - 8)
    + "&amp;h=" + (size.height - 60);
    var html = "<ul>"
    + "<li>" + imageObj.title + "</li>"
    + "<li><img src=\"" + url + "\"/></li>"
    + "<li><span class=\"galleryImageDescription\">" + imageObj.description + "</span></li>"
    + "</ul>";
    
    return html;
};

