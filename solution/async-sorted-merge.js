"use strict";
const {createQueue, enqueue, dequeue} = require("./chronological-queue");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = async (logSources, printer) => {
    const logQueue = createQueue();
    // popAsync can potentially be quite latent. To speed the overall
    // sorted-merge operation we tee up the *next* pop for each source before we're ready for it.

    // We could go even faster with a managed buffer / request pool but the algorithm would get significantly
    // more complex, so this seems like the best balance for this quick exercise.
    const nextPops = new Map()

    // To start off, prime the pump by getting the first message from each source and pushing
    // them all into the priority queue.
    const promises = logSources.map((source) => {
        return source.popAsync().then((msg) => {
            enqueue(logQueue, msg, source);
            if(msg){
                nextPops.set(source, source.popAsync());
            }
        });
    });
    await Promise.allSettled(promises);

    // Now we simply repeat this operation until the priority queue is drained, meaning all sources are drained:
    // * Pop the min (oldest) message from the queue
    // * Print it
    // * Pop the next message of the source it came from and enqueue it (if it exists).
    let nextMessage = dequeue(logQueue);
    while (nextMessage) { // O(n) where n is total message count
        const {source, ...message} = nextMessage;
        printer.print(message);

        if (nextPops.get(source)) {
            const nextMessageFromSource = await nextPops.get(source);
            if(nextMessageFromSource) {
                enqueue(logQueue, nextMessageFromSource, source);
                nextPops.set(source, source.popAsync())
            }
        }
        nextMessage = dequeue(logQueue); // O(log m) where m is number of queues
    }
};
