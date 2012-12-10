/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

define(
    ["atto/pubsub"],
    function(pubsub) {
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
                _currentState = 0,
                _i = _index,
                _newIndex = -1,
                _animTime = 0,
                _yOffset = 0,
                _events = _parentEvents,
                _deleted = false,
                _states = {
                    'default':0,
                    'active':1,
                    'cleared':2,
                    'falling':3
                };

            function _del() {
                _deleted = true;
                _animTime = 15;
            }

            function _dropTo(newIndex) {
                var distance = newIndex - _i,
                    oldIndex = _i;
                if (distance > 0 && distance <= 8) {
                    if (this.fixedFalling) {

                        // TODO: instead of dropping, THEN reindexing, we should reindex first.
                        //   that'll keep the gravity function simpler. (that appears to be the problem...
                        //   we've got a tile moving into the empty cell already, and gravity triggers another one
                        //   because it's still empty on the next tick)

                        //_newIndex = newIndex;
                        //_currentState = _states.falling;
                        //_animTime = 12 * distance;
                        //_yOffset = 0;


                        //_newIndex = newIndex;
                        _currentState = _states.falling;
                        _animTime = distance; //12 * distance;
                        //_animTime = 1;
                        _yOffset = -24;
                        _i = newIndex;
                        _events.onTileDropped.dispatch({old_index:oldIndex,new_index:newIndex});
                        pubsub.publish('bnb.tile.onTileDropped', {old_index:oldIndex,new_index:newIndex});

                    } else {
                        // for now, short-circuit the drop anim to immediately move to the new cell
                        _i = newIndex;
                        _events.onTileDropped.dispatch({old_index:oldIndex,new_index:newIndex});
                        pubsub.publish('bnb.tile.onTileDropped', {old_index:oldIndex,new_index:newIndex});
                    }

                } else {
                    console.log('invalid drop distance:', _i, ' to ', newIndex);
                }
            }

            function _tick(game) {
                switch (_currentState) {
                    case _states.default:
                        if (_deleted) {
                            _currentState = _states.cleared;
                        }
                        break;
                    case _states.active:
                        break;
                    case _states.cleared:
                        break;
                    case _states.falling:
                        break;
                    default:
                        break;
                }
            }

            function _render(ctx, x, y) {
                var sx = (_color * 36) + 1,
                    tiles = game.assets.getAsset('berries'),
                    old_index;

                switch (_currentState) {
                    case _states.default:
                        // no need to draw animated version; just draw normally
                        ctx.drawImage(tiles, sx, 1, 34, 34, x, y, 30, 30);
                        break;

                    case _states.active:
                        // draw tile normally, then draw a circle around it
                        ctx.drawImage(tiles, sx, 1, 34, 34, x, y, 30, 30);

                        // draw a circle around the selected tile(s)
                        ctx.fillStyle = "rgba(255,255,255, 0.35)";
                        ctx.beginPath();
                        ctx.arc(x + 15, y + 15, 17, 0, Math.PI*2, true);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        break;

                    case _states.cleared:
                        if (_animTime > 0) {
                            ctx.fillStyle = "white";

                            ctx.beginPath();
                            ctx.arc(x + 15, y + 15, _animTime, 0, Math.PI*2, true);
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();

                            _animTime--;

                        } else if (_animTime == 0) {
                            _animTime = -1;
                            pubsub.publish('bnb.tile.onTileRemove', {index:_i});
                        } else {
                            _animTime = 0;
                        }
                        break;

                    case _states.falling:
                        if (_animTime) {
                            _yOffset += 24;
                            _animTime--;
                            ctx.drawImage(tiles, sx, 1, 34, 34, x, y+_yOffset, 30, 30);

                        } else if (_animTime == 0) {
                            //_animTime = -1;
                            _currentState = _states.default;
                            //old_index = _i;
                            //_i = _newIndex;
                            //_events.onTileDropped.dispatch({old_index:old_index, new_index:_newIndex});
                        } else {
                            _animTime = 0;
                        }
                        break;

                    default:
                        break;
                }
            }

            function _select() {
                _currentState = _states.active;
            }

            function _deselect() {
                _currentState = _states.default;
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
                dropTo   : _dropTo,
                render   : _render,
                setIndex : _setIndex,
                tick     : _tick,
                getState : function() { return _currentState; },
                isDeleted: function() { return _deleted; },
                select   : _select,
                deselect : _deselect
            }

        } // end of constructor

        return constructor;
    } // end AMD callback function
);
