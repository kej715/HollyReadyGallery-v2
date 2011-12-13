if (typeof com === "undefined") com = {};
if (typeof com.kyrafre === "undefined") com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined") com.kyrafre.gallery = {};

com.kyrafre.gallery.ToolBar = function(application)
{
    var self = this;
    this.application = application;
    this.playOn = true;
    this.audioOn = navigator.network.connection.type === Connection.WIFI
    || navigator.network.connection.type === Connection.CELL_4G;
    
    this.audioButton = new Ext.Button(
    {
        baseCls: "toolBarButton",
        html: "<img id=\"audio-button\" src=\"icons/" + (self.audioOn
                                                         ? "264-sound-on.png"
                                                         : "263-sound-off.png") + "\"/>"
    });
    
    this.audioButton.on("tap", function(button, evt)
    {
        self.setAudioOn(!self.audioOn);
        self.application.sendNotification("AudioButtonTapped", {audioOn: self.audioOn});
    });
    
    this.playButton = new Ext.Button(
    {
        baseCls: "toolBarButton",
        html: "<img id=\"play-button\" src=\"icons/16-play.png\"/>"
    });
    
    this.playButton.on("tap", function(button, evt)
    {
        self.setPlayOn(!self.playOn);
        self.application.sendNotification("PlayButtonTapped", {playOn: self.playOn});
    });
    
    this.refreshButton = new Ext.Button(
    {
        baseCls: "toolBarButton",
        html: "<img id=\"refresh-button\" src=\"icons/01-refresh.png\"/>"
    });
    
    this.refreshButton.on("tap", function(button, evt)
    {
        self.application.sendNotification("RefreshButtonTapped");
    });

    var leftToolbarButtons = [this.playButton];
    
    var rightToolbarButtons = [this.refreshButton /*, this.audioButton*/];
    
    var leftToolbarContainer = new Ext.Container(
    {
        items: leftToolbarButtons,
        layout:
        {
            type: "hbox",
            pack: "start"
        }
    });
    
    var rightToolbarContainer = new Ext.Container(
    {
        items: rightToolbarButtons,
        layout:
        {
            type: "hbox",
            pack: "end"
        }
    });
    
    this.toolBar = new Ext.Toolbar(
    {
        dock : "top",
        cls: "toolBar",
        title: "Holly Ready Gallery",
        items: [leftToolbarContainer, rightToolbarContainer],
        layout:
        {
            type: "hbox",
            pack: "justify"
        }
    });
};

com.kyrafre.gallery.ToolBar.prototype.getToolBar = function()
{
    return this.toolBar;
};

com.kyrafre.gallery.ToolBar.prototype.isAudioOn = function()
{
    return this.audioOn;
};

com.kyrafre.gallery.ToolBar.prototype.isPlayOn = function()
{
    return this.playOn;
};

com.kyrafre.gallery.ToolBar.prototype.setAudioOn = function(audioOn)
{
    this.audioOn = audioOn;
    var elem = this.audioButton.getEl().first("img[id=audio-button]");
    var src = elem.getAttribute("src");
    if (audioOn)
        elem.set({src:"icons/264-sound-on.png"});
    else
        elem.set({src:"icons/263-sound-off.png"});
};

com.kyrafre.gallery.ToolBar.prototype.setPlayOn = function(playOn)
{
    this.playOn = playOn;
    var elem = this.playButton.getEl().first("img[id=play-button]");
    var src = elem.getAttribute("src");
    if (playOn)
        elem.set({src:"icons/16-play.png"});
    else
        elem.set({src:"icons/17-pause.png"});
};
