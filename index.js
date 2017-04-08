if(typeof require !== 'undefined') {
	if(typeof __webpack_modules__ !== 'undefined'){
		require('./dist/qmxtr.bundle.css');
	}

	const Qmxtr = require('./dist/qmxtr.bundle.js');

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = Qmxtr;
	} else {
		window.Qmxtr = Qmxtr;
	}
} else {
	console.error('Require doesn\'t exists!');
}
