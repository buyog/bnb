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
    }
});
require(
    ["atto/core", "Game", "polyfills"],
    function(atto, Game) {
    "use strict";

        var txtStatus = document.querySelector('#status'),
            main      = new Game({
                canvas: document.querySelector('canvas'),
                overlay: document.querySelector('#overlay')
            });
        window.game = main;     // for debug; eventually we'll wanna take this out

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


        // fullscreen support (much simpler, if a little less robust, than the SitePoint version)
        var btnReqFS   = atto.byId('btnGoFS'),
            fsTarget   = document.querySelector('canvas');

        atto.addLoadEvent(function() {
            // see if we can find a version of requestFullScreen that works
            window.requestFS = fsTarget.requestFullScreen ||
                               fsTarget.webkitRequestFullScreen ||
                               fsTarget.mozRequestFullScreen ||
                               fsTarget.msRequestFullScreen;

            if (window.requestFS) {
                btnReqFS.className = '';
                btnReqFS.disabled = '';
            }
        });


        // DOM event handlers
        atto.addEvent(btnReqFS, 'click', function() {
            if (window.requestFS) requestFS.call(fsTarget);
        });


    } // end of require callback
);
