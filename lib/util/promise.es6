export function promiseChain(ary, promisify, initialValue=null) {
  return ary.reduce((promise, item) => promise.then(() => promisify(item)),
    Promise.resolve(initialValue));
}
