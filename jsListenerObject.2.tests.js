(function (window) {
	"use strict";

	var qUnit = window.QUnit,
		module = qUnit.module,
		test = qUnit.test,
		ok = qUnit.ok,
		strictEqual = qUnit.strictEqual;

	module("jsListenerObject: Basic tests");
	test("There is a global 'createListenerObject' function that returns a new ListenerOject", function () {
		var testFunc = window.createListenerObject,
			testObject,
			construct,
			TestConstructor,
			testConst,
			testOpt,
			k,
			options = {
				test1 : "one",
				test2 : [],
				test3 : {}
			};

		ok(testFunc && typeof testFunc === "function", "There is a global 'createListenerObject' function");

		testObject = window.createListenerObject();
		ok(testObject && typeof testObject === "object" && !(testObject instanceof Array), "'createListenerObject' returns an Object");

		construct = testObject.get("constructor");
		ok(construct, "Has a 'constructor' property that represents the ListenerObject constructor");

		TestConstructor = testObject.constructor;
		testConst = new TestConstructor();

		strictEqual(construct, testConst.constructor, "The actual constructor is the same as the 'constructor' property");

		testOpt = window.createListenerObject(options);

		for (k in options) {
			if (options.hasOwnProperty(k)) {
				strictEqual(options[k], testOpt[k], "The new ListenerObject has a '" + k + "' property");
			}
		}
	});

	test("The 'set' method works as it's supposed to", function () {
		var testObject = window.createListenerObject(),
			testSet;

		ok(testObject.set && typeof testObject.set === "function", "A listenerObject has a 'set' method");

		testObject.set("testSet", true);
		strictEqual(testObject.testSet, true, "The 'set' method sets a property");

		testSet = testObject.set("testSet2", true);
		strictEqual(testSet, true, "The 'set' method returns the property value");
	});

	test("The 'get' method works as it's supposed to", function () {
		var testObject = window.createListenerObject();

		ok(testObject.get && typeof testObject.get === "function", "A listenerObject has a 'get' method");

		testObject.set("testSet2", true);
		strictEqual(testObject.get("testSet2"), true, "The 'get' method returns the property value");
	});

	module("jsListenerObject: AddListener/RemoveListener tests");
	test("It's possible to add/remove a listener/eventHandler to a ListenerObject using two (2) arguments, eventType (string) and eventHandler (function)", function () {
		var testObject = window.createListenerObject(),
			setListenerIsTriggered = false,
			test2 = false,
			first = true,
			second = false,
			test3 = function (e) {
				if (first) {
					ok(e && typeof e === "object" && !(e instanceof Array) && arguments.length === 1, "An executed handler gets an 'event' object as its only argument");

					strictEqual(e.property, "test3", "The event object has a 'property' property that is set to whatever property triggered the 'set' event");
					strictEqual(e.value, true, "The event object has a 'value' property that is set to the property value");
					strictEqual(e.type, "set", "The event object has a 'type' property that is set to the event type (in this case 'set')");

					strictEqual(this, testObject, "The 'this' operator is set to the object the listener/handler is added to");
					first = false;
				} else {
					second = true;
				}
			};

		ok(testObject.addListener && typeof testObject.addListener === "function", "The ListenerObject has a 'addListener' method");

		testObject.addListener("set", function () {
			setListenerIsTriggered = true;
		});
		testObject.set("test", true);
		ok(setListenerIsTriggered, "When added it's possible to trigger the eventHandler by setting a property (using the 'set' method)");

		testObject.set("test2", 0);

		testObject.addListener("change", function () {
			test2 = true;
		});

		testObject.set("test2", 1);

		strictEqual(test2, true, "It's possible to trigger an eventHandler by changing a property (using the 'set' method)");

		testObject.addListener("set", test3);
		testObject.set("test3", true);

		testObject.removeListener("set", test3);
		testObject.set("test3", "Yay");

		strictEqual(second, false, "The eventListener was removed");
	});

	test("It's possible to add/remove a listener/eventHandler to a ListenerObject using three (3) arguments, eventType (string), (property (string) or data (object)) and eventHandler (function)", function () {
		var testObject = window.createListenerObject(),
			eventCalls1 = 0,
			testData = {
				test1 : "test1",
				test2 : "test2",
				test3 : []
			},
			testFunc1 = function () {
				eventCalls1 += 1;
			},
			eventCalls2 = 0,
			testFunc2 = function (e) {
				var data = e.data;
				if (data === testData) {
					eventCalls2 += 1;
				}
			};

		/* -- testing with the second argument as a 'property' (string) -- */
		testObject.addListener("set", "test1", testFunc1);

		testObject.set("test1", true);
		testObject.set("test2", true);
		testObject.set("test3", true);

		strictEqual(eventCalls1, 1, "The 'testFunc1' is triggered only when the 'test1' property is set");

		testObject.removeListener("set", "test1", testFunc1);

		testObject.set("test1", true);
		strictEqual(eventCalls1, 1, "The 'testFunc1' listener is removed");
		/* -- /testing with the second argument as a 'property' (string) -- */

		/* -- testing with the second argument as 'data' (object) -- */
		testObject.addListener("set", testData, testFunc2);
		testObject.set("test2_1", true);

		strictEqual(eventCalls2, 1, "The e.data object in 'testFunc2' is the same as 'testData'");

		testObject.removeListener("set", testData, testFunc2);
		strictEqual(eventCalls2, 1, "The 'testFunc2' listener is removed");
		/* -- /testing with the second argument as 'data' (object) -- */
	});

	test("It's possible to add/remove a listener/eventHandler to a ListenerObject using four (4) arguments, eventType (string), property (string), data (object) and eventHandler (function)", function () {
		var testObject = window.createListenerObject(),
			eventCalls1 = 0,
			testData = {
				test1 : "test1",
				test2 : "test2",
				test3 : []
			},
			testFunc1 = function (e) {
				var data = e.data;
				if (data === testData) {
					eventCalls1 += 1;
				}
			};

		/* -- testing with the second argument as a 'property' (string) AND the third argument as a 'data' (object) -- */
		testObject.addListener("set", "test1", testData, testFunc1);

		testObject.set("test1", true);
		testObject.set("test2", true);
		testObject.set("test3", true);

		strictEqual(eventCalls1, 1, "The 'testFunc1' is triggered only when the 'test1' property is set");

		testObject.removeListener("set", "test1", testData, testFunc1);

		testObject.set("test1", true);
		strictEqual(eventCalls1, 1, "The 'testFunc1' listener is removed");
		/* -- /testing with the second argument as a 'property' (string) AND the third argument as a 'data' (object) -- */
	});

	module("jsListenerObject: Trigger (event) tests");
	test("It's possible to trigger an event (custom, 'set' and 'change') without setting or changing an property", function () {
		var testObject = window.createListenerObject(),

			setTriggered = false,
			testSetFunc = function () {
				setTriggered = true;
			},

			changeTriggered = false,
			testChangeFunc = function () {
				changeTriggered = true;
			},

			customTriggered = false,
			testCustomEvent = function () {
				customTriggered = true;
			},

			propertyCustomEventTriggered = false,
			propertyCustomEvent = function (e) {

				if (e.property === "testProperty") {
					propertyCustomEventTriggered = true;
				}

				strictEqual(e.property, "testProperty", "Only the property 'testProperty' is triggered");
			};

		ok(testObject.trigger && typeof testObject.trigger === "function", "testObject has a 'trigger' method");

		/* -- test 'set' -- */
		testObject.addListener("set", testSetFunc);
		testObject.trigger("set");

		ok(setTriggered, "The trigger method can trigger the 'set' event");
		/* -- /test 'set' -- */

		/* -- test 'change' -- */
		testObject.addListener("change", testChangeFunc);
		testObject.trigger("change");

		ok(changeTriggered, "The trigger method can trigger the 'change' event");
		/* -- /test 'change' -- */

		/* -- test customEvent -- */
		testObject.addListener("whatevvaEvent", testCustomEvent);
		testObject.trigger("whatevvaEvent");

		ok(customTriggered, "The trigger method can trigger a custom event");
		/* -- /test customEvent -- */

		/* -- test customEvent with a specific property  -- */
		testObject.addListener("whatevvaEvent2", "testProperty", propertyCustomEvent);
		testObject.trigger("whatevvaEvent2", "testProperty");
		testObject.trigger("whatevvaEvent2", "testProperty2");
		testObject.trigger("whatevvaEvent2", "testProperty3");

		ok(propertyCustomEventTriggered, "The trigger method can trigger a custom event with a second property argument");
		/* -- test customEvent with a specific property  -- */
	});

	test("The custom trigger works as expected when using the (second) 'propertyName' argument", function () {
		var testObject = window.createListenerObject();

		testObject.addListener("propertyAdded", function (e) {
			strictEqual(e.property, "someProperty", "event.property is set to 'someProperty'");
			strictEqual(e.value, "someValue", "event.value is set to 'someValue'");
		});

		testObject.addProperty = function (name, value) {
			this.set(name, value);
			this.trigger("propertyAdded", name);
		};

		testObject.addProperty("someProperty", "someValue");
	});

	test("The custom trigger works as expected when NOT using the (second) 'propertyName' argument", function () {
		var testObject = window.createListenerObject();

		testObject.addListener("propertyAdded", function (e) {
			var prop = e.hasOwnProperty("property"),
				val = e.hasOwnProperty("value");

			strictEqual(prop, false, "event does not have a 'property' property");
			strictEqual(val, false, "event does not have a 'value' property");
		});

		testObject.addProperty = function (name, value) {
			this.set(name, value);
			this.trigger("propertyAdded");
		};

		testObject.addProperty("someProperty", "someValue");
	});

	module("jsListenerObject: Inheritance tests");
	test("Any Object (not Array) that gets set and/or added with the 'set' method gets converted to a ListenerObject", function () {
		var testObject = window.createListenerObject(),
			contrs = testObject.get("constructor"),
			options = {
				test1 : "Whohoooo",
				test2 : true
			},
			testObject2,
			testArray;

		testObject2 = testObject.set("whatevva", options);
		strictEqual(testObject2 instanceof contrs, true, "The new object is an instanceof ListenerObject");

		testArray = testObject.set("arrayTest", []);
		strictEqual(testArray instanceof contrs, false, "The added array is NOT an instanceof ListenerObject");
	});

	module("jsListenerObject: Event bubbling tests");
	test("When an event is triggered on an Object that is a property of a ListenerObject that event bubbles to its parent", function () {
		var testObject = window.createListenerObject(),
			testObject2,
			obj2 = {
				yay : "Yay!"
			},

			itBubbles = false;

		testObject2 = testObject.set("obj2", obj2);

		testObject.addListener("bubbleTest", function () {
			itBubbles = true;
		});

		testObject2.trigger("bubbleTest");

		ok(itBubbles, "We got bubbles!");
	});

	test("When an event bubbles the event argument (object) gets a 'targetObject' property. That property is a reference to the object on which the object was triggered", function () {
		var testObject = window.createListenerObject(),
			testObject2,
			obj2 = {
				bubbleTest : "bubbleTest"
			},
			testObject3;

		testObject2 = testObject.set("obj2", obj2);

		testObject.addListener("bubbleTest", function (e) {
			strictEqual(e.targetObject, testObject2, "The targetObject points to the object on which the event was triggered (test 1)");
		});

		testObject2.trigger("bubbleTest");

		testObject3 = testObject2.set("moreBubbles", {test: "moreBubbles"});

		testObject.addListener("moreBubbles", function (e) {
			strictEqual(e.targetObject, testObject3, "The targetObject points to the object on which the event was triggered (test 2)");
		});

		testObject3.trigger("moreBubbles");
	});

	test("When using ListenerObject.get('parent') (which is NOT a visible property) the objects parent is returned", function () {
		var testObject = window.createListenerObject(),
			testObject2,
			obj = {
				type : "ListenerObject",
				test : "parentTest"
			};

		testObject2 = testObject.set("obj", obj);

		strictEqual(testObject2.get("parent"), testObject, "ListenerObject.get('parent') returns the parent object");
	});

	test("The event object should have a 'cancelBubble' method that prevents bubbling", function () {
		var testObject = window.createListenerObject(),
			testObject2,
			obj = {
				type : "ListenerObject",
				test : "cancelBubbleTest"
			},
			trigger1 = false,
			trigger2 = false;

		testObject2 = testObject.set("obj", obj);

		testObject.addListener("cancelBubble", function () {
			trigger2 = true;
		});

		testObject2.addListener("cancelBubble", function (e) {
			e.cancelBubble();
			trigger1 = true;
		});

		testObject2.trigger("cancelBubble");

		strictEqual(trigger1, true, "The first handler is executed");
		strictEqual(trigger2, false, "The second handler is NOT executed");
	});

}(window));