//Creamos una instancia de socket.io del lado del cliente ahora: 
const socket = io();

//Creamos una variable para guardar el usuario: 
let user;
const chatBox = document.getElementById("chatBox");

Swal.fire({
    title: "Identificate",
    input: "text",
    text: "Ingresa un usuario para identificarte en el chat",
    inputValidator: (value) => {
        return !value && "Necesitas escribir un nombre para continuar"
    },
    allowOutsideClick: false,
}).then(result => {
    user = result.value;
})


chatBox.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        if (chatBox.value.trim().length > 0) {
            //trim nos permite sacar los espacios en blanco del principio y del final de un string. 
            //Si el mensaje tiene más de 0 caracteres, lo enviamos al servidor. 
            socket.emit("message", { user: user, message: chatBox.value });
            chatBox.value = "";
        }
    }
})

//Listener de Mensajes: 

socket.on("messagesLogs", data => {
    let log = document.getElementById("messagesLogs");
    let messages = "";

    data.forEach((message, ) => {
        messages += `
                    <div class="message-container">
                        <div class="user1-message user-message">
                            <strong>${message.user}</strong>: ${message.message}
                        </div>
                    </div>
                `;
    });

    log.innerHTML = messages;
});