/**
 * tallbag-from-obs
 * --------------
 *
 * Convert an observable (or subscribable) to a tallbag listenable source.
 *
 * `npm install tallbag-from-obs`
 *
 * Example:
 *
 * Convert an RxJS Observable:
 *
 *     const Rx = require('rxjs');
 *     const fromObs = require('tallbag-from-obs');
 *     const observe = require('callbag-observe');
 *
 *     const source = fromObs(Rx.Observable.interval(1000).take(4));
 *
 *     observe(x => console.log(x)(source); // 0
 *                                          // 1
 *                                          // 2
 *                                          // 3
 *
 * Convert anything that has the `.subscribe` method:
 *
 *     const fromObs = require('tallbag-from-obs');
 *     const observe = require('callbag-observe');
 *
 *     const subscribable = {
 *       subscribe: (observer) => {
 *         let i = 0;
 *         setInterval(() => observer.next(i++), 1000);
 *       }
 *     };
 *
 *     const source = fromObs(subscribable);
 *
 *     observe(x => console.log(x))(source); // 0
 *                                           // 1
 *                                           // 2
 *                                           // 3
 *                                           // ...
 */

const makeShadow = require('shadow-callbag').default;
const $$observable = require('symbol-observable').default;

const fromObs = observable => (start, sink) => {
  if (start !== 0) return;
  let dispose;
  const shadow = makeShadow('from-obs');
  function talkback(t) {
    if (t === 2 && dispose) {
      if (dispose.unsubscribe) dispose.unsubscribe();
      else dispose();
    }
  }
  sink(0, talkback, shadow);
  observable = observable[$$observable]
    ? observable[$$observable]()
    : observable;
  dispose = observable.subscribe({
    next: x => {
      shadow(1, x);
      sink(1, x);
    },
    error: e => sink(2, e),
    complete: () => sink(2),
  });
};

module.exports = fromObs;
