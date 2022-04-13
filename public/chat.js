$(function () {
    var socket = io.connect("http://localhost:3000");
    var message = $("#message");
    var send_message = $("#send_message");
    var chatroom = $("#chatroom");
    var feedback = $("#feedback");
    var send_login = $("#send_login");
    var login = $("#login");
    var change_list_username = $("#change_list_username");
    var message_privat = $("#message_privat");
    var send_message_privat = $("#send_message_privat");
    var nameUser = $("#nameUser");
    var send_join_room = $("#send_join_room");
    var join_room = $("#join_room");
    var user_write = $("#user_write");
    var name = ''
    var arr=[]

    socket.on("user_list", (data) => {
        change_list_username.html("")
        $('#userList').html("")
        console.log(data);
        $.each(data.list, function (index, value) {
            console.log(value);
            $('#change_list_username')
                .append($("<option></option>")
                    .attr("value", index)
                    .text(value));
        });
        arr=[...data.list]
    });
    send_login.click(() => {
        socket.emit("user_connect", {
            id: login.val()
        });
        $('#input_zon').html('')
    });

    user_write.click(() => {
        console.log(change_list_username.val());
        nameUser.html('')
        if(arr[change_list_username.val()]===socket.id){
            alert('Error')
        }
        else {
            nameUser.append($("<div></div>").text(`We write to ${arr[change_list_username.val()]}`))
            name = change_list_username.val()
        }

    });

    send_message_privat.click(() => {
        socket.emit("create_private_message_server", {
            userId: name,
            message:message_privat.val(),
        });
        message_privat.val(' ')
    });

/*
    change_list_username.on('change', function (e) {
        nameUser.html('')
        nameUser.append($("<div></div>").text(`We write to ${arr[e.target.value]}`))
        name = e.target.value
    });
*/

    socket.on("create_private_message_client", data => {
        feedback.html("");
        chatroom.append($("<div></div>").text(`${data.name}:${data.message}`))
    });


    message_privat.bind("keypress", () => {
        socket.emit("typing_privat_server",{
            userId:name
        });
    });

    socket.on("typing_privat_client", data => {
        feedback.html(
            "<p><i>" + data.username + " prints..." + "</i></p>"
        );
    });

    //  GROUP CHAT INMOST
    send_join_room.click(()=>{
        socket.emit("join_room", {
            room: 'Inmost'
        });
    })

    send_message.click(() => {
        socket.emit("create_message_server", {
            room:'Inmost',
            message: message.val()
        });
        message.val(' ')
    });
    socket.on("create_message_client", data => {
        feedback.html("");
        chatroom.append($("<div></div>").text(`${data.name}:${data.message}`))
    });

    message.bind("keypress", () => {
        socket.emit("typing_server",{
            room:'Inmost'
        });
    });

    socket.on("typing_client", data => {
        feedback.html(
            "<p><i>" + data.username + " prints..." + "</i></p>"
        );
    });
});
