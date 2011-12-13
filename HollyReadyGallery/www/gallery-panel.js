if (typeof com === "undefined")
	com = {};
if (typeof com.kyrafre === "undefined")
	com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined")
	com.kyrafre.gallery = {};

com.kyrafre.gallery.GalleryPanel = function(app)
{
    this.application = app;
    this.imageIndex = 0;
};

com.kyrafre.gallery.GalleryPanel.prototype.getPanel = function()
{
    var self = this;
    
    if (typeof this.panel === "undefined")
    {
        this.panel = new Ext.Panel(
        {
            monitorOrientation: true,
            layout: "fit"
        });
        
        this.innerCardPanel = new Ext.Panel(
        {
            monitorOrientation: true,
            layout: "card"
        });
        
        this.panel.add(this.innerCardPanel);
        
        this.mediaBar = new com.kyrafre.gallery.MediaBar(this.application);
        this.panel.addDocked(this.mediaBar.getMediaBar());
        
        this.form = new Ext.form.FormPanel({cls: "searchField"});
        this.panel.addDocked(this.form);
        this.textField = new Ext.form.Text(
        {
            cls: "searchField",
            name : "search",
            label: "Search",
            labelWidth: "50px",
            placeHolder: "Words in title"
        });
        this.form.add(this.textField);
        this.textField.on("blur", function(textField, evt)
        {
            self.filterMetadata();
            self.refreshContent();
        });
        
        this.imageMetadata = [];
        
        this.panel.on("activate", function(panel)
        {
            if (typeof self.activated === "undefined")
            {
                self.filterMetadata();
                self.refreshContent();
                self.activated = true;
            }
        });
        
        this.application.registerListener("ImageDataRefreshed", function(evt)
        {
            self.filterMetadata();
            self.refreshContent();
        });

        this.application.registerListener("OrientationChange", function(evt)
        {
            if (self.panel.isVisible())
            {
                for (var i = 0; i < self.cardInfo.length; ++i)
                {
                    self.cardInfo[i].card.update(self.getHTML(self.cardInfo[i].imageIndex));
                }
            }
            else
                delete self.activated;
        });
    }
    
    return this.panel;
};

com.kyrafre.gallery.GalleryPanel.prototype.filterMetadata = function()
{
    var filterWords = this.textField.getValue().replace(/\s+/, " ").toLowerCase().split(" ");
    var metadata = this.application.imageMetadata;
    this.imageMetadata = [];
    
    for (var i = 0; i < metadata.length; ++i)
    {
        var imageObj = metadata[i];
        
        if (filterWords.length > 0)
        {
            var title = imageObj.title.toLowerCase();
            var matches = true;
            var w = 0;
            
            while (w < filterWords.length && matches)
                matches = matches && title.indexOf(filterWords[w++]) >= 0;
            
            if (matches)
                this.imageMetadata.push(imageObj);
        }
        else
            this.imageMetadata.push(imageObj);
    }
};

com.kyrafre.gallery.GalleryPanel.prototype.refreshContent = function()
{
    var self = this;
    this.currentImageIndex = 0;
    this.nextImageIndex = 0;
    this.cardInfo = [];
    this.innerCardPanel.removeAll(true);
    var size = this.application.getMainPanelSize();
    size.height -= this.mediaBar.getMediaBar().getHeight() + this.form.getHeight();
    var limit = this.imageMetadata.length >= 5 ? 5 : this.imageMetadata.length;
    
    for (var i = 0; i < limit; ++i)
    {
        var card = new Ext.Panel(
        {
            cls: "galleryImage",
            height: size.height,
            monitorOrientation: true,
            scroll:
            {
                direction: "horizontal",
                listeners:
                {
                    bouncestart:
                    {
                        element: "el",
                        fn: function(scroller, info)
                        {
                            var velocity = info.velocity;
                            var anim = {type: "slide", direction: "left"};
                            
                            if (velocity < 0)
                            {
                                if (++self.currentImageIndex >= self.imageMetadata.length)
                                {
                                    self.currentImageIndex = self.imageMetadata.length - 1;
                                    return;
                                }
                                 
                                self.innerCardPanel.setActiveItem(self.currentImageIndex % self.cardInfo.length, anim);

                                if (self.nextImageIndex < self.imageMetadata.length
                                    && self.nextImageIndex - self.currentImageIndex < 3)
                                {
                                    var ci = self.nextImageIndex % self.cardInfo.length;
                                    self.cardInfo[ci].card.update(self.getHTML(self.nextImageIndex));
                                    self.cardInfo[ci].imageIndex = self.nextImageIndex++;
                                }
                            }
                            else
                            {
                                if (--self.currentImageIndex < 0)
                                {
                                    self.currentImageIndex = 0;
                                    return;
                                }

                                anim.direction = "right";
                                 
                                self.innerCardPanel.setActiveItem(self.currentImageIndex % self.cardInfo.length, anim);
                                 
                                if (self.nextImageIndex >= self.cardInfo.length
                                    && self.nextImageIndex - self.currentImageIndex >= 3)
                                {
                                    var ii = self.nextImageIndex - self.cardInfo.length;
                                    var ci = ii % self.cardInfo.length;
                                    self.cardInfo[ci].card.update(self.getHTML(ii));
                                    self.cardInfo[ci].imageIndex = ii;
                                    self.nextImageIndex--;
                                }
                            }
                        }
                    }
                }
            },
            layout: "fit",
            html: self.getHTML(self.nextImageIndex)
        });
        
        this.innerCardPanel.add(card);
        this.cardInfo.push({imageIndex:self.nextImageIndex, card:card});
        self.nextImageIndex++;
    }

    this.innerCardPanel.setActiveItem(this.currentImageIndex % this.cardInfo.length);
    this.panel.doLayout();
};

com.kyrafre.gallery.GalleryPanel.prototype.getHTML = function(imageIndex)
{
    var size = this.application.getMainPanelSize();
    size.height -= this.mediaBar.getMediaBar().getHeight() + this.form.getHeight();
    var imageObj = this.imageMetadata[imageIndex];
    var url = this.application.properties.renderImage
    + "?img=" + imageObj.url + "&amp;w=" + (size.width - 8) + "&amp;h=" + (size.height - 60);
    html = 
      "<ul>"
    + "<li>" + imageObj.title + "</li>"
    + "<li><img src=\"" + url + "\"/></li>"
    + "<li><span class=\"galleryImageDescription\">" + imageObj.description + "</span></li>"
    + "</ul>";

    return html;
};
