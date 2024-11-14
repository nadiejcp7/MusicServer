pauseIcon = `
<svg width="29" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
        <g clip-path="url(#clip0_429_11098)">
            <path
                d="M5 7C5 5.89543 5.89543 5 7 5H8C9.10457 5 10 5.89543 10 7V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V7Z"
                stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"></path>
            <path
                d="M14 7C14 5.89543 14.8954 5 16 5H17C18.1046 5 19 5.89543 19 7V17C19 18.1046 18.1046 19 17 19H16C14.8954 19 14 18.1046 14 17V7Z"
                stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"></path>
        </g>
        <defs>
            <clipPath id="clip0_429_11098">
                <rect width="24" height="24" fill="white"></rect>
            </clipPath>
        </defs>
    </g>
</svg>
`;

playIcon = `
<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path
    d="M8.32137 25.586C7.9759 25.5853 7.63655 25.4948 7.33669 25.3232C6.66148 24.9406 6.24173 24.1978 6.24173 23.3915V7.07398C6.24173 6.26542 6.66148 5.52494 7.33669 5.14232C7.64369 4.96589 7.99244 4.87516 8.3465 4.87961C8.70056 4.88407 9.04692 4.98354 9.34938 5.16764L23.2952 13.5155C23.5859 13.6977 23.8255 13.9508 23.9916 14.251C24.1577 14.5511 24.2448 14.8886 24.2448 15.2316C24.2448 15.5747 24.1577 15.9121 23.9916 16.2123C23.8255 16.5125 23.5859 16.7655 23.2952 16.9478L9.34713 25.2979C9.0376 25.485 8.68307 25.5846 8.32137 25.586V25.586Z"
    fill="#E1E1E6"></path>
</svg>
`;

window.onload = function () {
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('open', function (event) {
        socket.send('name');
    });

    socket.addEventListener('message', function (event) {
        console.log(event.data);
        const myArray = event.data.split("_");
        document.getElementById('name').innerText = myArray[0];
        document.getElementById('artist').innerText = myArray[1];
        let svgContainer = document.getElementById('repro');
        if(myArray[2]=='False'){
            svgContainer.innerHTML = String(pauseIcon);
        }else{
            svgContainer.innerHTML = String(playIcon);
        } 
    });
};

function playMusic() {
    var texto = document.getElementById('link').value;
    if (!texto) {
        alert("Pero primero ponga un enlace o un nombre pues, no sea animal");
    } else {
        const socket = new WebSocket('ws://localhost:8080');

        // When the connection is open, send a message to the server
        socket.addEventListener('open', function (event) {
            socket.send(texto);
            alert("La cancion se reproducira en breve. Espere un tantito");
            let inputField = document.getElementById('link');
            inputField.value = "";
        });

        // Listen for messages from the server
        socket.addEventListener('message', function (event) {
            const myArray = event.data.split("_");
            document.getElementById('name').innerText = myArray[0];
            document.getElementById('artist').innerText = myArray[1];
            let svgContainer = document.getElementById('repro');
            svgContainer.innerHTML = String(pauseIcon);
        });

        // Handle errors
        socket.addEventListener('error', function (event) {
            console.error('WebSocket error:', event);
        });

        // Handle connection closure
        socket.addEventListener('close', function (event) {
            console.log('Disconnected from server');
        });
    }
}

function playPause() {
    const socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', function (event) {
        socket.send('PlayPause');
    });
    
    socket.addEventListener('message', function (event) {
        let svgContainer = document.getElementById('repro');
        if (event.data=='0'){
            svgContainer.innerHTML = String(pauseIcon);
        }else {
            svgContainer.innerHTML = String(playIcon);
        }
    });

}

function next() {
    const socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', function (event) {
        socket.send('Next');
    });

    // Listen for messages from the server
    socket.addEventListener('message', function (event) {
        const myArray = event.data.split("_");
        document.getElementById('name').innerText = myArray[0];
        document.getElementById('artist').innerText = myArray[1];
    });
}

function previous() {
    const socket = new WebSocket('ws://localhost:8080');

    socket.addEventListener('open', function (event) {
        socket.send('Previous');
    });

    // Listen for messages from the server
    socket.addEventListener('message', function (event) {
        const myArray = event.data.split("_");
        document.getElementById('name').innerText = myArray[0];
        document.getElementById('artist').innerText = myArray[1];
    });

}