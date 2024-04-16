"use strict";
const {createQueue, enqueue, dequeue} = require('./chronological-queue');

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  const logQueue = createQueue();

  // To start off, prime the pump by getting the first message from each source and pushing
  // them all into the priority queue.
  for (const source of logSources) {
    enqueue(logQueue, source.pop(), source);
  }

  // Now we simply repeat this operation until the priority queue is drained, meaning all sources are drained:
  // * Pop the min (oldest) message from the queue
  // * Print it
  // * Pop the next message of the source it came from and enqueue it (if it exists).
  let nextMessage = dequeue(logQueue);
  while (nextMessage) {
    const {source, ...message} = nextMessage;
    printer.print(message);
    enqueue(logQueue, source.pop(), source); // O(1)
    nextMessage = dequeue(logQueue);
  }
};
