var meiosis =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var meiosis_1 = __webpack_require__(1);
	exports.init = meiosis_1.init;
	exports.REFUSE_UPDATE = meiosis_1.REFUSE_UPDATE;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var merge_1 = __webpack_require__(2);
	var wire_1 = __webpack_require__(3);
	var REFUSE_UPDATE = {};
	exports.REFUSE_UPDATE = REFUSE_UPDATE;
	function init(adapters) {
	    var allReceiveUpdates = [];
	    var allReadies = [];
	    var allPostRenders = [];
	    var createRootWire = adapters.rootWire || wire_1.defaultWireCreator();
	    var createComponentWire = adapters.componentWire || wire_1.defaultWireCreator();
	    var rootWire = createRootWire("meiosis");
	    var merge = adapters.merge || merge_1.defaultMerge;
	    var rootModel = null;
	    var createComponent = function (config) {
	        if (!config || (!config.actions &&
	            !config.nextUpdate &&
	            !config.initialModel &&
	            !config.ready &&
	            !config.receiveUpdate &&
	            !config.view)) {
	            throw new Error("Please specify a config when calling createComponent.");
	        }
	        var initialModel = config.initialModel || {};
	        rootModel = (rootModel === null) ? initialModel : merge(rootModel, initialModel);
	        var componentWire = createComponentWire();
	        var sendUpdate = componentWire.emit;
	        var sendUpdateActions = { sendUpdate: sendUpdate };
	        var actions = config.actions ? merge(sendUpdateActions, config.actions(sendUpdate)) : sendUpdateActions;
	        var receiveUpdate = config.receiveUpdate;
	        if (receiveUpdate) {
	            allReceiveUpdates.push(receiveUpdate);
	        }
	        var ready = config.ready;
	        if (ready) {
	            allReadies.push(function () { return ready(actions); });
	        }
	        var postRender = config.postRender;
	        if (postRender) {
	            allPostRenders.push(postRender);
	        }
	        componentWire.listen(function (update) {
	            var accepted = true;
	            for (var i = 0; i < allReceiveUpdates.length; i++) {
	                var receiveUpdate_1 = allReceiveUpdates[i];
	                var receivedUpdate = receiveUpdate_1(rootModel, update);
	                if (receivedUpdate === REFUSE_UPDATE) {
	                    accepted = false;
	                    break;
	                }
	                else {
	                    rootModel = receivedUpdate;
	                }
	            }
	            ;
	            if (accepted) {
	                rootWire.emit(rootModel);
	                if (config.nextUpdate) {
	                    config.nextUpdate(rootModel, update, actions);
	                }
	            }
	        });
	        return function (model) { return config.view(model, actions); };
	    };
	    var run = function (root) {
	        if (allReceiveUpdates.length === 0) {
	            allReceiveUpdates.push(merge);
	        }
	        var renderRoot = function (model) {
	            var rootView = root(model);
	            adapters.render(rootView);
	            allPostRenders.forEach(function (postRender) { return postRender(rootView); });
	        };
	        rootWire.listen(renderRoot);
	        rootWire.emit(rootModel);
	        allReadies.forEach(function (ready) { return ready(); });
	        return renderRoot;
	    };
	    var meiosisInstance = {
	        createComponent: createComponent,
	        run: run
	    };
	    return meiosisInstance;
	}
	exports.init = init;
	;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var defaultMerge = function (target) {
	    var sources = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        sources[_i - 1] = arguments[_i];
	    }
	    if (target === undefined || target === null) {
	        throw new TypeError("Cannot convert undefined or null to object");
	    }
	    var output = Object(target);
	    for (var index = 1; index < arguments.length; index++) {
	        var source = arguments[index];
	        if (source !== undefined && source !== null) {
	            for (var nextKey in source) {
	                if (source.hasOwnProperty(nextKey)) {
	                    output[nextKey] = source[nextKey];
	                }
	            }
	        }
	    }
	    return output;
	};
	exports.defaultMerge = defaultMerge;


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	function defaultWireCreator() {
	    var wires = {};
	    var nextWireId = 1;
	    var createWire = function () {
	        var listener = null;
	        var listen = function (lstnr) { return listener = lstnr; };
	        var emit = function (update) { return listener(update); };
	        return { emit: emit, listen: listen };
	    };
	    return function (wireName) {
	        var name = wireName;
	        if (!name) {
	            name = "wire_" + nextWireId;
	            nextWireId++;
	        }
	        var theWire = wires[name];
	        if (!theWire) {
	            theWire = createWire();
	            wires[name] = theWire;
	        }
	        return theWire;
	    };
	}
	exports.defaultWireCreator = defaultWireCreator;
	;


/***/ }
/******/ ]);
//# sourceMappingURL=meiosis.js.map