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
        var _tileStyles = [
            'red',
            'orange',
            'yellow',
            'green',
            'blue',
            'purple',
            'silver',
            'pink'
        ];

        function constructor(_parentEvents, _index, color) {
            var _color = (color != undefined) ? color : Math.floor(Math.random()*7),
                _i = _index,
                _animTime = 0,
                _events = _parentEvents,
                _deleted = false;

            function _del() {
                _deleted = true;
                _animTime = 5;
            }

            function _render(ctx, x, y) {
                if (_animTime) {
                    // figure out how to animate
                    ctx.fillStyle = "white";
                    ctx.fillRect(x-_animTime,y-_animTime, 20+(_animTime*2), 20+(_animTime*2));
                    _animTime--;
                    if (_animTime <= 0) {
                        _events.onTileRemove.dispatch({index:_i});
                        //return false;
                    }
                } else {
                    // no need to draw animated version; just draw normally
                    ctx.fillStyle = (_color > -1) ? _tileStyles[_color] : "black";
                    ctx.fillRect(x,y, 20, 20);
                }
                return true;
            }

            function _setIndex(index) {
                _i = index;
            }

            function _str() {
                return _tileStyles[_color];
            }

            return {
                color    : _color,
                remove   : _del,
                render   : _render,
                setIndex : _setIndex,
                isDeleted: function() { return _deleted },
                toString : _str
            }

        } // end of constructor

        return constructor;
    } // end AMD callback function
);
