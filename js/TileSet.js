/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

define(
    ["atto/core", "atto/event", "Tile", "atto/pubsub"],
    function(atto, AttoEvent, Tile, pubsub) {
    "use strict";

        function shuffle(array)
        { // from http://stackoverflow.com/questions/5150665/generate-random-list-of-unique-rows-columns-javascript
            for(var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
            return array;
        };

        function constructor(width, height) {
            var _w  = width || 8,
                _h  = height || 8,
                _ar = [],
                _x0 = 20,
                _y0 = 90,
                _x1 = 300,
                _y1 = 370,
                _selectedTile = null,
                _events = {
                    onTileDropped: new AttoEvent('bnb.tile.onTileDropped')
                };

            // init tile set (can't do earlier, because the tiles need a reference to my events object)
            _ar = _initGrid(_w, _h);

            pubsub.subscribe('bnb.tile.onTileRemove', function(topic, context) {
                var t = _ar[context.index];
                if (t) {
                    console.log(atto.supplant('tile removed: i:{i}, color:{c}', {i:context.index, c:t.color}));
                    //_ar[context.index] = new Tile(_events, context.index);
                    //console.log(_ar[context.index]);

                    _ar[context.index] = null;
                } else {
                    //console.log(atto.supplant('tile removed: i:{i} (already null)', {i:context.index}));
                }
            });
            _events.onTileDropped.watch(function(context) {
                var t = _ar[context.old_index];
                if (t) {
                    var args = {o:context.old_index, n:context.new_index, c:t.color}
                    console.log(atto.supplant('[ev] tile dropped: old_index:{o}, new_index:{n}; color::{c}', args));

                    //_ar[context.new_index] = _ar[context.old_index];
                    //_ar[context.old_index] = null;
                }
            });
            pubsub.subscribe('bnb.tile.onTileDropped', function(topic, context) {
                var t = _ar[context.old_index];
                if (t) {
                    var args = {o:context.old_index, n:context.new_index, c:t.color}
                    console.log(atto.supplant('[ps] tile dropped: old_index:{o}, new_index:{n}; color::{c}', args));

                    _ar[context.new_index] = _ar[context.old_index];
                    _ar[context.old_index] = new Tile(_events, context.old_index);
                }
            });

            function _initGrid(w,h) {
                var x, len=w*h,
                    grid = [];

                for (x=0; x<len; x++) {
                    grid.push( new Tile(_events, x) );
                }
                return grid;
            }

            function _get_click_target(coords) {
                var _ix, _iy;
                //console.log('coords:', coords.x, ',', coords.y);
                if (coords && coords.x && coords.y) {
                    if (coords.x >= _x0 && coords.x <= _x1 &&
                        coords.y >= _y0 && coords.y <= _y1) {

                        _ix = Math.floor((coords.x - _x0) / 36);
                        _iy = Math.floor((coords.y - _y0) / 36);
                        return {
                            x: _ix,
                            y: _iy,
                            idx: (_ix * _h) + _iy
                        }
                    }
                }

                return null;
            }

            function _tick(game, inp) {
                // handle any new inputs
                var dx, dy, tgt = null;
                if (inp) {
                    switch (inp[0]) {
                        case "mouse_click":
                            tgt = _get_click_target(inp[1]);
                            if (tgt !== null) {
                                // handle as a potential tile click
                                if (_selectedTile) {
                                    _ar[tgt.idx].deselect();
                                    _ar[_selectedTile.idx].deselect();

                                    // swap
                                    if (tgt.idx == _selectedTile.idx) {
                                        //console.log('deselecting current tile');
                                    } else {
                                        dx = Math.abs(_selectedTile.x - tgt.x);
                                        dy = Math.abs(_selectedTile.y - tgt.y);
                                        if (dx == 1 && dy == 0) {
                                            // horizontal swap, then check the row & both affected columns
                                            _swap(_selectedTile.x, _selectedTile.y, tgt.x, tgt.y);
                                            _checkRow(_selectedTile.y);
                                            _checkCol(_selectedTile.x);
                                            _checkCol(tgt.x);

                                        } else if (dx == 0 && dy == 1) {
                                            // vertical swap, then check the column & both affected rows
                                            _swap(_selectedTile.x, _selectedTile.y, tgt.x, tgt.y);
                                            _checkCol(_selectedTile.x);
                                            _checkRow(_selectedTile.y);
                                            _checkRow(tgt.y);

                                        }
                                    }

                                    _selectedTile = null;

                                } else {
                                    // no tile selected

                                    // DEBUG: gravity isn't working yet, so it's possible this is a NULL cell
                                    if (_ar[tgt.idx]) {
                                        // select this tile
                                        if (!_ar[tgt.idx].isDeleted()) {
                                            _ar[tgt.idx].select();
                                            _selectedTile = tgt;
                                        }
                                    } else {
                                        // no tile here; try to force the tiles above it to fall
                                        _applyGravity();
                                    }
                                }

                            } else {
                                console.log("TODO: mouse event handling for outside the play area");
                            }
                            break;
                        default:
                            console.log("Unrecognized input type:", inp);
                    }
                }

                // check for new matches
                _eval();

                // continue any ongoing animations
                for (var i=0; i<_w*_h; i++) {
                    _ar[i] && _ar[i].tick(game);
                }
            }

            function _applyGravity() {
                var col_base_cell, y_off, current_cell, open_cells = [];

                for (col_base_cell=(_w*_h)-1; col_base_cell > 0; col_base_cell-=_h) {
                    // start at the bottom of the column and walk up each cell, applying gravity as we go
                    for (y_off=0; y_off<_h; y_off++) {
                        current_cell = col_base_cell - y_off;
                        if (_ar[current_cell]) {
                            if (_ar[current_cell].getState() != 0) {
                                // there's already something falling in this column; don't apply new gravity until it's done
                                open_cells = [];
                                break;
                            } else if (open_cells.length) {
                                _ar[current_cell].dropTo(open_cells.pop());
                                open_cells.unshift(current_cell);
                            }
                        } else {
                            open_cells.unshift(current_cell);
                        }
                    }
                    while (open_cells.length) {
                        current_cell = open_cells.pop();
                        _ar[current_cell] = new Tile(_events, current_cell);
                    }
                }
            }

            function _swap(x1,y1,x2,y2) {
                var offset1 = _h*x1 + y1,
                    offset2 = _h*x2 + y2,
                    tmp;
                tmp = _ar[offset1];
                _ar[offset1] = _ar[offset2];
                _ar[offset1].setIndex( offset1 );

                _ar[offset2] = tmp;
                _ar[offset2].setIndex( offset2 );
            }


            function _shiftCol(col, offset) {
                var i, l, r, x = col * _h,
                    buffer = _ar.slice(x, x+_h);
                if (offset == 0) {
                    return;
                } else if (offset < 0) {
                    offset += _h;
                }

                //console.log('about to shift column', col, ', offset:', offset, ', buffer:', printTileArray(buffer));
                l = buffer.slice(_h-offset);
                r = buffer.slice(0, _h-offset);
                buffer = l.concat(r);
                //console.log('shifted:', printTileArray(buffer));

                for (i=0; i<_h; i++) {
                    _ar[i+x] = buffer[i];
                }
                //delete(buffer);
            }

            function _shiftRow(row, offset) {
                var col, l, r, index, buffer = [];
                if (offset == 0) {
                    return;
                } else if (offset < 0) {
                    offset += _h;
                }
                for (col=0; col<_w; col++) {
                    index = (col * _h) + row;
                    buffer.push(_ar[index]);
                }
                //console.log('about to shift row', row, ', offset:', offset, ', buffer:', printTileArray(buffer));
                l = buffer.slice(_h-offset);
                r = buffer.slice(0, _h-offset);
                buffer = l.concat(r);
                //console.log('shifted:', printTileArray(buffer));

                for (col=0; col<_w; col++) {
                    index = (col * _h) + row;
                    _ar[index] = buffer[col];
                    _ar[index].setIndex( index );
                }
                //delete(buffer);
            }

            function _shift(x1,y1,x2,y2) {
                var i, tmp;
                //   0  1  2  3  4  5  6  7
                //           y1       y2     == offset +3 (y2-y1)
                //   5  6  7  0  1  2  3  4  == ar.slice(8-3) + ar.slice(0,8-3)

                // OR

                //   0  1  2  3  4  5  6  7
                //     y2          y1        == offset -4 (y2-y1; +4 also works in this case, but that's an artifact of array size)
                //   4  5  6  7  0  1  2  3

                // OR

                //   0  1  2  3  4  5  6  7
                //     y1 y2                 == offset +1 (y2-y1)
                //   7  0  1  2  3  4  5  6

                // OR

                //   0  1  2  3  4  5  6  7
                //        y2    y1          == offset -2 (y2-y1; also +6: we can add 8 to any negative offset)
                //   2  3  4  5  6  7  0  1

                if (x1==x2) {
                    // vertical slide:  I can just slice & concat the separate parts of _ar[col]:
                    _shiftCol(x1, y2-y1);

                } else if (y1==y2) {

                    // horizontal slide:  harder, because we're shifting elements across column arrays
                    _shiftRow(y1, x2-x1);

                } else {
                    // invalid slide operation!
                }
            }

            function _scramble() {
                shuffle(_ar);
            }

            function _reload() {
                for (var i=0; i<_w*_h; i++) {
                    _ar[i] = new Tile(_events, i);
                }
            }

            function _index_to_xy(idx) {
                var _x = Math.floor(idx / _h),
                    _y = idx % _h;
                return {
                    x:  _x,
                    y:  _y,
                    dx: _x0 + _x*36,
                    dy: _y0 + _y*36
                }
            }

            function _render(game, ctx) {
                var coords = null;
                for (var i=0; i<_w*_h; i++) {
                    coords = _index_to_xy(i);

                    // the logic here could be better
                    _ar[i] && _ar[i].render(ctx, coords.dx, coords.dy);
                    /*
                    if (_ar[i] && _ar[i].render(ctx, dx, dy)) {
                        //
                    } else {
                        //_ar[i] = null;
                        console.log('hmm.', _ar[i]);
                    };
                    */
                }
            }

            function _align(vert) {
                var i,j;
                for (i=0; i<_w*_h; i++) {
                    if (vert) {
                        _ar[i].color = i % _h;
                    } else {
                        _ar[i].color = Math.floor(i/_h);
                    }
                }
            }

            function _collectHoriz(x,y, count) {
                var i, index;
                for (i=x; i<x+count; i++) {
                    index = (i * _h) + y;
                    _ar[index].remove();
                }
            }

            function _collectVert(x,y, count) {
                var i, index = (x*_h) + y;
                for (i=index; i<index+count; i++) {
                    _ar[i].remove();
                }
            }

            function _checkCol(col) {
                var y, cell, matchCount, ref = -1, y0 = col * _h;

                function _countMatchedTiles() {
                    if (matchCount >= 3) {
                        //console.log('Found a column of ', matchCount, ' berries at ', col, ',', y-1);
                        _collectVert(col, y-matchCount, matchCount);
                    }

                    // reset match criteria
                    ref = cell ? cell.color : -1;
                    matchCount = 1;
                }

                for (y=0; y<_h; y++) {
                    cell = _ar[y0 + y];
                    if (!cell || cell.isDeleted()) {
                        _countMatchedTiles();
                    } else {
                        if (cell.color != ref) {
                            // if we were looking at a candidate in the previous iteration,
                            //   check to see if it's long enough to count
                            _countMatchedTiles();

                        } else {

                            if (cell.color == ref) {
                                matchCount++;
                            }

                        }
                    }
                } // end for

                // if we've fallen out of the loop and found a 3+-match at the end of the row, collect it now
                _countMatchedTiles();
            }

            function _checkRow(row) {
                var x, cell, index, matchCount, ref = -1;

                function _countMatchedTiles() {
                    if (matchCount >= 3) {
                        //console.log('Found a row of ', matchCount, ' berries at ', x-1, ',', row);
                        _collectHoriz(x-matchCount, row, matchCount);
                    }

                    // reset match criteria
                    ref = cell ? cell.color : -1;
                    matchCount = 1;
                }

                for (x=0; x<_w; x++) {
                    index = (x * _h) + row;
                    cell = _ar[index];
                    if (!cell || cell.isDeleted()) {
                        _countMatchedTiles();
                    } else {
                        if (cell.color != ref) {
                            // if we were looking at a candidate in the previous iteration,
                            //   check to see if it's long enough to count
                            _countMatchedTiles();

                        } else {

                            if (cell.color == ref) {
                                matchCount++;
                            }

                        }
                    }
                } // end for

                // if we've fallen out of the loop and found a 3+-match at the end of the row, collect it now
                _countMatchedTiles();
            }

            function _eval() {
                var i,x,y,ref=-1,matchCount;

                // check columns
                /*
                for (i=0; i<_w*_h; i++) {
                    // if we're at the head of a column, or if we hit a color
                    //   that doesn't match the one we're looking for, evaluate the
                    //   match buffer to see if we've got 3 or more
                    if (((i % _h) == 0) || (_ar[i].color != ref)) {
                        // match?
                        if (matchCount >= 3) {
                            x = Math.floor((i-1) / _h);
                            y = (i-1) % _h;
                            console.log('Found a column of ', matchCount, ' berries at ', x, ',', y);
                        }

                        // reset match criteria
                        ref = _ar[i].color;
                        matchCount = 1;

                    } else {
                        if (_ar[i].color == ref) {
                            matchCount++;
                        }
                    }
                }
                */

                // check columns
                for (i=0; i<_w; i++) {
                    _checkCol(i);
                }

                // check rows
                for (i=0; i<_h; i++) {
                    _checkRow(i);
                }


                //   it may actually be possible to run both vert and horiz checks on a single run through the array,
                //   if we use two different match counts and refs


                _applyGravity();
            }

            return {
                width  : _w,
                height : _h,
                tiles  : _ar,
                render : _render,
                tick   : _tick,
                panic  : _scramble,
                reload : _reload,
                swap   : _swap,
                shift  : _shift,
                align  : _align
            }

        } // end of constructor

        return constructor;
    } // end AMD callback function
);
