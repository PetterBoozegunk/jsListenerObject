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
			queue = window.createJsQueue(queueObject),
			queue2 = window.createJsQueue(queueObject);

		ok(typeof queue.exec === "function", "There is an 'exec' method");

		queue.exec();
		strictEqual(testCount, 2, "Both the first and second methods in the queueObject is executed");

		queue.exec(0, 0);

		queue2.addListener("ready", function () {
			queueReady = true;

		});
		queue2.exec();
		strictEqual(queueReady, true, "A 'ready' event is triggered by the this.ready method in the last queue method");
	});

	asyncTest("The queue can handle delays", function () {
		var queueObject = {
				one : function (n) {
					start();
					var that = this;

					n += 1;

					strictEqual(n, 1, "n === 1");

					setTimeout(function () {
						that.ready(n);
					}, 100);
					stop();
				},
				two : function (n) {
					start();
					var that = this;

					n += 1;

					strictEqual(n, 2, "n === 2");

					setTimeout(function () {
						that.ready(n);
					}, 100);
					stop();
				},
				three : function (n) {
					start();
					var that = this;

					n += 1;

					strictEqual(n, 3, "n === 3");

					setTimeout(function () {
						that.ready();
					}, 100);
					stop();
				}
			},
			queue = window.createJsQueue(queueObject);

		queue.addListener("ready", function () {
			start();
		});

		queue.exec(0);
	});

	module("jsQueue: Stack tests");
	asyncTest("If a queue is executed twice (or more) in a row the queues get stacked and will be executed after one another (queue 1 will be ready before queue2 starts)", function () {
		var ready = 0,
			q1Opts = {
				name : "q1",
				first : false,
				second : false,
				ready : false
			},
			q1 = window.createListenerObject(q1Opts),
			q2Opts = {
				name : "q2",
				first : false,
				second : false,
				ready : false
			},
			q2 = window.createListenerObject(q2Opts),
			q3Opts = {
				name : "q3",
				first : false,
				second : false,
				ready : false
			},
			q3 = window.createListenerObject(q3Opts),
			queueObject = {
				first : function (q) {
					var that = this;

					q.set("first", true);

					setTimeout(function () {
						that.ready(q);
					}, 100);
				},
				second : function (q) {
					var that = this;

					q.set("second", true);

					setTimeout(function () {
						that.ready();
					}, 100);
				}
			},
			queue = window.createJsQueue(queueObject);

		queue.addListener("ready", function () {

			ready += 1;

			if (ready === 1) {
				q1.set("ready", true);
			} else if (ready === 2) {
				q2.set("ready", true);
			} else if (ready === 3) {
				q3.set("ready", true);
			}
		});

		q1.addListener("set", "ready", function () {
			start();
			strictEqual(q1.first, true, "q1.first === true");
			strictEqual(q1.second, true, "q1.second === true");
			strictEqual(q1.ready, true, "q1.ready === true");

			strictEqual(q2.first, false, "q2.first === false");
			strictEqual(q2.second, false, "q2.second === false");
			strictEqual(q2.ready, false, "q2.ready === false");

			strictEqual(q3.first, false, "q3.first === false");
			strictEqual(q3.second, false, "q3.second === false");
			strictEqual(q3.ready, false, "q3.ready === false");
			stop();
		});

		q2.addListener("set", "ready", function () {
			start();
			strictEqual(q1.first, true, "q1.first === true");
			strictEqual(q1.second, true, "q1.second === true");
			strictEqual(q1.ready, true, "q1.ready === true");

			strictEqual(q2.first, true, "q2.first === true");
			strictEqual(q2.second, true, "q2.second === true");
			strictEqual(q2.ready, true, "q2.ready === true");

			strictEqual(q3.first, false, "q3.first === false");
			strictEqual(q3.second, false, "q3.second === false");
			strictEqual(q3.ready, false, "q3.ready === false");
			stop();
		});

		q3.addListener("set", "ready", function () {
			start();
			strictEqual(q1.first, true, "q1.first === true");
			strictEqual(q1.second, true, "q1.second === true");
			strictEqual(q1.ready, true, "q1.ready === true");

			strictEqual(q2.first, true, "q2.first === true");
			strictEqual(q2.second, true, "q2.second === true");
			strictEqual(q2.ready, true, "q2.ready === true");

			strictEqual(q3.first, true, "q3.first === true");
			strictEqual(q3.second, true, "q3.second === true");
			strictEqual(q3.ready, true, "q3.ready === true");
		});

		queue.exec(q1);
		queue.exec(q2);
		queue.exec(q3);
	});

}(window));