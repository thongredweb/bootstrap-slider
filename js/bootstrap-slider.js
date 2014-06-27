/* =========================================================
 * bootstrap-slider.js v3.0.0
 * =========================================================
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function( $ ) {

	var ErrorMsgs = {
		formatInvalidInputErrorMsg : function(input) {
			return "Invalid input value '" + input + "' passed in";
		},
		callingContextNotSliderInstance : "Calling context element does not have instance of Slider bound to it. Check your code to make sure the JQuery object returned from the call to the slider() initializer is calling the method"
	};



	/*************************************************
					
						CONSTRUCTOR

	**************************************************/
	function Slider(element, options) {
		/*************************************************
					
						Create Markup

		**************************************************/
		this.element = document.querySelectorAll(element);
		var origWidth = this.element.style.width;
		var updateSlider = false;

		var parent = this.element.parentNode;
		var sliderAlreadyExists = parent.className.search("(?:\\s|^)slider(?:\\s|$)");

		if (sliderAlreadyExists) {
			updateSlider = true;
			this.sliderElem = parent;
		} else {
			/* Create elements needed for slider */
			this.sliderElem = document.createElement("div");
			this.sliderElem.className = "slider";

			/* Create slider track elements */
			var sliderTrack = document.createElement("div");
			sliderTrack.className = "slider-track";

			var sliderTrackSelection = document.createElement("div");
			sliderTrackSelection.className = "slider-selection";

			var sliderMinHandle = document.createElement("div");
			sliderMinHandle.className = "slider-handle min-slider-handle";

			var sliderMaxHandle = document.createElement("div");
			sliderMaxHandle.className = "slider-handle max-slider-handle";

			sliderTrack.appendChild(sliderTrackSelection);
			sliderTrack.appendChild(sliderMinHandle);
			sliderTrack.appendChild(sliderMaxHandle);

			/* Create tooltip elements */
			var sliderTooltip = document.createElement("div");
			sliderTooltip.className = "tooltip";
			createAndAppendTooltipSubElements(sliderTooltip);

			var sliderTooltipMin = document.createElement("div");
			sliderTooltipMin.className = "tooltip tooltip-min";
			createAndAppendTooltipSubElements(sliderTooltip);

			var sliderTooltipMax = document.createElement("div");
			sliderTooltipMax.className = "tooltip tooltip-max";
			createAndAppendTooltipSubElements(sliderTooltip);


			/* Append components to sliderElem */
			this.sliderElem.appendChild(sliderTrack);
			this.sliderElem.appendChild(sliderTooltip);
			this.sliderElem.appendChild(sliderTooltipMin);
			this.sliderElem.appendChild(sliderTooltipMax);

			/* Append slider element to parent container and hide this.element */
			parent.appendChild(this.sliderElem);
			this.sliderElem.style.display = "none";

			function createAndAppendTooltipSubElements(tooltipElem) {
				var arrow = document.createElement("div");
				arrow.className = "tooltip-arrow";

				var inner = document.createElement("div");
				inner.className = "tooltip-inner";

				tooltipElem.appendChild(arrow);
				tooltipElem.appendChild(inner);
			}
		}

		/*************************************************
					
						Process Options

		**************************************************/

		var optionTypes = Object.keys(this.options);
		for(var i = 0; i < optionTypes.length; i++) {
			var optName = optionTypes[i];

			// First check the data atrributes
			var val = getDataAttrib(this.element, optName);
			// If no data attrib, then check if an option was passed in via the constructor
			val = val ? val : options[optName];
			// Finally, if nothing was specified, use the defaults
			val = val ? val : this.options[optName];

			this.options[optName] = val;
		}

		function getDataAttrib(element, optName) {
			var dataValString;

			if(element.dataset) {
				dataValString = element.dataset[optName];
			} else {
				var dataName = "data-slider-" + optName;
				dataValString = msglist.getAttribute(dataName);
			}

			return JSON.parse(dataValString);
		}


		/*************************************************
					
							Setup

		**************************************************/
		this.sliderElem.id = this.options.id;

		this.touchCapable = 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch;

		this.tooltip = this.sliderElem.querySelector('.tooltip');
		this.tooltipInner = this.tooltip.querySelector('.tooltip-inner');

		this.tooltip_min = this.sliderElem.find('.tooltip-min');
		this.tooltipInner_min = this.tooltip_min.find('.tooltip-inner');

		this.tooltip_max = this.sliderElem.find('. tooltip-max');
		this.tooltipInner_max= this.tooltip_max.find('.tooltip-inner');

		if (updateSlider === true) {
			// Reset classes
			removeClass(this.sliderElem, 'slider-horizontal');
			removeClass(this.sliderElem, 'slider-vertical');
			removeClass(this.tooltip, 'hide');
			removeClass(this.tooltip_min, 'hide');
			removeClass(this.tooltip_max, 'hide');
		}

		this.orientation = this.options.orientation;
		if(this.orientation === 'vertical') {
			addClass(this.sliderElem,'slider-vertical');
			
			this.stylePos = 'top';
			this.mousePos = 'pageY';
			this.sizePos = 'offsetHeight';

			addClass(this.tooltip, 'right');
			this.tooltip.style.left = '100%';
			
			addClass(this.tooltip_min, 'right');
			this.tooltip_min.style.left = '100%';

			addClass(this.tooltip_max, 'right');
			this.tooltip_max.style.left = '100%';
		} else {
			addClass(this.sliderElem, 'slider-horizontal');
			this.sliderElem.style.width = origWidth;

			this.orientation = 'horizontal';
			this.stylePos = 'left';
			this.mousePos = 'pageX';
			this.sizePos = 'offsetWidth';
			
			addClass(this.tooltip, 'top');
			this.tooltip.style.top = -this.tooltip.outerHeight - 14 + 'px';
			
			addClass(this.tooltip_min, 'top');
			this.tooltip_min.style.top = -this.tooltip_min.outerHeight - 14 + 'px';

			addClass(this.tooltip_max, 'top');
			this.tooltip_max.style.top = -this.tooltip_max.outerHeight - 14 + 'px';
		}

		if (this.options.value instanceof Array) {
			this.options.range = true;
		} else if (this.options.range) {
			// User wants a range, but value is not an array
			this.options.value = [this.options.value, this.options.max];
		}

		this.selectionEl = sliderTrackSelection;
		if (this.options.selection === 'none') {
			addClass(this.selectionEl, 'hide');
		}

		this.selectionElStyle = this.selectionEl.style;

		this.handle1 = sliderMinHandle;
		this.handle1Stype = this.handle1.style;

		this.handle2 = sliderMaxHandle;
		this.handle2Stype = this.handle2.style;

		if (updateSlider === true) {
			// Reset classes
			removeClass(this.handle1, 'round triangle');
			removeClass(this.handle2, 'round triangle hide');
		}

		var availableHandleModifiers = ['round', 'triangle', 'custom'];
		var isValidHandleType = availableHandleModifiers.indexOf(this.options.handle) !== -1;
		if (isValidHandleType) {
			addClass(this.handle1, this.options.handle);
			addClass(this.handle2, this.options.handle);
		}

		this.offset = this.sliderElem.offset(); // TODO: revisit
		this.size = this.sliderElem[this.sizePos];
		
		this.setValue(this.options.value);

		/******************************************
					
						Bind Events

		******************************************/

		// Bind keyboard handlers
		this.handle1.addEventListener("keydown", this.keydown.bind(this, 0), false);
		this.handle2.addEventListener("keydown", this.keydown.bind(this, 1), false);

		if (this.touchCapable) {
			// Bind touch handlers
			this.sliderElem.addEventListener("touchstart", this.mousedown.bind(this, 0), false);
		} else {
			// Bind mouse handlers
			this.sliderElem.addEventListener("mousedown", this.mousedown.bind(this), false);
		}

		// Bind tooltip-related handlers
		if(this.options.tooltip === 'hide') {
			addClass(this.tooltip, 'hide');
			addClass(this.tooltip_min, 'hide');
			addClass(this.tooltip_max, 'hide');
		} else if(tooltip === 'always') {
			this.showTooltip();
			this.alwaysShowTooltip = true;
		} else {
			this.sliderElem.addEventListener("mouseenter", this.showTooltip.bind(this), false);
			this.sliderElem.addEventListener("mouseleave", this.hideTooltip.bind(this), false);

			this.handle1.addEventListener("focus", this.showTooltip.bind(this), false);
			this.handle1.addEventListener("blur", this.hideTooltip.bind(this), false);

			this.handle2.addEventListener("focus", this.showTooltip.bind(this), false);
			this.handle2.addEventListener("blur", this.hideTooltip.bind(this), false);
		}

		if(this.options.enabled) {
			this.enable();
		} else {
			this.disable();
		}
	}

	/*************************************************
					
				INSTANCE PROPERTIES/METHODS

	**************************************************/
	Slider.prototype = {
		constructor: Slider,

		over: false,
		inDrag: false,

		options: {
			id: "",
		  	min: 0,
			max: 10,
			step: 1,
			precision: 0,
			orientation: 'horizontal',
			value: 5,
			range: false,
			selection: 'before',
			tooltip: 'show',
			tooltip_split: false,
			handle: 'round',
			reversed: false,
			enabled: true,
			formatter: function(val) {
				return val;
			},
			natural_arrow_keys: false
		}

		showTooltip: function(){
            if (this.options.tooltip_split === false ){
                this.tooltip.addClass('in');
            } else {
                this.tooltip_min.addClass('in');
                this.tooltip_max.addClass('in');
            }

			this.over = true;
		},

		hideTooltip: function(){
			if (this.inDrag === false && this.alwaysShowTooltip !== true) {
				this.tooltip.removeClass('in');
				this.tooltip_min.removeClass('in');
				this.tooltip_max.removeClass('in');
			}
			this.over = false;
		},

		layout: function(){
			var positionPercentages;

			if(this.reversed) {
				positionPercentages = [ 100 - this.percentage[0], this.percentage[1] ];
			} else {
				positionPercentages = [ this.percentage[0], this.percentage[1] ];
			}

			this.handle1Stype[this.stylePos] = positionPercentages[0]+'%';
			this.handle2Stype[this.stylePos] = positionPercentages[1]+'%';

			if (this.orientation === 'vertical') {
				this.selectionElStyle.top = Math.min(positionPercentages[0], positionPercentages[1]) +'%';
				this.selectionElStyle.height = Math.abs(positionPercentages[0] - positionPercentages[1]) +'%';
			} else {
				this.selectionElStyle.left = Math.min(positionPercentages[0], positionPercentages[1]) +'%';
				this.selectionElStyle.width = Math.abs(positionPercentages[0] - positionPercentages[1]) +'%';

                var offset_min = this.tooltip_min[0].getBoundingClientRect();
                var offset_max = this.tooltip_max[0].getBoundingClientRect();

                if (offset_min.right > offset_max.left) {
                    this.tooltip_max.removeClass('top');
                    this.tooltip_max.addClass('bottom')[0].style.top = 18 + 'px';
                } else {
                    this.tooltip_max.removeClass('bottom');
                    this.tooltip_max.addClass('top')[0].style.top = -30 + 'px';
                }
			}

			if (this.range) {
				this.tooltipInner.text(
					this.options.formatter(this.options.value[0]) + this.options.formatter(this.options.value[1])
				);
				this.tooltip[0].style[this.stylePos] = (positionPercentages[1] + positionPercentages[0])/2 + '%';
				if (this.orientation === 'vertical') {
					this.tooltip.css('margin-top', -this.tooltip.outerHeight() / 2 + 'px');
				} else {
					this.tooltip.css('margin-left', -this.tooltip.outerWidth() / 2 + 'px');
				}
				
				if (this.orientation === 'vertical') {
					this.tooltip.css('margin-top', -this.tooltip.outerHeight() / 2 + 'px');
				} else {
					this.tooltip.css('margin-left', -this.tooltip.outerWidth() / 2 + 'px');
				}
				this.tooltipInner_min.text(
					this.options.formatter(this.options.value[0])
				);
				this.tooltipInner_max.text(
					this.options.formatter(this.options.value[1])
				);

				this.tooltip_min[0].style[this.stylePos] = positionPercentages[0] + '%';
				if (this.orientation === 'vertical') {
					this.tooltip_min.css('margin-top', -this.tooltip_min.outerHeight() / 2 + 'px');
				} else {
					this.tooltip_min.css('margin-left', -this.tooltip_min.outerWidth() / 2 + 'px');
				}
				this.tooltip_max[0].style[this.stylePos] = positionPercentages[1] + '%';
				if (this.orientation === 'vertical') {
					this.tooltip_max.css('margin-top', -this.tooltip_max.outerHeight() / 2 + 'px');
				} else {
					this.tooltip_max.css('margin-left', -this.tooltip_max.outerWidth() / 2 + 'px');
				}
			} else {
				this.tooltipInner.text(
					this.options.formatter(this.options.value[0])
				);
				this.tooltip[0].style[this.stylePos] = positionPercentages[0] + '%';
				if (this.orientation === 'vertical') {
					this.tooltip.css('margin-top', -this.tooltip.outerHeight() / 2 + 'px');
				} else {
					this.tooltip.css('margin-left', -this.tooltip.outerWidth() / 2 + 'px');
				}
			}
		},

		mousedown: function(ev) {
			if(!this.options.enabled) {
				return false;
			}
			// Touch: Get the original event:
			if (this.touchCapable && ev.type === 'touchstart') {
				ev = ev.originalEvent;
			}

			this.triggerFocusOnHandle();

			this.offset = this.sliderElem.offset();
			this.size = this.sliderElem[0][this.sizePos];

			var percentage = this.getPercentage(ev);

			if (this.range) {
				var diff1 = Math.abs(this.percentage[0] - percentage);
				var diff2 = Math.abs(this.percentage[1] - percentage);
				this.dragged = (diff1 < diff2) ? 0 : 1;
			} else {
				this.dragged = 0;
			}

			this.percentage[this.dragged] = this.reversed ? 100 - percentage : percentage;
			this.layout();

			if (this.touchCapable) {
				// Touch: Bind touch events:
				$(document).on({
					touchmove: $.proxy(this.mousemove, this),
					touchend: $.proxy(this.mouseup, this)
				});
			}
			// Bind mouse events:
			$(document).on({
				mousemove: $.proxy(this.mousemove, this),
				mouseup: $.proxy(this.mouseup, this)
			});

			this.inDrag = true;
			var val = this.calculateValue();
			this.element.trigger({
					type: 'slideStart',
					value: val
				})
				.data('value', val)
				.prop('value', val);
			this.setValue(val);
			return true;
		},

		triggerFocusOnHandle: function(handleIdx) {
			if(handleIdx === 0) {
				this.handle1.focus();
			}
			if(handleIdx === 1) {
				this.handle2.focus();
			}
		},

		keydown: function(handleIdx, ev) {
			if(!this.options.enabled) {
				return false;
			}

			var dir;
			switch (ev.which) {
				case 37: // left
				case 40: // down
					dir = -1;
					break;
				case 39: // right
				case 38: // up
					dir = 1;
					break;
			}
			if (!dir) {
				return;
			}

			// use natural arrow keys instead of from min to max
			if (this.options.natural_arrow_keys) {
				if ((this.orientation === 'vertical' && !this.reversed) || (this.orientation === 'horizontal' && this.reversed)) {
					dir = dir * -1;
				}
			}

			var oneStepValuePercentageChange = dir * this.percentage[2];
			var percentage = this.percentage[handleIdx] + oneStepValuePercentageChange;

			if (percentage > 100) {
				percentage = 100;
			} else if (percentage < 0) {
				percentage = 0;
			}

			this.dragged = handleIdx;
			this.adjustPercentageForRangeSliders(percentage);
			this.percentage[this.dragged] = percentage;
			this.layout();

			var val = this.calculateValue();
			
			this.element.trigger({
					type: 'slideStart',
					value: val
				})
				.data('value', val)
				.prop('value', val);

			this.setValue(val, true);

			this.element
				.trigger({
					type: 'slideStop',
					value: val
				})
				.data('value', val)
				.prop('value', val);
			return false;
		},

		mousemove: function(ev) {
			if(!this.options.enabled) {
				return false;
			}
			// Touch: Get the original event:
			if (this.touchCapable && ev.type === 'touchmove') {
				ev = ev.originalEvent;
			}

			var percentage = this.getPercentage(ev);
			this.adjustPercentageForRangeSliders(percentage);
			this.percentage[this.dragged] = this.reversed ? 100 - percentage : percentage;
			this.layout();

			var val = this.calculateValue();
			this.setValue(val, true);

			return false;
		},
		adjustPercentageForRangeSliders: function(percentage) {
			if (this.range) {
				if (this.dragged === 0 && this.percentage[1] < percentage) {
					this.percentage[0] = this.percentage[1];
					this.dragged = 1;
				} else if (this.dragged === 1 && this.percentage[0] > percentage) {
					this.percentage[1] = this.percentage[0];
					this.dragged = 0;
				}
			}
		},

		mouseup: function() {
			if(!this.options.enabled) {
				return false;
			}
			if (this.touchCapable) {
				// Touch: Unbind touch event handlers:
				$(document).off({
					touchmove: this.mousemove,
					touchend: this.mouseup
				});
			}
			// Unbind mouse event handlers:
			$(document).off({
				mousemove: this.mousemove,
				mouseup: this.mouseup
			});

			this.inDrag = false;
			if (this.over === false) {
				this.hideTooltip();
			}
			var val = this.calculateValue();
			this.layout();
			this.element
				.data('value', val)
				.prop('value', val)
				.trigger({
					type: 'slideStop',
					value: val
				});
			return false;
		},

		calculateValue: function() {
			var val;
			if (this.range) {
				val = [this.min,this.max];
                if (this.percentage[0] !== 0){
                    val[0] = (Math.max(this.min, this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step));
                    val[0] = this.applyPrecision(val[0]);
                }
                if (this.percentage[1] !== 100){
                    val[1] = (Math.min(this.max, this.min + Math.round((this.diff * this.percentage[1]/100)/this.step)*this.step));
                    val[1] = this.applyPrecision(val[1]);
                }
				this.options.value = val;
			} else {
				val = (this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step);
				if (val < this.min) {
					val = this.min;
				}
				else if (val > this.max) {
					val = this.max;
				}
				val = parseFloat(val);
				val = this.applyPrecision(val);
				this.options.value = [val, this.options.value[1]];
			}
			return val;
		},
		applyPrecision: function(val) {
			var precision = this.precision || this.getNumDigitsAfterDecimalPlace(this.step);
			return this.applyToFixedAndParseFloat(val, precision);
		},
		/*
			Credits to Mike Samuel for the following method!
			Source: http://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
		*/
		getNumDigitsAfterDecimalPlace: function(num) {
			var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
			if (!match) { return 0; }
			return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
		},

		applyToFixedAndParseFloat: function(num, toFixedInput) {
			var truncatedNum = num.toFixed(toFixedInput);
			return parseFloat(truncatedNum);
		},

		getPercentage: function(ev) {
			if (this.touchCapable && (ev.type === 'touchstart' || ev.type === 'touchmove')) {
				ev = ev.touches[0];
			}
			var percentage = (ev[this.mousePos] - this.offset[this.stylePos])*100/this.size;
			percentage = Math.round(percentage/this.percentage[2])*this.percentage[2];
			return Math.max(0, Math.min(100, percentage));
		},

		getValue: function() {
			if (this.range) {
				return this.options.value;
			}
			return this.options.value[0];
		},

		setValue: function(val, triggerSlideEvent) {
			if (!val) {
				val = 0;
			}
			this.options.value = this.validateInputValue(val);

			if (this.range) {
				this.options.value[0] = this.applyPrecision(this.options.value[0]);
				this.options.value[1] = this.applyPrecision(this.options.value[1]); 

				this.options.value[0] = Math.max(this.min, Math.min(this.max, this.options.value[0]));
				this.options.value[1] = Math.max(this.min, Math.min(this.max, this.options.value[1]));
			} else {
				this.options.value = this.applyPrecision(this.options.value);
				this.options.value = [ Math.max(this.min, Math.min(this.max, this.options.value))];
				this.handle2.addClass('hide');
				if (this.selection === 'after') {
					this.options.value[1] = this.max;
				} else {
					this.options.value[1] = this.min;
				}
			}

			this.diff = this.max - this.min;
			if (this.diff > 0) {
				this.percentage = [
					(this.options.value[0] - this.min) * 100 / this.diff,
					(this.options.value[1] - this.min) * 100 / this.diff,
					this.step * 100 / this.diff
				];
			} else {
				this.percentage = [0, 0, 100];
			}

			this.layout();


			if(triggerSlideEvent === true) {
				var slideEventValue = this.range ? this.options.value : this.options.value[0];
				this.element
					.trigger({
						'type': 'slide',
						'value': slideEventValue
					})
					.data('value', slideEventValue)
					.prop('value', slideEventValue);
			}
		},

		validateInputValue : function(val) {
			if(typeof val === 'number') {
				return val;
			} else if(val instanceof Array) {
				$.each(val, function(i, input) { if (typeof input !== 'number') { throw new Error( ErrorMsgs.formatInvalidInputErrorMsg(input) ); }});
				return val;
			} else {
				throw new Error( ErrorMsgs.formatInvalidInputErrorMsg(val) );
			}
		},

		destroy: function(){
			this.handle1.off();
			this.handle2.off();
			this.element.off().show().insertBefore(this.sliderElem);
			this.sliderElem.off().remove();
			$(this.element).removeData('slider');
		},

		disable: function() {
			this.options.enabled = false;
			this.handle1.removeAttr("tabindex");
			this.handle2.removeAttr("tabindex");
			this.sliderElem.addClass('slider-disabled');
			this.element.trigger('slideDisabled');
		},

		enable: function() {
			this.options.enabled = true;
			this.handle1.attr("tabindex", 0);
			this.handle2.attr("tabindex", 0);
			this.sliderElem.removeClass('slider-disabled');
			this.element.trigger('slideEnabled');
		},

		toggle: function() {
			if(this.options.enabled) {
				this.disable();
			} else {
				this.enable();
			}
		},

		setAttribute: function(attribute, value) {
			this[attribute] = value;
		},

		getAttribute: function(attribute) {
			return this[attribute];
		},

		isEnabled: function() {
			return this.options.enabled;
		}

	};








	/******************************+
				
				Helpers

	********************************/
	function removeClass(element, classString) {
		var classes = classString.split(" ");
		var newClasses = element.className;

		for(var i = 0; i < classes.length; i++) {
			var classTag = classes[i];
			var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
			newClasses = newClasses.replace(regex, " ");
		}

		element.className = newClasses.trim();
	}

	function addClass(element, classString) {
		var classes = classString.split(" ");
		var newClasses = element.className;

		for(var i = 0; i < classes.length; i++) {
			var classTag = classes[i];
			var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
			var ifClassExists = regex.test(newClasses);
			
			if(!ifClassExists) {
				newClasses += " " + classTag;
			}
		}

		element.className = newClasses.trim();
	}














	var publicMethods = {
		getValue : Slider.prototype.getValue,
		setValue : Slider.prototype.setValue,
		setAttribute : Slider.prototype.setAttribute,
		getAttribute : Slider.prototype.getAttribute,
		destroy : Slider.prototype.destroy,
		disable : Slider.prototype.disable,
		enable : Slider.prototype.enable,
		toggle : Slider.prototype.toggle,
		isEnabled: Slider.prototype.isEnabled
	};

	$.fn.slider = function (option) {
		if (typeof option === 'string' && option !== 'refresh') {
			var args = Array.prototype.slice.call(arguments, 1);
			return invokePublicMethod.call(this, option, args);
		} else {
			return createNewSliderInstance.call(this, option);
		}
	};

	function invokePublicMethod(methodName, args) {
		if(publicMethods[methodName]) {
			var sliderObject = retrieveSliderObjectFromElement(this);
			var result = publicMethods[methodName].apply(sliderObject, args);

			if (typeof result === "undefined") {
				return $(this);
			} else {
				return result;
			}
		} else {
			throw new Error("method '" + methodName + "()' does not exist for slider.");
		}
	}

	function retrieveSliderObjectFromElement(element) {
		var sliderObject = $(element).data('slider');
		if(sliderObject && sliderObject instanceof Slider) {
			return sliderObject;
		} else {
			throw new Error(ErrorMsgs.callingContextNotSliderInstance);
		}
	}

	function createNewSliderInstance(opts) {
		var $this = $(this);
		$this.each(function() {
			var $this = $(this),
				slider = $this.data('slider'),
				options = typeof opts === 'object' && opts;

			// If slider already exists, use its attributes
			// as options so slider refreshes properly
			if (slider && !options) {
				options = {};

				$.each($.fn.slider.defaults, function(key) {
					options[key] = slider[key];
				});
			}

			$this.data('slider', (new Slider(this, $.extend({}, $.fn.slider.defaults, options))));
		});
		return $this;
	}

	// $.fn.slider.defaults = {
	// 	min: 0,
	// 	max: 10,
	// 	step: 1,
	// 	precision: 0,
	// 	orientation: 'horizontal',
	// 	value: 5,
	// 	range: false,
	// 	selection: 'before',
	// 	tooltip: 'show',
	// 	tooltip_split: false,
	// 	natural_arrow_keys: false,
	// 	handle: 'round',
	// 	reversed : false,
	// 	enabled: true,
	// 	formater: function(value) {
	// 		return value;
	// 	}
	// };

	// $.fn.slider.Constructor = Slider;

})( window.jQuery );