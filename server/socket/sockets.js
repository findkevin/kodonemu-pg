module.exports = function (io) {
  let clients = 0;

  io.on('connection', socket => {
    clients++
    console.log(`A socket connection to the server has been made: ${socket.id}`)
    console.log(`There are ${clients} players in the server.`)

    socket.on('joinRoom', (gameName) => {
        console.log('JOIN ROOM', gameName)
        // socket.join(gameName);
        // io.emit('joinRoom', gameName)
        socket.emit('joinRoom', gameName)
    })

    socket.on('updateGame', (data) => {
      console.log('update game:', data.payload);
      socket.emit('updateGame', data)
      io.emit('updateGame', data.payload)
    })

    socket.on('disconnect', () => {
      clients--
      console.log(`Connection ${socket.id} has left the building`)
      console.log(`There are ${clients} players in the server.`)
    });
  })

}
