if (typeof com === "undefined")
	com = {};
if (typeof com.kyrafre === "undefined")
	com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined")
	com.kyrafre.gallery = {};

com.kyrafre.gallery.NewsPanel = function(application)
{
    this.application = application;
};

com.kyrafre.gallery.NewsPanel.prototype.getPanel = function()
{
    var self = this;
    
    if (typeof this.panel === "undefined")
    {
        this.panel = new Ext.Panel(
        {
            cls: "htmlPanel",
            html:"Loading ...",
            scroll: "vertical"
        });

        this.application.registerListener("RefreshButtonTapped", function(evt)
        {
            self.refreshContent();
        });

        this.refreshContent();
    }
    
    return this.panel;
};

com.kyrafre.gallery.NewsPanel.prototype.refreshContent = function()
{
    var self = this;

    this.application.getHTML(this.application.baseURL + "news.html", function(html)
    {
        self.panel.update("<div class=\"htmlTitle\">Gallery News</div>" + html);
    });
};
