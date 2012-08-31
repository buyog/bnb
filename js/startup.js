// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

require.config({
    paths: {
        'atto': '../../../atto',
        'tangle': '../../../tangle'
    }
});
require(
    ["atto/core", "Game"],
    function(atto, Game) {
    "use strict";

        var txtStatus = document.querySelector('#status'),
            main      = new Game({
                canvas: document.querySelector('canvas'),
                overlay: document.querySelector('#overlay')
            });
        window.game = main;

        // StateManager event callbacks
        function stateChange(data) {
            _log( atto.supplant("Entered state {id}: {title}", data) );
        }
        stateChange(main.states.currentState());
        main.states.events.changeState.watch(stateChange);

        // main "game" loop
        function _loop() {
            main.tick();
            requestAnimationFrame(_loop);
        }
        requestAnimationFrame(_loop);


        // helper functions

        function _log(msg) {
            console.log(msg);
            txtStatus.appendChild(document.createTextNode(msg));
            txtStatus.appendChild(document.createElement('br'));
        }


        // DOM event handlers

    }
);
