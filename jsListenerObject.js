(function (window) {
	"use strict";

	var tdd,
		tests,

		util,
		methods,
		ListenerObject;

	/* -- production code -- */

	/* -- util -- */
	util = {
        getMethods : function (addTo, getFrom) {
            var k;

            for (k in getFrom) {
                if (getFrom.hasOwnProperty(k) &&  typeof getFrom[k] === "function") {
                    addTo[k] = getFrom[k];
                }
            }
        },
		setUpListener : function (property, event) {
			if (!this.listeners) {
				this.listeners = {};
			}

			if (!this.listeners[property]) {
				this.listeners[property] = {};
			}

			if (!this.listeners[property][event]) {
				this.listeners[property][event] = [];
			}

			return this.listeners[property][event];
		},
		hasListeners : function (property) {
			var isset = null,
				set = null,
				change = null;

			if (this.listeners && this.listeners[property]) {
				isset = this.listeners[property].isset;
				set = this.listeners[property].set;
				change = this.listeners[property].change;
			}

			return (isset || set || change) ? true : false;
		},
		getEventHandlerArray : function (property, propertyIsChanged) {
			var eventHandlerArray = [],
				isset,
				set,
				change;

			if (util.hasListeners.call(this, property)) {
				isset = this.listeners[property].isset || [];
				set = this.listeners[property].set || [];
				change = this.listeners[property].change || [];

				eventHandlerArray = isset.concat(set);

				if (propertyIsChanged) {
					eventHandlerArray = eventHandlerArray.concat(change);
				}
			}

			return eventHandlerArray;

		},
		execEventHandlerArray : function (property, value, propertyIsChanged) {
			var eventHandlerArray = util.getEventHandlerArray.apply(this, [property, propertyIsChanged]),
				args,
				i,
				l;

			l = eventHandlerArray.length;

			for (i = 0; i < l; i += 1) {
				args = eventHandlerArray[i].args ? [property, value].concat(eventHandlerArray[i].args) : [property, value];
				eventHandlerArray[i].apply(this, args);
			}
		}
	};
	/* -- /util -- */

	/* -- ListenerObject -- */

	methods = {
		set : function (property, value) {
			var oldValue = this[property];

			this[property] = value;

			util.execEventHandlerArray.apply(this, [property, value, (value !== oldValue)]);

			return this[property];
		},
		get : function (property) {
			return this[property];
		},
		addListener : function (property, event, func, args) {
			var eventsArray = util.setUpListener.apply(this, [property, event], (args || []));
			func.args = args;
			eventsArray.push(func);
		},
		removeListener : function (property, event, func) {
			var eventArray = util.setUpListener.apply(this, [property, event]),
				i,
				l = eventArray.length,
				arr = [];

			for (i = 0; i < l; i += 1) {
				if (eventArray[i] !== func) {
					arr.push(eventArray[i]);
				}
			}

			this.listeners[property][event] = arr;
		}
	};

	ListenerObject = function () {
		util.getMethods(this, methods);
	};
	/* -- /ListenerObject -- */

	//  Make the ListenerObject global
	window.ListenerObject = ListenerObject;

	/* -- /production code -- */

	/* -- tests -- */

	tests = {
        "util.getMethods copys all methods from one object to another" : function () {
            var obj1 = {},
                obj2 = {
                    func1 : function () {},
                    func2 : function () {}
                };

            util.getMethods(obj1, obj2);

            return tdd.assertTrue(obj1.func1 === obj2.func1 && obj1.func2 === obj2.func2);
        },
		"An instance of ListenerObject has a 'set' method that sets a property value and returns that value" : function () {
			var testConstructor = new ListenerObject(),
				testSet = testConstructor.set("test", true);

			return tdd.assertTrue(testConstructor.test && testConstructor.test === true && testSet === true);
		},
		"An instance of ListenerObject has a 'get' method that gets a property value" : function () {
			var testConstructor = new ListenerObject(),
				testSet = testConstructor.set("test", true),
				testGet = testConstructor.get("test");

			return tdd.assertTrue(testGet === testSet);
		},
		"An instance of ListenerObject has an addListener method that adds a (event) listener to the object" : function () {
			var testObject = new ListenerObject(),
				testFunc = function () {};

			testObject.addListener("testProperty", "isset", testFunc);

			return tdd.assertTrue(testObject.listeners && testObject.listeners.testProperty && testObject.listeners.testProperty.isset && (testObject.listeners.testProperty.isset[0] === testFunc));
		},
		"An instance of ListenerObject has a removeListener method that removes an (event) listener from the object" : function () {
			var testObject = new ListenerObject(),
				testFunc = function () {};

			testObject.addListener("testProperty", "isset", testFunc);
			testObject.removeListener("testProperty", "isset", testFunc);

			return tdd.assertTrue(!testObject.listeners.testProperty.isset.length);
		},
		"There is a 'util.hasListeners' method that checks if a property has at least one listener" : function () {
			var test = new ListenerObject(),
				func = function () {};

			test.addListener("test", "set", func);

			return tdd.assertTrue(util.hasListeners.call(test, "test") && (util.hasListeners.call(test, "test") === true));
		},
		"Setting a property triggers the 'isset' event" : function () {
			var testObject = new ListenerObject(),
				itWorks = false,
				testFunc = function () {
					itWorks = true;
				};

			testObject.addListener("testProperty", "isset", testFunc);

			testObject.set("testProperty", true);

			return itWorks;
		},
		"Setting a property triggers the 'set' event" : function () {
			var testObject = new ListenerObject(),
				itWorks = false,
				testFunc = function () {
					itWorks = true;
				};

			testObject.addListener("testProperty", "set", testFunc);

			testObject.set("testProperty", true);

			return itWorks;
		},
		"Changing the value of a property that is allready set triggers the 'change' event" : function () {
			var testObject = new ListenerObject(),
				itWorks = false,
				testFunc = function () {
					itWorks = true;
				};

			testObject.set("testProperty", "firstValue");

			testObject.addListener("testProperty", "change", testFunc);

			testObject.set("testProperty", "secondValue");

			return itWorks;
		},
		"'set' and 'get' methods still works when ListenerObject is put in the global scope" : function () {
			var test = new window.ListenerObject(),
				test1 = test.set("itWorks", true),
				test2 = test.get("itWorks");

			return tdd.assertTrue(test1 && test2 && (test1 === test2));
		},
		"When a listener is triggerd it gets a property and a value argument" : function () {
            var test = new ListenerObject(),
                p = "",
                v = false,
                func = function (property, value) {
                    p = property;
                    v = value;
                };

            test.addListener("test", "set", func);

            test.set("test", true);

            return tdd.assertTrue(p && v);
        },
		"It's possible to add an arguments array to a listener" : function () {
			var test = new ListenerObject(),
				args = [true, "string", 1, 0, false, {}],
				a,
				b,
				c,
				d,
				e,
				f,
                func = function (property, value, boolTrue, str, one, zero, boolFalse, obj) {
					if (property && value) {
						a = boolTrue;
						b = str;
						c = one;
						d = zero;
						e = boolFalse;
						f = obj;
					}
				};

            test.addListener("test", "set", func, args);

            test.set("test", true);

            return tdd.assertTrue(a && b && c && (d === 0) && (e === false) && f && (typeof f === "object"));
		}
	};

	if (window.JsTdd) {
		tdd = new window.JsTdd("jsListenerObject", tests);

		tdd.runTests();
	}

	/* -- /tests -- */

}(window));
