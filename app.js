const express = require("express");
const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
//ПРИВАТ
app.get('/', (req, res) => {
	res.render('index')
})
//ЧАТ
app.get('/group', (req, res) => {
    res.render('index-2')
})
server = app.listen("3000", () => console.log("Server is running..."));

const io = require("socket.io")(server);

let users = []

//ПІДКЛЮЧЕННЯ ДО СОКЕТУ НА СТОРОНІ СЕРВЕРУ
io.on('connection', (socket) => {
    console.log(`CONNECTION ${socket.id}`);
//ЗАПИСУЄМО ЮЗЕРА У МАСИВ
    socket.on('user_connect',(data)=>{
        console.log(data,`CON ${socket.id}`);
        users[data.id]=socket.id;
        console.log(users,'USER LIST');
        //ВИВОДИМО УСІХ ЮЗЕРІВ
        io.sockets.emit("user_list", {
            list:users
        });
    })
    //ПРИЄДНАННЯ ДО КІМНАТИ(У НАШОМУ ВИПАДКУ ДО ГРУПИ)
    socket.on("join_room", (data) => {
        console.log(users);
        socket.join(data.room);
    });
// ГРУПОВИЙ ЧАТ => ВІДПРАВЛЯЄМО ДАНІ ІЗ КЛІЄЕНТА НА СЕРВЕР (У НАШОМУ ВИПАДКУ МИ ВІДПРАВЛЯЄМО ПОВІДОМЛЕННЯ НА СЕРВЕР)
    socket.on("create_message_server", (data) => {
        console.log(socket.rooms);
        //ВІДДАЄМО ПОВІДОМЛЕННЯ НА СЛІЄЕНТ
        socket.broadcast.to(data.room).emit("create_message_client", {
            message:data.message,
            name: socket.id
        });
    });
    // ПОВІДОМЛЕННЯ ПЕВНІЙ ЛЮДИНІ  => ВІДПРАВЛЯЄМО ДАНІ ІЗ КЛІЄЕНТА НА СЕРВЕР (У НАШОМУ ВИПАДКУ МИ ВІДПРАВЛЯЄМО ПОВІДОМЛЕННЯ НА СЕРВЕР
    socket.on("create_private_message_server", (data) => {
        console.log(data,'create_private_message_server');
        //ВІДДАЄМО ПОВІДОМЛЕННЯ НА СЛІЄЕНТ
        io.sockets.to(users[data.userId]).emit("create_private_message_client",{
            message:data.message,
            name: socket.id
        })
    });

/*// -------------------------------------------

    socket.on("add_user_group", (data) => {
        socket.emit("add_user_group_client", {
            message:`Welcome to the group ${data.room}`
        });
        console.log(socket.rooms);
        socket.broadcast.to(data.room).emit("add_user_group_client_2", {
            message:`Joined the chat ${socket.id}`
        });
    });*/

//ЗА ДОПОМОГОЮ ЦЬОГО ЮЗЕРИ У ГРУПІ БАЧАТЬ ЯКА ЛЮДИНА ДРУКУЄ ПОВІДОМЛЕННЯ
    socket.on('typing_server', (data) => {
        socket.broadcast.to(data.room).emit('typing_client', {username :socket.id })
    })
//ЗА ДОПОМОГОЮ ЦЬОГО ЮЗЕР БАЧИТЬ ХТО ЙОМУ ПИШЕ ПОВІДОМЛЕННЯ
    socket.on('typing_privat_server', (data) => {
        io.sockets.to(users[data.userId]).emit('typing_privat_client', {username :socket.id })
    })
//ВИДАЛЕННЯ ЮЗЕРА ІЗ СПИСКУ
    socket.on("disconnect", () => {
        console.log(socket.id);
        let userIndex = users.indexOf(socket.id);
        users.splice(userIndex,userIndex);
        console.log(users,'USER WHEN DISCONNECT');
    });
})
