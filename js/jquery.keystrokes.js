/*
* Keystrokes event for jQuery
* http://www.boedesign.com/
*
* Copyright (c) 2010 Jordan Boesch
* Dual licensed under the MIT and GPL licenses.
* 
* This is ONLY compatible with jQuery 1.4.2 or higher... sorry!
*
* Date: February 25, 2010
* Version: 1.2 
*/

(function($){

	// Special event... oh so special
	var keystrokes = 'keystrokes';
	
	$.event.special[keystrokes] = {
		
		/**
		* Debug log with window.console.log
		* @public
		*/
		debug: false,
		
		/**
		* Any set globals will be found in here
		* @public
		*/
		global: {
			customValidation: null
		},
		
		/**
		* As soon as the keystrokes event is attached with "bind", it runs this each bind (jQuery 1.4)
		* @private/public
		* @param {Object} obj An object passed that contains data, namespaces and a handler
		*/
		add: function(obj){

			var h = obj.handler,
				data = obj.data,
				namespace = obj.namespace;
			
			var $elem = $(this),
				delegate = $.event.special[keystrokes]._delegate;
			
			// We can pass a large stack of objects or just a single object
			var stack = $.isArray(data) ? data : [data];
			
			// Attach the proper namespace to each stack item for easy unbinding later (comparing and splicing)
			stack = $.event.special[keystrokes]._addPrivateKeys.call(this, stack, namespace, h);
			
			// If it's already set, we need to add to the element, not overwrite it
			var tmp_stack = $elem.data('stack');
			
			stack = (tmp_stack) ? tmp_stack.concat(stack) : stack;
			$elem.data('stack', stack);
			
		},
		
		/**
		* As soon as the keystrokes event is detached with "unbind", it runs this each unbind call
		* @private/public
		* @param {Object} obj An object passed that contains data, namespace, handler etc
		*/
		remove: function(obj){
			
			// Remove keys that it's listening for
			$.event.special[keystrokes]._removeKeyListeners.call(this, obj.namespace || keystrokes);
			
		},
		
		/**
		* As soon as an event is bound, setup runs only once to set some default data for that element
		* @private/public
		* @param {Object} obj Object containing data/handlers etc
		* @param {Array} namespaces Namespaces that are associated with the event
		* @param {Function} handler The event handler tied to the bound element
		*/
		setup: function(obj, namespaces, handler){
			
			var $elem = $(this),
				delegate = $.event.special[keystrokes]._delegate;
			
			$elem.bind('keyup.' + keystrokes, delegate).bind('keydown.' + keystrokes, delegate);
			
			$elem.data('keys_down', []);
			$elem.data('keys_string', []);
			$elem.data('joined', false);
			
		},
		
		/**
		* Called when the last element is unbound for the bound item
		* @private/public
		* @param {Array} namespaces Namespaces that are associated with the event
		*/
		teardown: function(namespaces){
			
			var $elem = $(this);
			
			$elem.unbind('keyup.' + keystrokes).unbind('keydown.' + keystrokes);	
			
			$elem.removeData('keys_down');
			$elem.removeData('keys_string');
			$elem.removeData('joined');
			$elem.removeData('stack');
			
		},
		
		
		/**
		* The function that gets called when the attached events fire. Dynamically fires a method based on event type
		* @private
		* @param {Object} e Carrying the event data
		*/
		_delegate: function(e){
			
			$.event.special[keystrokes]['_' + e.type].call($.event.special[keystrokes], e, this);
			
		},
		
		/**
		* When a new event is bound, we want to assign the namespace dynamically for each keystroke collection
		* This makes it easy for unbinding and removing the listening for certain keys
		* @private
		* @param {Array} data_stack Collection of all keystrokes bound to a specific event
		* @param {Array} namespace Namespace that is associated with the event
		* @param {Function} handler The custom function handler for this key set
		*/
		_addPrivateKeys: function(data_stack, namespace, handler){
			
			var i = data_stack.length;
			
			while(i--){
				// Public - entire namespace including the event type
				data_stack[i].name = (namespace) ? keystrokes + '.' + namespace : keystrokes;
				// Private - either the namespace or event type
				data_stack[i]._namespace = namespace || keystrokes;
				delete handler.data;
				data_stack[i]._handler = handler;
			}
			
			return data_stack;
			
		},
		
		/**
		* Unbinding an event isn't enough, we need to remove the keys that the document is listening for
		* @private
		* @param {String} name The namespace of the key set we're removing/unbinding
		*/
		_removeKeyListeners: function(name){
			
			var $elem = $(this),
				stack = $elem.data('stack'),
				stack_len = stack.length;
			
			while(stack_len--){
				
				if(stack[stack_len]._namespace === name){
					stack.splice(stack_len, 1);
				}
				
			};
			
			$elem.data('stack', stack);
			
		},
		
		/**
		* The keydown event that gets fired.  Adds the keycode pressed to an array for _keyup() to check later
		* @private
		* @param {Object} event All event data
		* @param {Object} elem The DOM element that we have bound the event to
		*/
		_keydown: function(event, elem){
			
			var $elem = $(elem),
				self = this,
				temp_keys_down = $elem.data('keys_down');
				
			// Make sure we only capture keystrokes on inputs if it is bound directly to the input
			if(elem != event.target && (/textarea|select/i.test(event.target.nodeName) || event.target.type === "text")){
				return;
			}
			
			temp_keys_down.push(event.keyCode);
			$elem.data('keys_down', temp_keys_down);
			$elem.data('joined', false);
			
		},
		
		/**
		* The keyup event that gets fired.  Checks the keys_down array against the set keys to find if anything matched
		* @private
		* @param {Object} event All event data
		* @param {Object} elem The DOM element that we have bound the event to
		*/
		_keyup: function(event, elem){
			
			var k = event.keyCode,
				$elem = $(elem),
				stack = $elem.data('stack'),
				keys_down = $elem.data('keys_down'),
				keys_string = $elem.data('keys_string'),
				stack_len = stack.length;
			
			// Make sure we only capture keystrokes on inputs if it is bound directly to the input
			if(elem != event.target && (/textarea|select/i.test(event.target.nodeName) || event.target.type === "text")){
				return;
			}
			
			if(keys_down.length > 1){
				
				keys_string.push(this._joinKeyCodesToString(elem));
				$elem.data('keys_string', keys_string);
				$elem.data('joined', true);
				this._log(keys_string);
				
			}
			else {
				
				str = this._getStringFromCode(k);
				
			}
			
			if(!$elem.data('joined')){
			
				keys_string.push(str);
				$elem.data('keys_string', keys_string);
				this._log(keys_string);
				
			}
			
			// Check if we've found a matching key pattern
			var i = stack_len,
				keys_s = ('|' + keys_string.join('|') + '|');
			
			
			while(i--){
				if(stack[i] && keys_s.indexOf('|' + stack[i].keys.join('|') + '|') !== -1){
					this._valid(elem, event, stack, i);
				}
			}
			
			$elem.data('keys_down', []);
			
		},
		
		/**
		* Turns the key codes into a string and concatenates them with the + sign
		* @private
		* @param {Object} elem The DOM element that we have bound the event to
		*/
		_joinKeyCodesToString: function(elem){
		
			var $elem = $(elem),
				keys = $elem.data('keys_down'),
				keys_len = keys.length,
				arr = [],
				i = 0;
			
			while(i < keys_len){
				arr.push(this._getStringFromCode(keys[i]));
				i++;
			}
			
			return arr.join('+');
			
		},
		
		/**
		* Returns the string name from the event.keyCode
		* @private
		* @param {Number} code The key pressed (event.keyCode number)
		*/
		_getStringFromCode: function(code){
	
			if(this.codes[code]){
				return this.codes[code];
			}
			else {
				this._log('Keycode ' + code + ' was not found. You can add it by calling $.extend($.event.special.keystrokes.codes, { ' + code + ' : \'my key\' });');
				return 'undefined';
			}
		
		},
		
		/**
		* Runs if the keys pressed match any given key stack item
		* @private
		* @param {Object} elem The DOM element that we have bound the event to
		* @param {Object} event All event data
		* @param {Array} stack A collection of all possible stacks
		* @param {Number} stack_arr_key A numberic array key for the valid stack item
		*/
		_valid: function(elem, event, stack, stack_arr_key){
			
			event.type = keystrokes;
			event[keystrokes] = {};
			event[keystrokes]['stack'] = stack;
			event[keystrokes].stack_item = stack[stack_arr_key];
			
			// Global custom validation (not documented)
			if(typeof(this.global.customValidation) === 'function'){
				var ret = this.global.customValidation.call(elem, event, stack);
				if(!ret){
					this._clearKeysString(elem);
					return;
				}
			}
			
			// Custom validation to find out whether or not we can proceed
			if(typeof(stack[stack_arr_key].customValidation) === 'function'){
				var ret = stack[stack_arr_key].customValidation.call(elem, event, stack);
				if(!ret){
					this._clearKeysString(elem);
					return;
				}
			}
			
			// Custom callback specific to that key item
			if(typeof(stack[stack_arr_key].success) === 'function'){
				stack[stack_arr_key].success.call(elem, event);
			}
			
			// Global callback for all successfully typed key items
			if(stack[stack_arr_key].proceedToMainCallback !== false){
				stack[stack_arr_key]._handler.apply(elem, [event]);
			}
			
			this._clearKeysString(elem);
			
		
		},
		
		/**
		* Clear all the keys typed that were successfull
		* @private
		* @param {Object} e The HTML element that has the keys_string data bound to it
		*/
		_clearKeysString: function(e){
			
			$(e).data('keys_string', []);
			
		},
		
		/**
		* Log everything with console.log (if found)
		* @private
		* @param {String} str The string we want to output to the logger
		*/
		_log: function(str){
			
			if(this.debug && typeof(window.console) !== 'undefined' && window.console.log){
				console.log(str);
			}
			
		},
		
		/**
		* A ginormous list of keyCodes and their corresponding string - this is extendable by calling
		* $.extend($.event.special.keystrokes.codes, { 13 : 'my_fake_enter_key' });
		* Then you would be able to use ['my_fake_enter_key', 'h', 'i']
		* @public
		*/
		codes: {
			8 : 'backspace',
			9 : 'tab',
			13 : 'enter',
			16 : 'shift',
			17 : 'ctrl',
			18 : 'alt',
			19 : 'pause/break',
			20 : 'caps lock',
			27 : 'escape',
			33 : 'page up',
			32 : 'space',
			34 : 'page down',
			35 : 'end',
			36 : 'home',
			37 : 'arrow left',
			38 : 'arrow up',
			39 : 'arrow right',
			40 : 'arrow down',
			44 : 'print screen',
			45 : 'insert',
			46 : 'delete',
			48 : '0',
			49 : '1',
			50 : '2',
			51 : '3',
			52 : '4',
			53 : '5',
			54 : '6',
			55 : '7',
			56 : '8',
			57 : '9',
			59 : 'semi-colon',
			61 : 'add',
			65 : 'a',
			66 : 'b',
			67 : 'c',
			68 : 'd',
			69 : 'e',
			70 : 'f',
			71 : 'g',
			72 : 'h',
			73 : 'i',
			74 : 'j',
			75 : 'k',
			76 : 'l',
			77 : 'm',
			78 : 'n',
			79 : 'o',
			80 : 'p',
			81 : 'q',
			82 : 'r',
			83 : 's',
			84 : 't',
			85 : 'u',
			86 : 'v',
			87 : 'w',
			88 : 'x',
			89 : 'y',
			90 : 'z',
			91 : 'left window key',
			92 : 'right window key',
			93 : 'select key',
			96 : 'numpad 0',
			97 : 'numpad 1',
			98 : 'numpad 2',
			99 : 'numpad 3',
			100 : 'numpad 4',
			101 : 'numpad 5',
			102 : 'numpad 6',
			103 : 'numpad 7',
			104 : 'numpad 8',
			105 : 'numpad 9',
			106 : 'multiply',
			107 : 'add',
			109 : 'subtract',
			110 : 'decimal point',
			111 : 'divide',
			112 : 'f1',
			113 : 'f2',
			114 : 'f3',
			115 : 'f4',
			116 : 'f5',
			117 : 'f6',
			118 : 'f7',
			119 : 'f8',
			120 : 'f9',
			121 : 'f10',
			122 : 'f11',
			123 : 'f12',
			144 : 'num lock',
			145 : 'scroll lock',
			182 : 'my computer (multimedia keyboard)',
			183 : 'my calculator (multimedia keyboard)',
			186 : 'semi-colon',
			187 : 'equal sign',
			188 : 'comma',
			189 : 'dash',
			190 : 'period',
			191 : 'forward slash',
			192 : 'tilde',
			219 : 'open bracket',
			220 : 'back slash',
			221 : 'close bracket',
			222 : 'single quote',
			224 : 'command'
		}
		
	}
	
})(jQuery);