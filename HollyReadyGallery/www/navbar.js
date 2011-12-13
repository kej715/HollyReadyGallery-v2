if (typeof com === "undefined") com = {};
if (typeof com.kyrafre === "undefined") com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined") com.kyrafre.gallery = {};

com.kyrafre.gallery.NavigationBar = function(application)
{
    var self = this;
    
    this.application = application;
    
    this.contactButton = new Ext.Button(
    {
        baseCls: "navigationButton contactButton",
        text: "Contact"
    });
    this.contactButton.on("tap", function(button, evt)
    {
        self.application.setActiveItem(com.kyrafre.gallery.CONTACT_PANEL);
    });
    
    this.galleryButton = new Ext.Button(
    {
        baseCls: "navigationButton galleryButton",
        text: "Gallery"
    });
    this.galleryButton.on("tap", function(button, evt)
    {
        self.application.setActiveItem(com.kyrafre.gallery.GALLERY_PANEL);
    });
    
    this.newsButton = new Ext.Button(
    {
        baseCls: "navigationButton newsButton",
        text: "News"
    });
    this.newsButton.on("tap", function(button, evt)
    {
        self.application.setActiveItem(com.kyrafre.gallery.NEWS_PANEL);
    });

    this.statementButton = new Ext.Button(
    {
        baseCls: "navigationButton statementButton",
        text: "Statement"
    });
    this.statementButton.on("tap", function(button, evt)
    {
        self.application.setActiveItem(com.kyrafre.gallery.STATEMENT_PANEL);
    });

    this.tilesButton = new Ext.Button(
    {
        baseCls: "navigationButton tilesButton",
        text: "Tiles"
    });
    this.tilesButton.on("tap", function(button, evt)
    {
        self.application.setActiveItem(com.kyrafre.gallery.TILES_PANEL);
    });
    
    this.navigationBar = new Ext.Toolbar(
    {
        dock: "bottom",
        cls: "navigationBar",
        layout:
        {
            type: "hbox",
            pack: "justify"
        }
    });
    
    this.navigationBar.add(
    [
        this.galleryButton,
        this.tilesButton,
        this.contactButton,
        this.newsButton,
        this.statementButton
    ]);
    
    this.navigationBar.doLayout();
};

com.kyrafre.gallery.NavigationBar.prototype.getNavigationBar = function()
{
    return this.navigationBar;
};