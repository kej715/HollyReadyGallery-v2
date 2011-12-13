if (typeof com === "undefined")
	com = {};
if (typeof com.kyrafre === "undefined")
	com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined")
	com.kyrafre.gallery = {};

com.kyrafre.gallery.ContactPanel = function(application)
{
    this.application = application;
};

com.kyrafre.gallery.ContactPanel.prototype.getPanel = function()
{
    if (typeof this.panel === "undefined")
    {
        var self = this;
        
        this.phoneButton = new Ext.Button(
        {
            cls: "contactPanelButton",
            iconCls: "phoneButton",
            text: "Phone"
        });
        this.phoneButton.on("tap", function()
        {
            document.location = "tel:+1-207-632-1027";
        });

        this.emailButton = new Ext.Button(
        {
            cls: "contactPanelButton",
            iconCls: "emailButton",
            text: "E-mail"
        });
        this.emailButton.on("tap", function()
        {
            document.location = "mailto:hready2539@aol.com";
        });

        this.directionsButton = new Ext.Button(
        {
            cls: "contactPanelButton",
            text: "Directions"
        });
        this.directionsButton.on("tap", function()
        {
            self.application.directionsPanel.setMap(self.map.map);
            self.application.setActiveItem(com.kyrafre.gallery.DIRECTIONS_PANEL);
        });

        this.map = new Ext.Map(
        {
            useCurrentLocation: false,
            mapOptions:
            {
                zoom: 15,
                zoomControl: true,
                zoomControlOptions: {style: google.maps.ZoomControlStyle.SMALL},
                disableDoubleClickZoom: false
            }
        });

        this.panel = new Ext.Panel(
        {
            items: [self.map],
            dockedItems:
            [
                {
                    dock: "top",
                    xtype: "toolbar",
                    title: "609 Congress Street"
                },
                {
                    dock: "bottom",
                    xtype: "toolbar",
                    items: [self.phoneButton, self.emailButton, self.directionsButton],
                    layout:
                    {
                        type: "hbox",
                        pack: "center"
                    }
                }
            ]
        });

        this.map.on("maprender", function(emap, gmap)
        {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode(
            {
                address: "609 Congress Street, Portland 04101"
            },
            function(results, status)
            {
                if (status === google.maps.GeocoderStatus.OK)
                {
                    gmap.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker(
                    {
                        map: gmap, 
                        position: results[0].geometry.location
                    });
                }
                else
                {
                    navigator.notification.alert(status, function(){}, "Service Unavailable", "Dismiss");
                }
            });
        });
    }
    
    return this.panel;
};
