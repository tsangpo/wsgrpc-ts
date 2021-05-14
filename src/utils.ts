export function lcFirst(name: string) {
  return name[0].toLowerCase() + name.substr(1);
}
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

export interface IStream<T = any> {
  abort(reason: any): void;
  read(onMessage: (o: T) => void): Promise<void>;
  readToItorator(): AsyncIterableIterator<T>;
}

export class Stream<T = any> implements IStream {
  private _readers: { future: Future<void>; onMessage: (o: T) => void }[] = [];
  private _closed = false;
  private _cache: T[] = [];
  private _error: any;

  constructor(private _onabort?: (reason: any) => void) {}

  // sender

  write(o: T) {
    if (this._readers.length == 0) {
      this._cache.push(o);
      console.log("cache stream input");
      return;
    }
    this._readers.forEach((r) => {
      r.onMessage(o);
    });
  }

  error(e: any) {
    this._closed = true;
    if (this._readers.length == 0) {
      this._error = e;
      return;
    }
    this._readers.forEach((r) => {
      r.future.reject(e);
    });
    this._readers = [];
  }

  end() {
    this._closed = true;
    this._readers.forEach((r) => {
      r.future.resolve();
    });
    this._readers = [];
  }

  get closed() {
    return this._closed;
  }

  // receiver

  abort(reason: any) {
    this._closed = true;
    this._onabort && this._onabort(reason);
    this._readers.forEach((r) => {
      r.future.resolve();
    });
    this._readers = [];
  }

  read(onMessage: (o: T) => void): Promise<void> {
    // pull from cache
    while (this._cache.length > 0) {
      onMessage(this._cache.shift()!);
    }
    if (this._closed) {
      if (this._error) {
        return Promise.reject(this._error);
      }
      return Promise.resolve();
    }

    const future = new Future();
    const reader = { future, onMessage };
    this._readers.push(reader);
    return future.promise;
  }

  async *readToItorator(): AsyncIterableIterator<T> {
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

  async writeFromIterator(it: () => AsyncGenerator<T>) {
    try {
      for await (const o of it()) {
        if (this._closed) {
          return; //aborted
        }
        this.write(o);
      }
      this.end();
    } catch (e) {
      this.error(e);
    }
  }
}

export class StreamDelegate {
  private stream?: Stream;
  private abortReason: any;

  bind(stream: Stream) {
    this.stream = stream;
    if (this.abortReason) {
      this.stream.abort(this.abortReason);
    }
  }

  abort(reason: any) {
    this.abortReason = reason;
    if (this.stream) {
      this.stream.abort(this.abortReason);
    }
  }

  get closed(): boolean {
    return this.abortReason || this.stream?.closed;
  }
}
