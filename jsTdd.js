(function () {
	"use strict";

	/* -- window.console substitute -- */
	if (!window.console) {
		window.console = {
			log : function () {
				var consoleDiv = document.createElement("div"),
					str = "",
					args = arguments,
					i,
					l = args.length;

				for (i = 0; i < l; i += 1) {
					str += args[i];
				}

				consoleDiv.innerHTML = str;

				document.body.appendChild(consoleDiv);
			}
		};
	}
	/* -- /window.console substitute -- */

	/* -- tests -- */

	window.JsTdd = function (testName, tests) {
		this.testCount = 0;
		this.tests = {};
		this.testName = testName;
		this.addTests(tests);
	};

	window.JsTdd.prototype.addTests = function (tests) {
		var k;

		for (k in tests) {
			if (tests.hasOwnProperty(k) && typeof tests[k] === "function") {
				this.tests[k] = tests[k];
			}
		}
	};

	window.JsTdd.prototype.assertTrue = function (condition) {
		var args = arguments,
			i,
			l,
			okCount = 0,
			ret;

		if (args.length > 1) {
			l = args.length;
			for (i = 0; i < l; i += 1) {
				if (args[i]) {
					okCount += 1;
				}
			}
			ret = (okCount === args.length);
		} else {
			ret = condition ? true : false;
		}

		if (!ret && args.length > 1) {
			console.log(okCount + " of " + args.length + " tests passed");	
		}

		return ret;
	};

	window.JsTdd.prototype.assertEquals = function (condition, constant) {
		if (condition === constant) {
			return true;
		}
		console.log("AssertEquals Error: ", condition, "!==", constant);
		return false;
	};

	window.JsTdd.prototype.assertType = function (whatever, type) {
		return this.assertTrue(typeof whatever === type);
	};

	window.JsTdd.prototype.events = {
		trigger : function (event, element) {
			if (document.createEvent) { // DOM Level 2 standard
				event = document.createEvent("MouseEvents");
				event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

				element.dispatchEvent(event);

			} else if (element.fireEvent) { // IE
				element.fireEvent("on" + event);
			}
		}
	};

	window.JsTdd.prototype.doTests = function (specificTestName) {
		var that = this,
			k,
			fail,
			test,
			tests = this.tests;
					
		if (!specificTestName || specificTestName === this.testName) {
			
			for (k in tests) {
				if (tests.hasOwnProperty(k) && typeof tests[k] === "function") {
					test = tests[k].apply(tests[k]);
					fail = (!test);

						this.testCount += 1;

						if (fail) {
							throw new Error(this.testCount + ": [" + this.testName + "] " + k + " : " + test);
						}
				}
			}

			setTimeout(function () {
				console.log(that.testCount + " tests passed for '" + that.testName + "'");
			}, 0);
		}
	};

	window.JsTdd.prototype.runTests = function () {
		var runTests = (/[?&(amp;)?]runTests=1/).test(document.location.search),
			runSpecificTest = document.location.search.toString().match(/[?&(amp;)?]runTests=[a-zA-Z]+/),
			specificTestName = runSpecificTest ? runSpecificTest.join().replace(/^[?&(amp;)?]runTests=/, "") : "";

		if (specificTestName) {
			this.doTests(specificTestName);	
		} else if (runTests) {
			this.doTests();
		}
	};

	/* -- /tests -- */

}());