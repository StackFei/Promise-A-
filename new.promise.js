// function Promise(executor) {
// 	let _this = this;
// 	_this.status = 'pending';
// 	_this.value = null;
// 	_this.reason = null;
// 	_this.onResolvedCallBacks = [];
// 	_this.onRejectedCallBacks = [];
// 	function resolve(value) {
// 		if (_this.status === 'pending') {
// 			_this.value = value;
// 			_this.status = 'resolved';
// 			_this.onResolvedCallBacks.forEach(fn => fn())
// 		}
// 	}

// 	function reject(reason) {
// 		if (_this.status === 'pending') {
// 			_this.reason = reason;
// 			_this.status = 'rejected';
// 			_this.onRejectedCallBacks.forEach(fn => fn())
// 		}
// 	}
// 	try {
// 		executor(resolve, reject)
// 	} catch (e) {
// 		reject(e)
// 	}
// }

// // 解析返回值then的值的类型 promise/常量
// function resolvePromise(promise, x, resolve, reject) {
// 	// 循环引用
// 	if (promise === x) {
// 		return reject(new TypeError('循环引用'))
// 	}
// 	let called; // 避免使用其他的promise产生重复调用的情况
// 	// 引用类型
// 	if ((x !== null && typeof x === 'object') || typeof x === 'function') {
// 		// 可能是promise
// 		try {// 避免 Object.definedProperty(x,then,{getter(){throw err}})
// 			let then = x.then;
// 			if (typeof then === 'function') { // 只能判断到这了 也许是个空函数
// 				// resolve(r) // 避免resolve(new Promise) 递归调用 直到常量
// 				then.call(x, (r) => {
// 					if (called) return;
// 					called = true;
// 					resolvePromise(promise, r, resolve, reject)
// 				}, (e) => {
// 					if (called) return;
// 					called = true;
// 					reject(e)
// 				})
// 			} else { //普通对象
// 				resolve(x)
// 			}
// 		} catch (error) {
// 			if (called) return;
// 			called = true;
// 			reject(error)
// 		}
// 	} else {
// 		// 常量
// 		resolve(x)
// 	}
// }

// Promise.prototype.then = function (onFulfilled, onRejected) {
// 	// then().then().then() 实现穿透
// 	onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
// 	onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
// 	let _this = this;
// 	// 返回全新的Promise 保证有新的成功或者失败
// 	let promise = new Promise(function (resolve, reject) {
// 		if (_this.status === 'resolved') {
// 			// 避免promise还未实例化 取不到值
// 			setTimeout(() => {
// 				try {
// 					let x = onFulfilled(_this.value);
// 					resolvePromise(promise, x, resolve, reject)
// 					// resolve(x)
// 				} catch (e) {
// 					reject(e)
// 				}
// 			}, 0)
// 		}
// 		if (_this.status === 'rejected') {
// 			setTimeout(() => {
// 				try {
// 					let x = onRejected(_this.reason);
// 					resolvePromise(promise, x, resolve, reject)
// 					// resolve(x)
// 				} catch (e) {
// 					reject(e)
// 				}
// 			}, 0)
// 		}
// 		if (_this.status = 'pending') {
// 			// 订阅存在的异步情况
// 			_this.onResolvedCallBacks.push(function () {
// 				setTimeout(() => {
// 					try {
// 						let x = onFulfilled(_this.value);
// 						resolvePromise(promise, x, resolve, reject)
// 					} catch (e) {
// 						reject(e)
// 					}
// 				}, 0)
// 			})
// 			_this.onRejectedCallBacks.push(function () {
// 				setTimeout(() => {
// 					try {
// 						let x = onRejected(_this.reason);
// 						resolvePromise(promise, x, resolve, reject)
// 					} catch (e) {
// 						reject(e)
// 					}
// 				}, 0)
// 			})
// 		}
// 	})
// 	return promise;
// }

// // 实现 Promise 延迟对象 defer
// Promise.defer = Promise.deferred = function () {
// 	let dfd = {};
// 	dfd.promise = new Promise((resolve, reject) => {
// 		dfd.resolve = resolve;
// 		dfd.reject = reject;
// 	})
// 	return dfd;
// }


/******************************************************* */
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'
class Promise {
  constructor(executor) {
    this.value = undefined;
    this.reason = undefined;
    this.status = PENDING;
    this.onResolvedCallBacks = [];
    this.onRejectedCallBacks = [];
    const resolve = value => {
      // 避免resolve(new Promise)
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }
      if (this.status = PENDING) {
        this.value = value;
        this.status = FULFILLED;
        this.onResolvedCallBacks.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if (this.status = PENDING) {
        this.reason = reason;
        this.status = REJECTED;
        this.onRejectedCallBacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
    const promise = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })

      }
      if (this.status === PENDING) {
        this.onResolvedCallBacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        });
        this.onRejectedCallBacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        });
      }
    })
    return promise;
  }
  catch(onRejected) {
    return this.then(null, onRejected)
  }
  finally(callback) {
    return this.then((data) => {
      return Promise.resolve(callback()).then(() => data)
    }, (reason) => {
      return Promise.reject(callback()).then(() => { throw reason })
    })
  }
  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }
  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }
}

// 递归检测promise
const resolvePromise = (promise, x, resolve, reject) => {
  if (promise === x) {
    return reject(new TypeError('循环引用'))
  }
  if ((typeof x === 'object' && x !== null) || typeof x == 'function') {
    let called;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true
          resolvePromise(promise, y, resolve, reject)
        }, r => {
          if (called) return;
          called = true
          reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return;
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let arr = [];
    let index = 0;
    let processData = (i, v) => {
      arr[i] = data;
      if (index++ === promises.length) {
        resolve(arr);
      }
    }
    for (let i = 0; i < promises.length; i++) {
      let promise = promises[i];
      if (isPromise(promise)) {
        promise.then((data) => {
          processData(i, data)
        }, reject)
      } else {
        processData(i, promise)
      }
    }
  })
}

Promise.race = function (values) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < values.length; i++) {
      let current = values[i];
      if (isPromise(current)) {
        current.then(resolve, reject)
      } else {
        resolve(current)
      }
    }
  })
}

// 检验是否是Promise
const isPromise = value => {
  if ((value !== null && typeof value === 'object') || typeof value === 'function') {
    return typeof value.then === 'function'
  }
  return false
}

Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd;
}

module.exports = Promise;