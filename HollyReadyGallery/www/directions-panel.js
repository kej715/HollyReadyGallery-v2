if (typeof com === "undefined")
	com = {};
if (typeof com.kyrafre === "undefined")
	com.kyrafre = {};
if (typeof com.kyrafre.gallery === "undefined")
	com.kyrafre.gallery = {};

com.kyrafre.gallery.DirectionsPanel = function(application)
{
    this.application = application;
};

com.kyrafre.gallery.DirectionsPanel.prototype.getPanel = function()
{
    if (typeof this.panel === "undefined")
    {
        var self = this;
        
        this.backButton = new Ext.Button(
        {
            text: "Map",
            ui: "back"
        });
        this.backButton.on("tap", function()
        {
            self.application.setActiveItem(com.kyrafre.gallery.CONTACT_PANEL);
        });
        
        var toField = new Ext.form.Text(
        {
            cls: "directionsToField",
            label: "From",
            labelWidth: "20%",
            value: "Current Location"
        });
        
        var directionsButton = new Ext.Button(
        {
            text: "Get Directions",
            cls: "directionsDirectionsButton",
            ui: "action"
        });
        directionsButton.on("tap", function()
        {
            var value = toField.getValue();

            if (value === "Current Location")
            {
                navigator.geolocation.getCurrentPosition(
                function(position)
                {
                    self.renderDirections(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
                    navigator.geolocation.stop();
                },
                function(error)
                {
                    navigator.notification.alert(error.message, function(){}, "Position Unavailable", "Dismiss");
                },
                {maximumAge: 3000, enableHighAccuracy: true});
            }
            else
                self.renderDirections(value);
        });
        
        this.formPanel = new Ext.form.FormPanel(
        {
            items: [toField, directionsButton]
        });

        this.panel = new Ext.Panel(
        {
            html: "<div id=\"directions-container\"></div>",
            dockedItems:
            [
                {
                    dock: "top",
                    xtype: "toolbar",
                    title: "Directions",
                    items: [self.backButton]
                },
                {
                    dock: "top",
                    items: [self.formPanel]
                }
            ],
            scroll: "vertical"
        });
    }
    
    return this.panel;
};

com.kyrafre.gallery.DirectionsPanel.prototype.renderDirections = function(origin)
{
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(self.map);
    var container = document.getElementById("directions-container");
    
    while (container.childNodes.length > 0)
        container.removeChild(container.firstChild);
    
    directionsDisplay.setPanel(container);
    var request =
    {
        origin: origin,
        destination: "609 Congress Street, 04101",
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status)
    {
        if (status === google.maps.DirectionsStatus.OK)
        {
            directionsDisplay.setDirections(response);
            self.map.setZoom(15);
        }
    });
};

com.kyrafre.gallery.DirectionsPanel.prototype.setMap = function(map)
{
    this.map = map;
};