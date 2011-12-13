if (typeof com === "undefined") com = {};
if (typeof com.kyrafre === "undefined") com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined") com.kyrafre.gallery = {};

com.kyrafre.gallery.MediaBar = function(application)
{
    var self = this;
    
    this.application = application;
    
    this.mediaBar = new Ext.Panel(
    {
        dock: "top",
        layout:
        {
            type: "hbox",
            pack: "justify"
        }
    });
    
    var buttonFactory = function(mediaSelection)
    {
        var baseCls = mediaSelection.value ? "mediaSelection mediaSelectionOn" : "mediaSelection mediaSelectionOff";
        
        var button = new Ext.Button(
        {
            baseCls: baseCls,
            text: mediaSelection.name
        });
        
        button.on("tap", function(button)
        {
            if (mediaSelection.value)
            {
                button.removeCls("mediaSelectionOn");
                button.addCls("mediaSelectionOff");
                mediaSelection.value = false;
            }
            else
            {
                button.removeCls("mediaSelectionOff");
                button.addCls("mediaSelectionOn");
                mediaSelection.value = true;
            }

            self.application.sendNotification("MediaSelectionUpdate", mediaSelection);
        });
        
        return button;
    };
    
    this.buttons = [];
    var mediaSelections = this.application.getMediaSelections();
    
    for (var i = 0; i < mediaSelections.length; ++i)
    {
        this.buttons.push(buttonFactory(mediaSelections[i]));
    }
    
    this.mediaBar.add(this.buttons);
    
    this.application.registerListener("MediaSelectionUpdate", function(evt)
    {
        var name = evt.payload.name;
        var value = evt.payload.value;

        for (var i = 0; i < self.buttons.length; ++i)
        {
            if (mediaSelections[i].name === name)
            {
                var button = self.buttons[i];
                button.removeCls("mediaSelectionOn");
                button.removeCls("mediaSelectionOff");
                button.addCls(value ? "mediaSelection mediaSelectionOn" : "mediaSelection mediaSelectionOff");
            }
        };
    });
};

com.kyrafre.gallery.MediaBar.prototype.getMediaBar = function()
{
    return this.mediaBar;
};

com.kyrafre.gallery.MediaBar.prototype.refresh = function()
{
    var mediaSelections = this.application.getMediaSelections();
    
    for (var i = 0; i < this.buttons.length; ++i)
    {
        var button = this.buttons[i];
        button.removeCls("mediaSelectionOn");
        button.removeCls("mediaSelectionOff");
        button.addCls(mediaSelections[i].value ? "mediaSelection mediaSelectionOn" : "mediaSelection mediaSelectionOff");
    }
};
