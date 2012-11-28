(function (window) {
	"use strict";

	var qUnit = window.QUnit,
		module = qUnit.module,
		test = qUnit.test,
		asyncTest = qUnit.asyncTest,
		ok = qUnit.ok,
		strictEqual = qUnit.strictEqual,
		start = qUnit.start,
		stop = qUnit.stop;

	module("jsQueue: Basic tests");
	test("There is a global function called 'createJsQueue'", function () {
		ok(window.createJsQueue && typeof window.createJsQueue === "function", "The global function 'createJsQueue' exists");
	});

	test("The object created by 'createJsQueue' gets an 'addItem' method and a 'length' property", function () {
		var queue = window.createJsQueue();

		ok(typeof queue.addItem === "function", "The queue has a 'addItem' method");
		ok(typeof queue.length === "number", "The queue has a 'length' property");
	});

	test("The object created by 'createJsQueue' takes a queueObject as it's only argument", function () {
		var queueObject = {
				first : function () {},
				second : function () {},
				third : "What?",
				fourth : function () {}
			},
			queue = window.createJsQueue(queueObject);

		strictEqual(queue[0], queueObject.first, "The first method is added the the queue");
		strictEqual(queue[1], queueObject.second, "The second method is added the the queue");
		ok(queue[2] !== queueObject.third, "The 'third' (string) property is NOT added the the queue");
		strictEqual(queue[2], queueObject.fourth, "The 'fourth' method is added the the queue (as queue[2])");
	});

	test("The object created by 'createJsQueue' has an 'exec' method that executes the queue", function () {
		var testCount = 0,
			queueReady = false,
			one = 0,
			two = 0,
			queueObject = {
				first : function (one, two) {
					testCount += 1;

					ok(typeof this.ready === "function", "The queue has a 'ready' method that can be executed from within a queue method");

					if (typeof one === "number") {
						one += 1;
						two += 1;
					}

					this.ready(one, two);
				},
				second : function (one, two) {
					testCount += 1;

					if (typeof one === "number") {
						one += 1;
						two += 1;

						strictEqual(one, 2, "I'ts possible to send arguments to the queue (test 1)");
						strictEqual(two, 2, "I'ts possible to send arguments to the queue (test 2)");
					}

					this.ready(one, two);
				}
			},
			queue = window.createJsQueue(queueObject);

		ok(typeof queue.exec === "function", "There is an 'exec' method");

		queue.exec();
		strictEqual(testCount, 2, "Both the first and second methods in the queueObject is executed");

		queue.exec(one, two);

		queue.addListener("ready", function () {
			queueReady = true;
		});
		queue.exec();
		strictEqual(queueReady, true, "A 'ready' event is triggered by the this.ready method in the last queue method");
	});

	asyncTest("The queue can handle delays", function () {
		var n = 0,
			queueObject = {
				one : function (n) {
					start();

					var that = this;

					n += 1;

					strictEqual(n, 1, "n === 1");

					setTimeout(function () {
						that.ready(n);
					}, 1000);

					stop();
				},
				two : function (n) {
					start();

					var that = this;

					n += 1;

					strictEqual(n, 2, "n === 2");

					setTimeout(function () {
						that.ready(n);
					}, 1000);
					
					stop();
				}, 
				three : function (n) {
					start();

					var that = this;

					n += 1;

					strictEqual(n, 3, "n === 3");
					
					setTimeout(function () {
						that.ready();
					}, 1000);

					stop();
				}
			},
			queue = window.createJsQueue(queueObject);

		queue.addListener("ready", function () {
			start();
		});

		queue.exec(n);
	});

}(window));