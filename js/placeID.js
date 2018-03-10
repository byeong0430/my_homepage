// This sample uses the Place Autocomplete widget to allow the user to search
// for and select a place. The sample then displays an info window containing
// the place ID and other information about the place that the user has
// selected.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

//Check if any of given multiple values exist within an array
function containsAll(needles, haystack){ 
    for(var i = 0 , len = needles.length; i < len; i++){
       if($.inArray(needles[i], haystack) != -1) return true;
    }
    return false;
}


function drag_drop(content, dropTarget_id){
    var dragItem_id = "drag-badge";
    
    $("#" + dragItem_id).draggable({
        appendTo: 'body',
        helper: 'clone'
    });
    
    $("#" + dropTarget_id).droppable({
        drop: function(event, ui) {
            $(this).html(content); //Append the address to the target td
        }
    });
}


function initMap() {    
    //Initial map center point
    var ini_center = {lat: 49.2827, lng: -123.1207};
    var ini_zoom = 13;
    var map = new google.maps.Map(document.getElementById('map'), {
        center: ini_center,
        zoom: ini_zoom
    });

    var input = document.getElementById('pac-input');

    var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
        infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
        map: map
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });

    autocomplete.addListener('place_changed', function() {
        //Every time a new location is searched, an empty row is created to host address info
        //If a new search is executed WITHOUT your previous address being saved in the progress bar table, remove that empty row.
        var droptbody_class = "drop-tbody";
        $("." + droptbody_class + " td:empty").remove();

        infowindow.close(); //Close the infowindow every time a new search is executed
        var place = autocomplete.getPlace();
        
        /*
        Ultimately we want to get a place ID uniquely associated with 
        a business establishment rather than geographic locations, so it is important to 
        disable street address searching!
        Check if place.types contains "street_address". If it does, checkProhibitType is >= 0
        */
        var prohibitType = ["street_address", "premise"];
        var checkProhibitType = containsAll(prohibitType, place.types);
        
        //If you type a non-existing address, stop the code
        if (!place.geometry) {
            return;
        }else if (checkProhibitType) { 
            //If place.types contains any item in prohibitType, create an alert message.
            alert("Please enter your business name, not address!");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        // Set the position of the marker using the place ID and location.
        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location
        });
        marker.setVisible(true);
        
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = place.formatted_address;
        infowindow.open(map, marker);
        

        //Create an id for an empty row for the searched address using the unique place id
        var dropTarget_id = "droptarget_" + place.place_id;
        $("." + droptbody_class).append('<tr><td id="' + dropTarget_id + '"></td></tr>');

        //Execute drag and drop function
        drag_drop(place.formatted_address, dropTarget_id);
        
    });
    
}

