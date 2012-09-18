/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

require.config({
    paths: {
        'atto': '/atto',
        'tangle': '/tangle'
    },
    urlArgs: "bust=" + (new Date()).getTime()
});
require(
    ["atto/core", "Game", "polyfills"],
    function(atto, Game) {
    "use strict";

        var main = new Game({
                canvas: document.querySelector('canvas')
            });
        window.game = main;     // for debug; eventually we'll wanna take this out

        // main "game" loop
        function _loop() {
            main.update();
            main.render();
            requestAnimationFrame(_loop);
        }
        requestAnimationFrame(_loop);


        // helper functions

        function _log(msg) {
            console.log(msg);
        }

    } // end of require callback
);
