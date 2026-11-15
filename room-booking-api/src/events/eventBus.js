const { EventEmitter } = require("node:events");

function createEventBus({ logger = console } = {}) {
  const emitter = new EventEmitter();

  function on(eventType, listener) {
    emitter.on(eventType, (payload) => {
      Promise.resolve()
        .then(() => listener(payload))
        .catch((error) => {
          logger.error(`[eventBus] listener failed for ${eventType}:`, error);
        });
    });
  }

  function publish(eventType, payload) {
    emitter.emit(eventType, payload);
  }

  return {
    on,
    publish,
  };
}

module.exports = {
  createEventBus,
};
