if (typeof com === "undefined")
	com = {};
if (typeof com.kyrafre === "undefined")
	com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined")
	com.kyrafre.gallery = {};

com.kyrafre.gallery.Tile = function(application, w, h)
{
    var self = this;
    this.application = application;
    this.base = application.properties.renderImage + "?img=";
    this.width = w;
    this.height = h;
    this.currentSide = 0;
    this.front = new Ext.Panel({layout: "fit", cls: "imageTile"});
    this.back = new Ext.Panel({layout: "fit", cls: "imageTile"});
    this.sides = [this.front, this.back];
    this.tile = new Ext.Panel(
    {
        width: w,
        height: h,
        items: self.sides,
        layout:
        {
            type: "card"
        },
        cardSwitchAnimation: "flip"
    });
};

com.kyrafre.gallery.Tile.prototype.getTile = function()
{
    return this.tile;
};

com.kyrafre.gallery.Tile.prototype.isFrontRevealed = function()
{
    return this.currentSide === 0;
};

com.kyrafre.gallery.Tile.prototype.revealSide = function(side)
{
    if (this.currentSide !== side)
    {
        this.currentSide = side;
        this.getTile().setActiveItem(side);
    }
};

com.kyrafre.gallery.Tile.prototype.setImage = function(side, imageObj)
{
    var self = this;
    var url = this.base + imageObj.url + "&w=" + (this.width - 8) + "&h=" + (this.height - 8);
    var s = this.sides[side];
    s.imageObject = imageObj;
    s.removeAll(true);
    s.update("<img src=\"" + url + "\"/>");
    
    s.on("afterlayout", function()
    {
        var img = Ext.DomQuery.selectNode("img", s.getEl().dom);
        Ext.EventManager.removeAll(img);
        Ext.EventManager.on(img, "click", function()
        {
            self.application.sendNotification("TileTapped", imageObj);
        });
    });
};

com.kyrafre.gallery.Tile.prototype.turn = function(imageObj)
{
    var side = this.currentSide;
    this.revealSide((side + 1) % 2);
    this.setImage(side, imageObj);
    this.tile.doLayout();
};
