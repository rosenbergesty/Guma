// Initialize app
var myApp = new Framework7({
    template7Pages: true,
    template7Data: {
        'url:driver.html':{
            name: 'John Doe',
            id: 0
        }
    },
    tapHold: true
});
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

// Connect to firebase
var config = {
    apiKey: "AIzaSyDgjJFKGBA2MBv5PvmyM4RSdAp5nqWe7eI",
    authDomain: "guma-app.firebaseapp.com",
    databaseURL: "https://guma-app.firebaseio.com",
    projectId: "guma-app",
    storageBucket: "guma-app.appspot.com",
    messagingSenderId: "755727406150",
    enableLogging: true
};
firebase.initializeApp(config);
var database = firebase.database();

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    if(mainView.activePage.name == 'index'){
        mainView.router.loadPage('drivers.html');
    }
});

$$(document).on('page:init', function(e){
    var page = e.detail.page;

    if(page.name == 'drivers'){
        console.log("dirvers!");
    }
    
});

myApp.onPageInit('drivers', function(page){
    var drivers = [];
    var driverList = myApp.virtualList('#driversList', {
        items: drivers,
        template: '<a href="driver.html" data-context=\'{"name": "{{name}}", "id": {{id}}}\' class="item-content item-link">'+
                    '<div class="item-inner">'+
                        '<div class="item-title">{{name}}</div>'+
                    '</div>'+
                   '</a>',
        searchAll: function(query, items){
            var foundItems = [];
            for (var i = 0; i < items.length; i++){
                if(items[i].name.indexOf(query.trim()) >= 0) foundItems.push(i);
            }
            return foundItems;
        }
    });

    var searchbar = myApp.searchbar('.searchbar', {
        searchList: '.list-block-search',
        searchIn: '.item-title'
    })

    database.ref('drivers/').once('value', function(snapshot){
        var count = 0;

        $$.each(snapshot.val(), function(){
            var name = snapshot.val()[count].name;
            driverList.appendItem({
                name: name,
                id: count
            });
            count ++;
        });
    });
});

myApp.onPageInit('driver', function(page){
    var stops = myApp.messages('.messages', {
        autoLayout: true
    });

    var count = 0;
    database.ref('stops/').on('value', function(snapshot){
        if(snapshot.val().length > 0){
            var date = "";
            var index = 0;
            var newDate = false;

            $$.each(snapshot.val(), function(){
                // Add as message
                count ++;
                
                if(snapshot.val()[index].driverId == page.context.id){
                    // Calculate day
                    if(snapshot.val()[index].date != date){
                        date = snapshot.val()[index].date;
                        stops.addMessage({
                            text: "Address: " + snapshot.val()[index].address + 
                                    "<br>Size: " + snapshot.val()[index].size + 
                                    "<br>Action: " + snapshot.val()[index].action,
                            date: date,
                            day: date,
                            time: snapshot.val()[index].time
                        })
                    } else {
                        stops.addMessage({
                            text: "Address: " + snapshot.val()[index].address + 
                                    "<br>Size: " + snapshot.val()[index].size + 
                                    "<br>Action: " + snapshot.val()[index].action,
                            date: date,
                            time: snapshot.val()[index].time
                        })
                    }
   
                }

                index ++;
            });

        }
    });

    $('.messages').click(function(){
        console.log('Click');

        var clickedLink = this;
        var popoverHtml = '<div class="popover">'+
                            '<div class="popover-inner">'+
                              '<div class="list-block">'+
                                '<ul>'+
                                  '<li><a href="#" class="item-link list-button">Delete</li>'+
                                '</ul>'+
                              '</div>'+
                            '</div>'+
                          '</div>';
        myApp.popover(popoverHtml, clickedLink);
    })

    $('.messagebar .buttons-row .button').click(function(){
        $('.messagebar .buttons-row .button').removeClass('active');
        $(this).addClass('active');
    });

    $('#add').click(function(){        
        // Get values of address, size and action
        var address = $('#address').val();
        var size = $('#size .button.active').text();
        var action = $('#action select').val();

        // Show alert if not valid
        var error = false;
        if(address.length <= 0){
            myApp.alert('Please enter the address', 'Address');
            error = true;
        }

        // Save as stop
        if(!error){
            var driver = page.context.id;
            var datetime = new Date();
            console.log(date);
            var date = (datetime.getMonth() + 1)+"/"+datetime.getDate ()+"/"+datetime.getFullYear();
            var time = datetime.getHours()+":"+datetime.getMinutes()+":"+datetime.getSeconds();
            database.ref('stops/' + count).set({
                address: address,
                size: size,
                action: action,
                driverId: driver,
                status: 'pending',
                date: date,
                time: time
            });
        }
    })    
});


