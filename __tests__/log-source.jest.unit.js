const LogSource = require("../lib/log-source");

describe("Log Source Behaviors", () => {
  test("It should synchronously drain a log source", () => {
    const source = new LogSource();
    let entry = source.pop();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    entry = source.pop();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    source.last.date = new Date();
    entry = source.pop();
    expect(entry).toBeFalsy();
  });

  test("It should asynchronously drain a log source", async () => {
    const source = new LogSource();
    let entry = await source.popAsync();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    entry = await source.popAsync();
    expect(new Date() > entry.date).toBeTruthy();
    expect(entry.msg).toBeTruthy();
    source.last.date = new Date();
    entry = await source.popAsync();
    expect(entry).toBeFalsy();
  });

  test("It should produce synchronous logs in chronological order", () => {
    const source = new LogSource();
    let lastMessage = source.pop();
    let nextMessage;
    while (lastMessage) {
      nextMessage = source.pop();

      if(nextMessage) {
        expect(nextMessage.date.getTime()).toBeGreaterThanOrEqual(lastMessage.date.getTime());
      }

      lastMessage = nextMessage;

    }
  })

  test("It should produce asynchronous logs in chronological order", async () => {
    const source = new LogSource();
    let lastMessage = source.pop();
    let nextMessage;
    while (lastMessage) {
      nextMessage = await source.popAsync();

      if(nextMessage) {
        expect(nextMessage.date.getTime()).toBeGreaterThanOrEqual(lastMessage.date.getTime());
      }
      lastMessage = nextMessage;
    }
  })
});
