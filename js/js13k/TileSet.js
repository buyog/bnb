/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

define(
    ["atto/core", "atto/event", "Tile"],
    function(atto, AttoEvent, Tile) {
    "use strict";

        function printTileArray(ar) {
            // dumps an array of tiles to a human-readable string
            var s = [];
            for (var i=0; i<ar.length; i++) {
                s.push(ar[i].toString());
            }

            return s.join(',');
        }

        function shuffle(array)
        { // from http://stackoverflow.com/questions/5150665/generate-random-list-of-unique-rows-columns-javascript
            for(var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
            return array;
        };

        function constructor(width, height) {
            var _w  = width || 8,
                _h  = height || 8,
                _ar = [],
                _x0 = 66,
                _y0 = 26,
                _events = {
                    onTileRemove: new AttoEvent('bnb.tile.onTileRemove')
                };

            // init tile set (can't do earlier, because the tiles need a reference to my events object)
            _ar = _initGrid(_w, _h);

            _events.onTileRemove.watch(function(context) {
                //console.log('Tile removed:', context);
                _ar[context.index] = new Tile(_events, context.index);
                console.log(_ar[context.index]);
            });

            function _initGrid(w,h) {
                var x, len=w*h,
                    grid = [];

                for (x=0; x<len; x++) {
                    grid.push( new Tile(_events, x) );
                }
                return grid;
            }

            function _tick() {
                // TODO: check for new matches
                _eval();

                // TODO: continue any ongoing animations

            }

            function _swap(x1,y1,x2,y2) {
                var offset1 = _h*x1 + y1,
                    offset2 = _h*x2 + y2,
                    tmp;
                tmp = _ar[offset1];
                _ar[offset1] = _ar[offset2];
                _ar[offset2] = tmp;
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

            function _render(ctx) {
                var x,y, dx = 0, dy = 0;
                for (var i=0; i<_w*_h; i++) {
                    x = Math.floor(i / _h);
                    y = i % _h;
                    dx = _x0 + x*24;
                    dy = _y0 + y*24;

                    // the logic here could be better
                    if (_ar[i] && _ar[i].render(ctx, dx, dy)) {
                        //
                    } else {
                        //_ar[i] = null;
                        console.log('hmm.', _ar[i]);
                    };
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
                var y, cell, matchCount,
                    ref = -1,
                    y0 = col * _h;

                for (y=0; y<_h; y++) {
                    cell = _ar[y0 + y];
                    if (!cell || cell.isDeleted()) { continue; }
                    if (cell.color != ref) {
                        // if we were looking at a candidate in the previous iteration,
                        //   check to see if it's long enough to count
                        if (matchCount >= 3) {
                            //console.log('Found a column of ', matchCount, ' berries at ', col, ',', y-1);
                            _collectVert(col, y-matchCount, matchCount);
                        }

                        // reset match criteria
                        ref = cell.color;
                        matchCount = 1;

                    } else {

                        if (cell.color == ref) {
                            matchCount++;
                        }

                    }
                } // end for

                // if we've fallen out of the loop and found a 3+-match at the end of the row,
                //   collect it now
                if (matchCount >= 3) {
                    //console.log('Found a column of ', matchCount, ' berries at ', col, ',', y-1);
                    _collectVert(col, y-matchCount, matchCount);
                }
            }

            function _checkRow(row) {
                var x, cell, index, matchCount, ref = -1;

                for (x=0; x<_w; x++) {
                    index = (x * _h) + row;

                    cell = _ar[index];
                    if (!cell || cell.isDeleted()) { continue; }
                    if (cell.color != ref) {
                        // if we were looking at a candidate in the previous iteration,
                        //   check to see if it's long enough to count
                        if (matchCount >= 3) {
                            //console.log('Found a row of ', matchCount, ' berries at ', x-1, ',', row);
                            _collectHoriz(x-matchCount, row, matchCount);
                        }

                        // reset match criteria
                        ref = cell.color;
                        matchCount = 1;

                    } else {

                        if (cell.color == ref) {
                            matchCount++;
                        }

                    }
                } // end for

                // if we've fallen out of the loop and found a 3+-match at the end of the row,
                //   collect it now
                if (matchCount >= 3) {
                    //console.log('Found a row of ', matchCount, ' berries at ', x-1, ',', row);
                    _collectHoriz(x-matchCount, row, matchCount);
                }
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
                align  : _align,
                eval   : _eval
            }

        } // end of constructor

        return constructor;
    } // end AMD callback function
);
