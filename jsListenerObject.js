(function (window) {
	"use strict";

	var setOptions,
		createEventObject,
		createEventHandlers,
		createListenerObject;

	setOptions = function (options) {
		var that = {},
			k;

		for (k in options) {
			if (options.hasOwnProperty(k)) {
				that[k] = options[k];
			}
		}

		return that;
	};
	/* -- /SetOptions -- */

	/* -- EventObject -- */
	createEventObject = function (options) {
		var that = setOptions(options);

		that.bubbleCanceled = false;

		that.cancelBubble = function () {
			that.bubbleCanceled = true;
		};

		return that;
	};
	/* -- /EventObject -- */

	/* -- EventHandlers -- */
	createEventHandlers = function () {
		var that = {};

		that.getHandlers = function (type, property) {
			var handlers = [];

			if (that.events[type]) {
				handlers = that.events[type];
			}

			if (that.events[property] && that.events[property][type]) {
				handlers = handlers.concat(that.events[property][type]);
			}

			return handlers;
		};

		that.addHandler = function (type, property, data, handler) {
			var eventObject;

			if (!that.events[type]) {
				that.events[type] = [];
			}

			eventObject = {
				property : property,
				data : data,
				handler : handler
			};

			if (!handler && !data && typeof property === "function") {
				eventObject.handler = property;
				eventObject.property = "";
				delete eventObject.data;
			} else if (!handler && typeof property === "string" && typeof data === "function") {
				eventObject.handler = data;
				delete eventObject.data;
			} else if (typeof type === "string" && typeof property === "object" && typeof data === "function") {
				eventObject.handler = data;
				eventObject.data = property;
			}

			if (typeof property === "string") {
				if (!that.events[property]) {
					that.events[property] = {};
				}

				if (!that.events[property][type]) {
					that.events[property][type] = [];
				}

				that.events[property][type].push(eventObject);
			} else {
				that.events[type].push(eventObject);
			}
		};

		that.removeHandler = function (type, property, data, handler) {
			var handlers,
				newHandlers = [],
				propertyHandlers,
				newPropertyHandlers = [],
				i,
				l;

			if (!handler && !data && typeof property === "function") {
				handler = property;
			} else if (!handler && typeof data === "function") {
				handler = data;
			}

			if (typeof property === "string" && that.events[property] && that.events[property][type]) {
				propertyHandlers = that.events[property][type];

				l = propertyHandlers.length;

				for (i = 0; i < l; i += 1) {
					if (propertyHandlers[i].handler !== handler) {
						newPropertyHandlers.push(propertyHandlers[i]);
					}
				}

				that.events[property][type] = newPropertyHandlers;
			}

			if (that.events[type]) {
				handlers = that.events[type];

				l = handlers.length;

				for (i = 0; i < l; i += 1) {
					if (handlers[i].handler !== handler) {
						newHandlers.push(handlers[i]);
					}
				}

				that.events[type] = newHandlers;
			}
		};

		that.execHandlers = function (type, property, context, bubble) {
			var eventOptions = {
					type : type,
					property : property,
					value : context[property]
				},
				handlers = that.getHandlers(type, property),
				handler,
				i,
				l = handlers.length,
				eventObject = {};

			if (bubble) {
				eventOptions.targetObject = context;
			}

			for (i = 0; i < l; i += 1) {
				if (typeof handlers[i].data === "object") {
					eventOptions.data = handlers[i].data;
				}

				handler = handlers[i].handler;

				if (eventOptions.property === undefined) {
					delete eventOptions.property;
				}

				if (eventOptions.value === undefined) {
					delete eventOptions.value;
				}

				eventObject = createEventObject(eventOptions);

				handler.apply(context, [eventObject]);
			}

			return eventObject;
		};

		that.trigger = function (type, property, context, bubble) {
			var execHandlers = that.execHandlers;

			return execHandlers.apply(that, [type, property, context, bubble]);
		};

		that.events = {};

		return that;
	};
	/* -- /EventHandlers -- */

	/* -- createListenerObject -- */
	createListenerObject = function (options) {
		var that = setOptions(options),
			eventHandlers = createEventHandlers(),
			parent = that.parent;

		if (that.parent) {
			delete that.parent;
		}

		/* -- get -- */
		that.get = function (property) {
			var ret = that[property];

			if (property === "parent") {
				ret = parent;
			}

			return ret;
		};
		/* -- /get -- */

		/* -- set -- */
		that.set = function (property, value) {
			var valueIsChanged = (that[property] !== value);

			if (typeof value === "object" && !(value instanceof Array)) {
				value.parent = that;
				that[property] = window.createListenerObject(value);
			} else {
				that[property] = value;
			}

			that.trigger("set", property, that, true);

			if (valueIsChanged) {
				that.trigger("change", property, that, true);
			}

			return that[property];
		};
		/* -- /set -- */

		/* -- addListener -- */
		that.addListener = function (type, property, data, handler) {
			var addHandler = eventHandlers.addHandler;

			addHandler.apply(eventHandlers, [type, property, data, handler]);
		};
		/* -- /addListener -- */

		/* -- removeListener -- */
		that.removeListener = function (type, property, data, handler) {
			var removeHandler = eventHandlers.removeHandler;

			removeHandler.apply(eventHandlers, [type, property, data, handler]);
		};
		/* -- /removeListener -- */

		/* -- trigger -- */
		that.trigger = function (type, property, context, bubble) {
			var trigger = eventHandlers.trigger,
				bubbleCanceled = false,
				eventObject;

			eventObject = trigger.apply(eventHandlers, [type, property, (context || that), bubble]);

			if (eventObject && eventObject.bubbleCanceled) {
				bubbleCanceled = true;
			}

			if (parent && !bubbleCanceled) {
				parent.trigger(type, property, (context || that), true);
			}
		};
		/* -- /trigger -- */

		return that;
	};
	/* -- /createListenerObject -- */

	window.createListenerObject = createListenerObject;

}(window));