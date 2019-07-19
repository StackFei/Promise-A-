const PENDING = "PENDING";
const SUCCESS = "FULFIILLED";
const FAIl = "REJECTED"
//返还的那个新的promise x 是then方法中的返回值
function resolvePromise(promise2, x, resolve, reject) {
	if (promise2 === x) {
		return reject(new TypeError(`类型错误`))
	}
	let then, called;
	if (typeof x == "function" || (typeof x === "object" && x !== null)) {
		try {
			then = x.then //取then可能会出错 可能是getter
			if (typeof then === "function") {
				then.call(x, y => {
					if (called) return;
					called = true;
					resolvePromise(promise2, y, resolve, reject)
				}, err => {
					if (called) return;
					called = true;
					reject(err)
				}) //不要使用x.then 不然会重复取值
			} else { //then:()=>{} 
				resolve(x)
			}
		} catch (e) {
			if (called)return;
			called = true;
			reject(e)
		}
	} else {// x 不为函数 promise对像	
		resolve(x);
	}
}
class Promise {
	constructor(execitor) {
		this.status = PENDING;
		this.value = undefined;
		this.reason = undefined;
		this.onResolveCallback = [];
		this.onRejectCallback = [];
		const resolve = (value) => {
			if (value instanceof Promise) {//resolve的结果可能是promise
				value.then(resolve, reject)//将执行后的结果在传递给resolve，reject
			}
			if (this.status === PENDING) {
				this.value = value;
				this.status = SUCCESS;
				this.onResolveCallback.forEach(fn => fn())
			}
		}
		const reject = (reason) => {
			if (this.status === PENDING) {
				this.reason = reason;
				this.status = FAIL
				this.onRejectCallback.forEach(fn => fn())
			}
		}
		try {
			execitor(resolve, reject);
		} catch (e) {
			reject(e)
		}
	}//同一个promise then 多次
	then(onFulfilled, onRejected) {
		let promise2;
		promise2 = new Promise((resolve, reject) => {
			if (this.status === SUCCESS) {
				setTimeout(() => {
					try {
						let x = onFulfilled(this.value)
						resolvePromise(promise2, x, resolve, reject)
					} catch (e) {
						reject(e)
					}
				})
			}
			if (this.status === FAIL) {
				setTimeout(() => {
					try {
						let x = onRejected(this.value)
						resolvePromise(promise2, x, resolve, reject)
					} catch (e) {
						reject(e)
					}
				})
			}
			if (this.status === PENDING) {
				this.onResolveCallback.push(() => {
					setTimeout(() => {
						try {
							let x = onFulfilled(this.value)
							resolvePromise(promise2, x, resolve, reject)
						} catch (e) {
							reject(e)
						}
					})
				});
				setTimeout(() => {
					try {
						let x = onRejected(this.value)
						resolvePromise(promise2, x, resolve, reject)
					} catch (e) {
						reject(e)
					}
				})
			}

		})
		return promise2;
	}
}
//测试Peomise A+ 规范 promise-aplus-tests
Promise.defer = Promise.deffered = function () {
	let dfd = {};
	dfd.promise = new Promise((resolve, reject) => {
		def.resolve = resolve;
		dfd.reject = reject;
	});
	return dfd;
}

// var a = {n: 1};
// var b = a;
// a.x = a ;
// console.log(a) 	

// var name = 'Air';
// (function() {
//     if (typeof name == 'undefined') {
//         var name = 'Pro';
//         console.log('MacBook ' + name);
//     } else {
//         console.log('Window ' + name);
//     }
// })();

// let oldUrl = "https://baidu.com/?about&search=&a=b";
// let oldUrl = "https://baidu.com/?about=new&search=one&a=b";
// let oldUrl = "https://baidu.com/?about=new&search=one,two&a=b";
//coding new URLSearchParams
// [] || [one] || [one, two]

// setTimeout(()=>{console.info("宏任务 is running")},1000)

// var length = 10;
// function fn () {
	// console.log(this.length);
// }

// var obj = {
//   length: 5,
//   method: function (fn) {
    // fn(); // 执行的时候，没有谁.fu()，所以 fn() 里面的 this 指向 window
    // arguments[0](); //length 2
//   }
// };
// 
// obj.method(fn, 1);