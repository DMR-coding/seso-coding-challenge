// A fibonacci heap provides best-case runtimes for priority queue implementation-- O(log n) deletion/extraction
// and all other operations in constant time. This implementation was chosen for its extensive testing and MIT license.
const Heap = require('@tyriar/fibonacci-heap').FibonacciHeap;


function createQueue() {
    return new Heap();
}

function enqueue(queue, msg, source) {
  if(msg) {
      return queue.insert(msg.date, {source: source, ...msg})?.value;
  }
}

function dequeue(queue) {
    return queue.extractMinimum()?.value;
}

module.exports = {createQueue, enqueue, dequeue}