document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    let ipAddress='';
    


    socket.on('ipAddress', function (data) {
        console.log('IP Address:', data.ip);
        ipAddress=data.ip;
    });
    
       document.getElementById('show-ip').addEventListener('click', function () {
        document.getElementById('ip-display').textContent = 'IP Address: ' + ipAddress;
    });

   
});

