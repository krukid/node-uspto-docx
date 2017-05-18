/**
 * The following composable decorators provide a way to extract common pre- and
 * post- invocation logic from wrapped functions.
 *
 * E.g.:
 *
 *     const trackedTwoPlusTwo = compose(logDecorator, statsDecorator)(twoPlusTwo);
 *
 */

import { slackSend } from './slack';

/**
 *
 */

export function *slackDecorator(args, context) {
  // slackSend(context.message);
  yield;
  slackSend(context.message);
}

export function *logDecorator(args, context) {
  // context.message = `[INFO] starting "${context.name}"`;
  // console.log(context.message);
  const [error, result] = yield;
  if (error) {
    context.message = `[FAIL] failed "${context.name}": ${error.message}`;
  } else {
    context.message = `[INFO] completed "${context.name}"`;
  }
  context.message += ` (${context.timeEnd}ms)`;
  console.log(context.message);
}

export function *statsDecorator(args, context) {
  const timeStart = new Date();
  yield;
  context.timeEnd = new Date() - timeStart;
}

/**
 *
 */

function createContext(fn, args, initialContext) {
  const context = { ...initialContext };
  if (context.name) {
    context.name = context.name.replace(/%(\d+)/g,
      (match, group, index, str) => String(args[+group]));
  } else {
    context.name = fn.name;
  }
  return context;
}

export function compose(...decors) {
  return (fn, initialContext={}) => async (...args) => {
    const context = createContext(fn, args, initialContext);
    const it = decors.map(decor => {
      const inst = decor(args, context);
      inst.next();
      return inst;
    });
    let e, r;
    try {
      r = await fn(...args);
    } catch (error) {
      e = error;
      throw error;
    } finally {
      it.forEach(inst => {
        inst.next([e, r]);
      });
    }
    return r;
  };
}

/**
 *
 */

export function tracked(fn, initialContext) {
  return compose(
    statsDecorator,
    logDecorator,
    slackDecorator,
  )(fn, initialContext);
}
