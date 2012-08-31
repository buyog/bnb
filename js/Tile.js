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
        /*var _tileFruits = [
            'strawberry',
            'cherry',
            'orange',
            'lemon',
            'apple',
            'mulberry',
            'grape'
        ];*/

        function constructor(color) {
            var _color = (color != undefined) ? color : Math.floor(Math.random()*7);

            function _del() {
                this.color = -1;    // TODO: add timed animation
            }

            function _render(ctx, x, y) {
                var sx = (_color * 36) + 1,
                    tiles = game.assets.getAsset('berries');
                ctx.drawImage(tiles, sx, 1, 34, 34, x, y, 20, 20);
                //ctx.fillStyle = (_color > -1) ? _tileStyles[_color] : "black";
                //ctx.fillRect(x,y, 20, 20);
            }

            function _str() {
                return _tileStyles[_color];
            }

            return {
                color : _color,
                remove: _del,
                render: _render,
                toString: _str
            }

        } // end of constructor

        return constructor;
    } // end AMD callback function
);
