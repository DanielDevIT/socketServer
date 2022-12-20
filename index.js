import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "*",
  },
});

let onlineUsers = [{ username: "init", socketId: "init" }];
const addNewUser = (username, socketId) => {
  if (!onlineUsers.some((user) => user.username === username)) {
    onlineUsers.push({ username, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });
  // Should fire when users click on the action buttons on the singleTicket page
  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);
    if (typeof receiver !== "undefined") {
      io.to(receiver.socketId).emit("getNotification", {
        senderName,
        type,
      });
    } else {
      setTimeout(function () {
        //Do the same function with a delay, otherwise the user won't recieve a notification :((
        socket.on("sendNotification", ({ senderName, receiverName, type }) => {
          const receiver = getUser(receiverName);
          if (typeof receiver !== "undefined") {
            io.to(receiver.socketId).emit("getNotification", {
              senderName,
              type,
            });
          } else {
            console.log("reciever is not defined");
          }
        });
      }, 5000);
    }
  });

  //Useless for now
  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    io.to(receiver.socketId).emit("getText", {
      senderName,
      text,
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen(5000);
