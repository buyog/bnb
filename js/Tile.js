/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

define(
    [],
    function() {
    "use strict";
        function constructor(color) {
            var _color = (color != undefined) ? color : Math.floor(Math.random()*7);

            function _del() {
                this.color = -1;    // TODO: add timed animation
            }

            return {
                color : _color,
                remove: _del
            }

        } // end of constructor

        return constructor;
    } // end AMD callback function
);
