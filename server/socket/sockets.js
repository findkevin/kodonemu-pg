// module.exports = function (io) {
//   let clients = 0;

//   io.on('connection', socket => {
//     clients++
//     console.log(`A socket connection to the server has been made: ${socket.id}`)
//     console.log(`There are ${clients} players in the server.`)

//     socket.on('joinRoom', (gameName) => {
//         socket.join(gameName);
//     })

//     socket.on('updateGame', (data) => {
//       console.log('update game:', data);
//       io.emit('emit-updateGame', data)
//       socket.emit('emit-updateGame', data)
//     })

//     socket.on('disconnect', () => {
//       clients--
//       console.log(`Connection ${socket.id} has left the building`)
//       console.log(`There are ${clients} players in the server.`)
//     });
//   })

// }
