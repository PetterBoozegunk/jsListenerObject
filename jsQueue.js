(function (window) {
	"use strict";

	var createJsQueue,
		addQueueItems;

	/* -- addQueueItems -- */
	addQueueItems = function (queue, queueObject) {
		var k;

		for (k in queueObject) {
			if (queueObject.hasOwnProperty(k) && typeof queueObject[k] === "function") {
				queue.addItem(queueObject[k]);
			}
		}
	};
	/* -- /addQueueItems -- */

	/* -- createJsQueue -- */
	createJsQueue = function (queueObject) {
		var that = window.createListenerCollection(),
			currentMethod = 0,
			privateMethods = {
				ready : function () {
					currentMethod += 1;

					if (!that[currentMethod]) {
						that.trigger("ready");
					} else {
						that[currentMethod].apply(privateMethods, arguments);
					}
				}
			};

		addQueueItems(that, queueObject);

		that.exec = function () {
			currentMethod = 0;
			that[currentMethod].apply(privateMethods, arguments);
		};

		return that;
	};
	/* -- /createJsQueue -- */

	window.createJsQueue = createJsQueue;
}(window));