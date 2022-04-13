const express = require("express");
const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get('/', (req, res) => {
	res.render('index')
})
app.get('/group', (req, res) => {
    res.render('index-2')
})
server = app.listen("3000", () => console.log("Server is running..."));

const io = require("socket.io")(server);

let users = []

io.on('connection', (socket) => {
    console.log(`CONNECTION ${socket.id}`);

    socket.on('user_connect',(data)=>{
        console.log(data,`CON ${socket.id}`);
        users[data.id]=socket.id;
        console.log(users,'USER LIST');
        io.sockets.emit("user_list", {
            list:users
        });
    })
    socket.on("join_room", (data) => {
        console.log(users);
        socket.join(data.room);
    });

    socket.on("create_message_server", (data) => {
        console.log(socket.rooms);
        socket.broadcast.to(data.room).emit("create_message_client", {
            message:data.message,
            name: socket.id
        });
    });

    socket.on("create_private_message_server", (data) => {
        console.log(data,'create_private_message_server');
        io.sockets.to(users[data.userId]).emit("create_private_message_client",{
            message:data.message,
            name: socket.id
        })
    });

    socket.on("add_user_group", (data) => {
        socket.emit("add_user_group_client", {
            message:`Welcome to the group ${data.room}`
        });
        console.log(socket.rooms);
        socket.broadcast.to(data.room).emit("add_user_group_client_2", {
            message:`Joined the chat ${socket.id}`
        });
    });

    socket.on("remove_user_room)", (data) => {
        socket.leave(data.room);
    });

    socket.on('typing_server', (data) => {
        socket.broadcast.to(data.room).emit('typing_client', {username :socket.id })
    })

    socket.on('typing_privat_server', (data) => {
        io.sockets.to(users[data.userId]).emit('typing_privat_client', {username :socket.id })
    })

    socket.on("disconnect", () => {
        console.log(socket.id);
        let userIndex = users.indexOf(socket.id);
        users.splice(userIndex,userIndex);
        console.log(users,'USER WHEN DISCONNECT');
    });
})
