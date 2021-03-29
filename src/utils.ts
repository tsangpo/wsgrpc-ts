//

export class Future<T = any> {
  promise: Promise<T>;
  result?: T;
  error: any;
  private _resovle?: (value: T | PromiseLike<T>) => void;
  private _reject?: (reason?: any) => void;
  private _resolved = false;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resovle = resolve;
      this._reject = reject;
    });
  }
  resolve(result: T) {
    this._resolved = true;
    this.result = result;
    this._resovle!(result);
  }
  reject(error: any) {
    this._resolved = true;
    this.error = error;
    this._reject!(error);
  }
  get resolved() {
    return this._resolved;
  }
}

export class Stream<T = any> {
  private readers: { future: Future<any>; onMessage: (o: T) => void }[] = [];
  private _closed = false;

  constructor(private onabort?: (reason: any) => void) {}

  // sender

  write(o: T) {
    this.readers.forEach((r) => {
      r.onMessage(o);
    });
  }

  error(e: any) {
    this._closed = true;
    this.readers.forEach((r) => {
      r.future.reject(e);
    });
    this.readers = [];
  }

  end() {
    this._closed = true;
    this.readers.forEach((r) => {
      r.future.resolve(null);
    });
    this.readers = [];
  }

  get closed() {
    return this._closed;
  }

  // receiver

  abort(reason: any) {
    this.onabort && this.onabort(reason);
    this.readers.forEach((r) => {
      // r.future.reject(new Error("aborted"));
      r.future.resolve(null);
    });
    this.readers = [];
  }

  read(onMessage: (o: T) => void): Promise<unknown> {
    const future = new Future();
    const reader = { future, onMessage };
    this.readers.push(reader);
    return future.promise;
  }

  async *readItorator(): AsyncIterableIterator<T> {
    const queue: T[] = [];
    let future = new Future<boolean>();
    this.read((o) => {
      queue.push(o);
      future.resolve(false);
      future = new Future();
    })
      .then(() => future.resolve(true))
      .catch((e) => future.reject(e));
    while (true) {
      const o = queue.shift();
      if (o) {
        yield o;
        continue;
      }
      if (await future.promise) {
        return;
      }
    }
  }
}
