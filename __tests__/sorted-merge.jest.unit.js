const LogSource = require("../lib/log-source");
const asyncSortedMerge = require('../solution/async-sorted-merge');
const syncSortedMerge = require('../solution/sync-sorted-merge');

function makeInstrumentedSources(count) {
    const sources = [];
    for (let i = 0; i < count; i++) {
        sources.push(new InstrumentedSource());
    }
    return sources;
}

function getInstrumentedPrinter() {
    let lastTimestamp = Number.NEGATIVE_INFINITY;
    let count = 0;
    return {
        print: (msg) => {
            count += 1;
            const timestamp = msg.date.getTime();
            expect(timestamp).toBeGreaterThanOrEqual(lastTimestamp);
        }, getCount: () => {
            return count;
        }
    }
}

class InstrumentedSource extends LogSource {
    constructor() {
        super();
        this.count = 0;
    }

    pop() {
        const val = super.pop();
        if (val) {
            this.count += 1;
        }
        return val;
    }

    async popAsync() {
        const val = await super.popAsync();
        if (val) {
            this.count += 1;
        }
        return val;
    }

    getCountGenerated() {
        return this.count;
    }
}

describe("Sorted Merge behavior", () => {
    it("Prints every synchronous message available, in the correct order.", () => {
        const sources = makeInstrumentedSources(10);
        const printer = getInstrumentedPrinter();
        syncSortedMerge(sources, printer); // The printer handles asserting for order

        let totalCounted = 0;
        for (const s of sources) {
            expect(s.pop()).toBeFalsy(); // Make sure it's exhausted
            totalCounted += s.getCountGenerated(); // Add its messages to the total
        }
        expect(totalCounted).toEqual(printer.getCount())
        console.debug(`Successfully printed ${printer.getCount()} synchronous values.`);
    })

    it("Prints every asynchronous message available, in the correct order.", async () => {
        const sources = makeInstrumentedSources(10);
        const printer = getInstrumentedPrinter();
        await asyncSortedMerge(sources, printer); // The printer handles asserting for order

        let totalCounted = 0;
        for (const s of sources) {
            expect(await s.popAsync()).toBeFalsy(); // Make sure it's exhausted
            totalCounted += s.getCountGenerated(); // Add its messages to the total
        }
        expect(totalCounted).toEqual(printer.getCount())
        console.debug(`Successfully printed ${printer.getCount()} asynchronous values.`);
    }, 30 * 1000 /* extra timeout for this test */)
})