(function (window) {
	"use strict";

	var SetOptions,
		EventObject,
		EventHandlers,
		ListenerObject,
		createListenerObject;

	/* -- SetOptions -- */
	SetOptions = function (options) {
		var k;
		for (k in options) {
			if (options.hasOwnProperty(k)) {
				this[k] = options[k];
			}
		}
	};
	/* -- /SetOptions -- */

	/* -- EventObject -- */
	EventObject = function (options) {
		SetOptions.apply(this, [options]);
	};
	/* -- /EventObject -- */

	/* -- EventHandlers -- */
	EventHandlers = function () {
		this.events = {};
	};

	EventHandlers.prototype = {
		getHandlers : function (type, property) {
			var handlers = [];

			if (this.events[type]) {
				handlers = this.events[type];
			}

			if (this.events[property] && this.events[property][type]) {
				handlers = handlers.concat(this.events[property][type]);
			}

			return handlers;
		},
		addHandler : function (type, property, data, handler) {
            var eventObject;

			if (!this.events[type]) {
				this.events[type] = [];
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
				if (!this.events[property]) {
					this.events[property] = {};
				}

				if (!this.events[property][type]) {
					this.events[property][type] = [];
				}

				this.events[property][type].push(eventObject);
			} else {
				this.events[type].push(eventObject);
			}
		},
		removeHandler : function (type, property, data, handler) {
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

			if (typeof property === "string" && this.events[property] && this.events[property][type]) {
				propertyHandlers = this.events[property][type];

				l = propertyHandlers.length;

				for (i = 0; i < l; i += 1) {
					if (propertyHandlers[i].handler !== handler) {
						newPropertyHandlers.push(propertyHandlers[i]);
					}
				}

				this.events[property][type] = newPropertyHandlers;
			}

			if (this.events[type]) {
				handlers = this.events[type];

				l = handlers.length;

				for (i = 0; i < l; i += 1) {
					if (handlers[i].handler !== handler) {
						newHandlers.push(handlers[i]);
					}
				}

				this.events[type] = newHandlers;
			}
		},
		execHandlers : function (type, property, context, bubble) {
			var eventOptions = {
					type : type,
					property : property,
					value : context[property]
				},
				handlers = this.getHandlers(type, property),
				handler,
				i,
				l = handlers.length;

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

				handler.apply(context, [new EventObject(eventOptions)]);
			}
		},
		trigger : function (type, property, context, bubble) {
			var execHandlers = this.execHandlers;

			execHandlers.apply(this, [type, property, context, bubble]);
		}
	};
	/* -- /EventHandlers -- */

	/* -- ListenerObject -- */
	ListenerObject = function (options) {
		SetOptions.apply(this, [options]);

		var that = this,
			eventHandlers = new EventHandlers(),
			parent = this.parent;

		if (this.parent) {
			delete this.parent;
		}

		/* -- get -- */
		this.get = function (property) {
			var ret = this[property];

			if (property === "constructor") {
				ret = ListenerObject;
			}

			return ret;
		};
		/* -- /get -- */

		/* -- set -- */
		this.set = function (property, value) {
			var valueIsChanged = (this[property] !== value),
				//oldValue = this[property],
				trigger = eventHandlers.trigger;

			if (typeof value === "object" && !(value instanceof Array)) {
				value.parent = this;
				this[property] = new ListenerObject(value);
			} else {
				this[property] = value;
			}

			trigger.apply(eventHandlers, ["set", property, that]);

			if (valueIsChanged) {
				trigger.apply(eventHandlers, ["change", property, that]);
			}

			return this[property];
		};
		/* -- /set -- */

		/* -- addListener -- */
		this.addListener = function (type, property, data, handler) {
			var addHandler = eventHandlers.addHandler;

			addHandler.apply(eventHandlers, [type, property, data, handler]);
		};
		/* -- /addListener -- */

		/* -- removeListener -- */
		this.removeListener = function (type, property, data, handler) {
			var removeHandler = eventHandlers.removeHandler;

			removeHandler.apply(eventHandlers, [type, property, data, handler]);
		};
		/* -- /removeListener -- */

		/* -- trigger -- */
		this.trigger = function (type, property, context, bubble) {
			var trigger = eventHandlers.trigger;

			trigger.apply(eventHandlers, [type, property, (context || that), bubble]);

			if (parent) {
				parent.trigger(type, property, (context || that), true);
			}
		};
		/* -- /trigger -- */
	};
	/* -- /ListenerObject -- */

	/* -- createListenerObject -- */
	createListenerObject = function (options) {
		return new ListenerObject(options);
	};
	/* -- /createListenerObject -- */

	window.createListenerObject = createListenerObject;

}(window));