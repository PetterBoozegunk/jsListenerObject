(function (window) {
	"use strict";

	var qUnit = window.QUnit,
		module = qUnit.module,
		test = qUnit.test,
		ok = qUnit.ok,
		strictEqual = qUnit.strictEqual;

	module("jsListenerCollection: Basic tests");
	test("There is a global 'createListenerCollection' function that returns a new ListenerCollection", function () {
		var testFunc = window.createListenerCollection,
			testCollection,
			construct,
			TestConstructor,
			textConst,
			testOpt,
			k,
			options = {
				test1 : "one",
				test2 : [],
				test3 : {}
			};

		ok(testFunc && typeof testFunc === "function", "There is a global 'createListenerCollection' function");

		testCollection = window.createListenerCollection();
		ok(testCollection && typeof testCollection === "object" && !(testCollection instanceof Array), "'createListenerCollection' returns an Object");

		construct = testCollection.get("constructor");
		ok(construct, "Has a 'constructor' property that represents the ListenerCollection constructor");

		TestConstructor = testCollection.constructor;
		textConst = new TestConstructor();

		strictEqual(construct, textConst.constructor, "The actual constructor is the same as the 'constructor' property");

		testOpt = window.createListenerCollection(options);

		for (k in options) {
			if (options.hasOwnProperty(k)) {
				strictEqual(options[k], testOpt[k], "The new ListenerCollection has a '" + k + "' property");
			}
		}

		strictEqual(testCollection.length, 0, "A new (empty) collection has a length property set to '0'");
	});

	test("When using ListenerCollection.get('parent') (which is NOT a visible property) the objects parent is returned", function () {
		var testObject = window.createListenerCollection(),
			testObject2,
			obj = {
				type : "ListenerCollection",
				test : "parentTest"
			};

		testObject2 = testObject.set("obj", obj);

		strictEqual(testObject2.get("parent"), testObject, "ListenerCollection.get('parent') returns the parent object");
	});

	module("jsListenerCollection: addItem/removeItem");
	test("It's possible to add an item to the collection using the 'addItem' method", function () {
		var testCollection = window.createListenerCollection(),
			testText = "Yay!",
			itemAdded = false,
			itemRemoved = false;

		testCollection.addItem(testText);

		strictEqual(testCollection.length, 1, "After adding an item length is set to '1'");
		strictEqual(testCollection[0], testText, "The first item in the collection === '" + testText + "'");

		testCollection.removeItem();

		strictEqual(testCollection.length, 0, "After removing the item we just added, length is set to '0'");
		ok(!testCollection[0], "The collection has no item at index '0'");

		testCollection.addListener("itemAdded", function () {
			itemAdded = true;
		});

		testCollection.addItem(testText);
		strictEqual(itemAdded, true, "When an item is added the 'itemAdded' event is triggered");

		testCollection.addListener("itemRemoved", function () {
			itemRemoved = true;
		});

		testCollection.removeItem();
		strictEqual(itemAdded, itemRemoved, "When an item is removed the 'itemRemoved' event is triggered");

	});

}(window));