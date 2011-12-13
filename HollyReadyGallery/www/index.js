if (typeof com === "undefined") com = {};
if (typeof com.kyrafre === "undefined") com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined") com.kyrafre.gallery = {};

com.kyrafre.gallery.Application = function()
{
    var self = this;
    this.baseURL = "http://www.hollyready.com/";
    this.listenerMap = {};
    this.properties = {};
    this.mediaSelections =
    [
        {
            name: "Available",
            value: true
        },
        {
            name: "Sold",
            value: false
        },
        {
            name: "Oil",
            value: true
        },
        {
            name: "Gouache",
            value: true
        }
    ];
    
    this.getProperties(function(props)
    {
        self.getImageMetadata(function(data)
        {
            self.init();
            self.sendNotification("ImageDataRefreshed");
        });
    });
    
    this.registerListener("RefreshButtonTapped", function(evt)
    {
        self.getImageMetadata(function(data)
        {
            self.sendNotification("ImageDataRefreshed", evt);
        });
    });
    
    this.registerListener("MediaSelectionUpdate", function(evt)
    {
        self.getImageMetadata(function(data)
        {
            self.sendNotification("ImageDataRefreshed", evt);
        });
    });
    
    document.addEventListener("resume", function()
    {
        if (navigator.network.connection.type !== Connection.NONE)
        {
            self.getImageMetadata(function(data)
            {
                self.sendNotification("ImageDataRefreshed", evt);
            });
        }
        else
            navigator.notification.alert("No network services are currently available.",
                                         function(){}, "Service Unavailable", "Dismiss");

    }, false);
    
    document.addEventListener("online", function()
    {
        self.getImageMetadata(function(data)
        {
            self.sendNotification("ImageDataRefreshed", evt);
        });

    }, false);
    
    document.addEventListener("offline", function()
    {
        navigator.notification.alert("No network services are currently available.",
                                     function(){}, "Service Unavailable", "Dismiss");
    }, false);
};

com.kyrafre.gallery.Application.prototype.getHTML = function(url, successCallback, failureCallback)
{
	var self = this;
	//self.addLoadingAnimation();
    
	Ext.Ajax.request(
    {
        url: url,
        success: function(response, opts)
        {
            //self.removeLoadingAnimation();
            
            var lines = response.responseText.split("\n");
            var line = null;
            var matches = null;
            var html = [];
            var rgx = /<body[^>]*>(.*)/i;
            rgx.compile(rgx);
                     
            while (lines.length > 0)
            {
                line = lines.shift();
                matches = rgx.exec(line);
                if (matches !== null)
                {
                    html.push(matches[1]);
                    break;
                }
            }

            rgx = /(.*)<\body/i;
            rgx.compile(rgx);
                     
            while (lines.length > 0)
            {
                line = lines.shift();
                matches = rgx.exec(line);
                if (matches !== null)
                {
                    html.push(matches[1]);
                    break;
                }
                else
                     html.push(line);
            }
                     
            if (typeof successCallback === "function")
                successCallback(html.join("\n"));
        },
        failure: function(response, opts)
        {
            //self.removeLoadingAnimation();

            if (typeof failureCallback === "function")
                failureCallback(response);

            else if (navigator.network.connection.type === Connection.NONE)
                navigator.notification.alert("No network services are currently available.",
                                             function(){}, "Service Unavailable", "Dismiss");

            else
                navigator.notification.alert(response.statusText, function(){}, "Service Unavailable", "Dismiss");
        }
    });
};

com.kyrafre.gallery.Application.prototype.getImageMetadata = function(successCallback, failureCallback)
{
	var self = this;
    
    var criteria = {status:[], media:[]};
    
    for (var i = 0; i < this.mediaSelections.length; ++i)
    {
        var mediaSelection = this.mediaSelections[i];
        
        if (mediaSelection.name === "Available")
        {
            if (mediaSelection.value)
                criteria.status.push("available");
        }
        else if (mediaSelection.name === "Sold")
        {
            if (mediaSelection.value)
                criteria.status.push("sold");
        }
        else if (mediaSelection.name === "Oil")
        {
            if (mediaSelection.value)
                criteria.media.push("oil");
        }
        else if (mediaSelection.name === "Gouache")
        {
            if (mediaSelection.value)
                criteria.media.push("gouache");
        }
    }
    
    this.getJSON(this.properties.listImages
                 + "?status=" + criteria.status.join()
                 + "&media=" + criteria.media.join(), function(data)
    {
        data.sort(function(o1, o2)
        {
            if (o1.mtime > o2.mtime)
                return -1;
            else if (o1.mtime < o2.mtime)
                return 1;
            else
                return 0;
        });

        self.imageMetadata = data;

        if (typeof successCallback === "function")
            successCallback(data);

    }, failureCallback);
};

com.kyrafre.gallery.Application.prototype.getJSON = function(url, successCallback, failureCallback)
{
	var self = this;
	//self.addLoadingAnimation();
    
	Ext.Ajax.request(
    {
        url: url,
        success: function(response, opts)
        {
            //self.removeLoadingAnimation();

            var data = Ext.decode(response.responseText);
                     
            if (typeof successCallback === "function")
                successCallback(data);
        },
        failure: function(response, opts)
        {
            //self.removeLoadingAnimation();
            if (typeof failureCallback === "function")
                failureCallback(response);
                     
            else if (navigator.network.connection.type === Connection.NONE)
                navigator.notification.alert("No network services are currently available.",
                                             function(){}, "Service Unavailable", "Dismiss");
            else
                navigator.notification.alert(response.statusText, function(){}, "Service Unavailable", "Dismiss");
        }
    });
};

com.kyrafre.gallery.Application.prototype.getMainPanelSize = function()
{
    var w = this.applicationPanel.getWidth();
    var h = this.applicationPanel.getHeight()
    - (this.toolBar.getToolBar().getHeight()
       + this.navigationBar.getNavigationBar().getHeight());
    
    return {width:w, height:h};
};

com.kyrafre.gallery.Application.prototype.getMediaSelections = function()
{
    return this.mediaSelections;
};

com.kyrafre.gallery.Application.prototype.getProperties = function(successCallback, failureCallback)
{
	var self = this;
    this.getJSON(this.baseURL + "properties.json", function(data)
    {
        for (var name in data)
            self.properties[name] = data[name];
                 
        if (typeof successCallback === "function")
            successCallback(self.properties);                 
    }, failureCallback);
};

com.kyrafre.gallery.Application.prototype.init = function()
{
    var self = this;
    
    this.applicationPanel = new Ext.Panel(
    {
        fullscreen: true,
        layout: "card",
        monitorOrientation: true
    });

    this.contactPanel = new com.kyrafre.gallery.ContactPanel(this);
    this.directionsPanel = new com.kyrafre.gallery.DirectionsPanel(this);
    this.galleryPanel = new com.kyrafre.gallery.GalleryPanel(this);
    this.navigationBar = new com.kyrafre.gallery.NavigationBar(this);
    this.newsPanel = new com.kyrafre.gallery.NewsPanel(this);
    this.slideshowPanel = new com.kyrafre.gallery.SlideshowPanel(this);
    this.statementPanel = new com.kyrafre.gallery.StatementPanel(this);
    this.tilesPanel = new com.kyrafre.gallery.TilesPanel(this);
    this.toolBar = new com.kyrafre.gallery.ToolBar(this);
    
    this.applicationPanel.addDocked(
    [
        this.toolBar.getToolBar(),
        this.navigationBar.getNavigationBar()
    ]);
    
    this.applicationPanel.add(
    [
        this.galleryPanel.getPanel(),
        this.tilesPanel.getPanel(),
        this.contactPanel.getPanel(),
        this.newsPanel.getPanel(),
        this.statementPanel.getPanel(),
        this.directionsPanel.getPanel(),
        this.slideshowPanel.getPanel()
    ]);
    
    this.applicationPanel.doLayout();
    
    this.applicationPanel.on("beforecardswitch", function(appPanel, newCard, oldCard, index, animated)
    {
        self.sendNotification("BeforeCardSwitch", {from:oldCard,to:newCard});
    });
    
    this.applicationPanel.on("orientationchange", function(evt, orientation, width, height)
    {
        self.sendNotification("OrientationChange", {orientation:orientation,width:width,height:height});
        }, this, {buffer:10});
};

com.kyrafre.gallery.Application.prototype.registerListener = function(eventName, listener)
{
    if (typeof this.listenerMap[eventName] === "undefined")
        this.listenerMap[eventName] = [];
    
    this.listenerMap[eventName].push(listener);
};

com.kyrafre.gallery.Application.prototype.sendNotification = function(eventName, payload)
{
    if (typeof this.listenerMap[eventName] !== "undefined")
    {
        var listeners = this.listenerMap[eventName];
        var evt = {eventName: eventName};
            
        if (typeof payload !== "undefined")
            evt.payload = payload;
        
        for (var i = 0; i < listeners.length; ++i)
        {
            listeners[i](evt);
        }
    }
};

com.kyrafre.gallery.Application.prototype.setActiveItem = function(item)
{
    this.applicationPanel.setActiveItem(item);
};

com.kyrafre.gallery.init = function()
{
    var app = new com.kyrafre.gallery.Application();
};

com.kyrafre.gallery.main = function()
{
    Ext.setup(
    {
        tabletStartupScreen: "tablet_startup.png",

        phoneStartupScreen: "phone_startup.png",

        icon: "icon.png",

        glossOnIcon: false,

        onReady: com.kyrafre.gallery.init
    });
};

