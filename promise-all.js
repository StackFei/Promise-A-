function isPromise(value) {
	//判断是否是promise对像
	
}

Promise.all = function (values) {
	return new Promise((resolve, reject) => {
		let arr = [];
		let i = 0;
		let proessData = (key, value) => {
			arr[key] = value;
			if (++i === values.length) {
				resolve(arr)
			}
		}
		for (let i = 0; i < values.length; i++) {
			let current = values[i];
			if (isPromise(current)) {
				current.then(y => {
					proessData(i, y)
				}, reject)
			} else {
				proessData(i, current)
			}
		}
	})
}

Promise.race = function (valuse) {
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