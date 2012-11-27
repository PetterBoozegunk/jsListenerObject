(function (window) {
	"use strict";

	var createJsQueue,
		util;

	/* -- util -- */
	util = {
		addQueueItems : function (queue, queueObject) {
			var k;

			for (k in queueObject) {
				if (queueObject.hasOwnProperty(k) && typeof queueObject[k] === "function") {
					queue.addItem(queueObject[k]);
				}
			}
		}
	};
	/* -- /util -- */

	/* -- createJsQueue -- */
	createJsQueue = function (queueObject) {
		var that = window.createListenerCollection(),
			currentMethod = 0;

		util.addQueueItems(that, queueObject);

		that.ready = function () {
			currentMethod += 1;

			if (!that[currentMethod]) {
				that.trigger("ready");
			} else {
				that[currentMethod].apply(that, arguments);
			}
		};

		that.exec = function () {
			currentMethod = 0;
			that[currentMethod].apply(that, arguments);
		};

		return that;
	};
	/* -- /createJsQueue -- */

	window.createJsQueue = createJsQueue;
}(window));