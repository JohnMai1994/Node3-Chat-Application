const socket = io();

// Elements
    //Send Button
const $messageFrom = document.querySelector("#message-form");
const $messageFormInput = $messageFrom.querySelector("input");
const $messageFormButton = $messageFrom.querySelector("button");
    //Location Button
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
    //Like Button

const $clickLikeButton = document.querySelector("#like");



// server (emit) -> client (receive) --acknowledgement --> server

// client (emit) -> server (receive) --acknowledgement --> client

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Option
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild


    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = containerHeight;
    }

};



socket.on("message", (message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("YYYY-MM-DD hh:mm a")
    });
    // afterbegin, afterend, beforebegin, beforeend
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("locationMessage", (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("YYYY-MM-DD hh:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});



socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;

});


// Send Message Button Submit
$messageFrom.addEventListener("submit", (e)=> {

    e.preventDefault();

    $messageFormButton.setAttribute("disabled", "disabled");
    // Disable Button
    const message = e.target.elements.message.value;
    socket.emit("sendMessage", message, (error)=> {
        $messageFormButton.removeAttribute("disabled");
        // enable Button
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error) {
            return console.log(error)
        }
        console.log("Message delivered!")
    });
});

// Send Location Button Click
$sendLocationButton.addEventListener('click', ()=> {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=> {
            $sendLocationButton.removeAttribute("disabled");
            console.log("Location Shared!")
        });
    })
});

// clickLike Button
function clickLike() {
    socket.emit("sendLike", "", (error) => {
        if (error) {
            return console.log(error)
        }
        console.log("Message delivered!")
    })
}



socket.emit("join", {username, room}, (error)=> {
    if (error) {
        alert(error);
        location.href = "/"
    }
});



// socket.on("countUpdated", (countNo)=>{
//     console.log("the count hsa been updated!", countNo);
// });
//
// document.querySelector('#increment').addEventListener('click', ()=> {
//     console.log("Clicked");
//     socket.emit("increment");
// })
