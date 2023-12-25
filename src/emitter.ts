class Emitter {
  private events: { [event: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(listener);

    console.log(`Event added: ${event}`);
  }

  off(event: string, listener: Function) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((l) => l !== listener);

    console.log(`Event removed: ${event}`);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;

    this.events[event].forEach((listener) => listener(...args));

    console.log(`Event emitted: ${event}`);
  }
}

export default new Emitter();
