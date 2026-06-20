let ioInstance = null;

const setIo = (io) => {
  ioInstance = io;
};

const getIo = () => ioInstance;

const emitPlantEvent = (event, payload) => {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
};

const emitToDashboard = (event, payload) => {
  if (ioInstance) {
    ioInstance.to('dashboard').emit(event, payload);
  }
};

module.exports = { setIo, getIo, emitPlantEvent, emitToDashboard };
