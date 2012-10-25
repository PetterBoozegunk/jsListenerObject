(function (window) {
	"use strict";

	var createListenerCollection,
		ListenerObject = window.createListenerObject().get("constructor"),
		ListenerCollection;

	/* -- ListenerCollection -- */
	ListenerCollection = function (options) {
		ListenerObject.apply(this, [options]);

		this.length = 0;

		/* -- get -- */
		this.get = function (property) {
			var ret = this[property];

			if (property === "constructor") {
				ret = ListenerCollection;
			}

			return ret;
		};
		/* -- /get -- */

		/* -- addItem -- */
		this.addItem = function (item) {
			this[this.length] = item;
			this.length += 1;

			this.trigger("itemAdded");
		};
		/* -- /addItem -- */

		/* -- removeItem -- */
		this.removeItem = function () {
			delete this[this.length - 1];
			this.length -= 1;

			this.trigger("itemRemoved");
		};
		/* -- /removeItem -- */
	};
	/* -- /ListenerCollection -- */

	/* -- createListenerObject -- */
	createListenerCollection = function (options) {
		return new ListenerCollection(options);
	};
	/* -- /createListenerObject -- */

	window.createListenerCollection = createListenerCollection;

}(window));