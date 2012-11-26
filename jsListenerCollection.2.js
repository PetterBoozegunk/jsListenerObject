(function (window) {
	"use strict";

	var createListenerCollection,
		createListenerObject = window.createListenerObject;

	/* -- createListenerObject -- */
	createListenerCollection = function (options) {
		var that = createListenerObject(options);

		that.length = 0;

		/* -- addItem -- */
		that.addItem = function (item) {
			that.set(that.length, item);
			that.length += 1;

			that.trigger("itemAdded");
		};
		/* -- /addItem -- */

		/* -- removeItem -- */
		that.removeItem = function () {
			delete that[that.length - 1];
			that.length -= 1;

			that.trigger("itemRemoved");
		};
		/* -- /removeItem -- */

		return that;
	};
	/* -- /createListenerObject -- */

	window.createListenerCollection = createListenerCollection;

}(window));