'use strict';

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define('legend', ['format'], factory);
    } else {
        factory(legend);
    }
}(function(format) {
    var outExistData = function(data) {
        var result = [];

        data.forEach(function(d) {
            if (result.indexOf(d) < 0) {
                result.push(d);
            }
        });

        return result;
    }

    var txtWidth = function(txt, size, face) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        ctx.font = '12px "Times Roman"';

        return {
            'width': toTenUnits(ctx.measureText(txt).width),
            'height': toTenUnits(parseInt(ctx.font))
        };
    }

    var toTenUnits = function(num) {
        return (Math.ceil(parseInt(num) / 10) * 10);
    }

    var alignTo = function(list) {
        return list.sort(function(a, b) {
            return format().mut(a).order >
                format().mut(b).order ? -1 : 1;
        });
    }

    var makeContents = function(ele, opts) {
        var a = new legendAttr();
        var shape = opts.chart ? {
            'needle': 'circle',
            'comutation': 'rect'
        }[opts.chart] : 'rect';
        var attrs = opts.chart ? {
            'comutation': {
                'x': a.rx,
                'width': a.rw,
                'y': a.ry,
                'height': a.rh
            },
            'needle': {
                'cx': a.cx,
                'cy': a.cy,
                'r': a.cr,
            },
        }[opts.chart] : {
            'x': a.x,
            'width': a.w,
            'y': a.y,
            'height': a.h
        }

        ele.append(shape)
            .attr(attrs)
            .attr('rx', 2)
            .attr('ry', 2)
            .style('fill', function(d, i) {
                if (opts.color) {
                    return opts.color[i];
                } else {
                    return opts.chart ?
                        format().mut(d).color :
                        format().exp(opts.re_data, d);
                }
            });

        ele.append('text')
            .attr({ 'x': 25, 'y': 0 })
            .text(function(d) {
                if (d.length > 25) {
                    return d.substring(0, 25) + '...';
                }
                 
                return d;
            })
            .style({
                'font-size': '12px',
                'font-family': 'Times Roman',
            })
            .on({ 'mouseover': mOver, 'mouseout': mOut });
    }

    var legendAttr = function() {};

    legendAttr.prototype = {
        'ry': function(d) {
            var idx = format().mut(d).idx.toString() || '0';

            return { '2': -15, '1': -10, '0': -10 }[idx];
        },
        'rh': function(d) {
            var idx = format().mut(d).idx.toString();

            return { '2': 18, '1': 11, '0': 11 }[idx];
        },
        'rx': function(d) { return 10; },
        'rw': function(d) { return 10; },
        'cx': function(d) { return 5; },
        'cy': function(d) { return -5; },
        'cr': function(d) { return 5; },
        'x': function(d) { return 0; },
        'y': function(d) { return -12; },
        'w': function(d) { return 10; },
        'h': function(d) { return 12; },
    }

    var mOver = function(d) {
        d3.select(this).style('font-size', '13px');
    }

    var mOut = function(d) {
        d3.select(this).style('font-size', '12px');
    }

    /// ----- canvas legend ----- ///
    /// 
    /// 
    var draw = function(opts) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        var sf = setFrame(ctx, opts);
        ctx.clearRect(0, 0, sf.width, sf.height);
        var shapeSet = {
            'circle': function(x, y, color, text) {
                var r = 5,
                    m = 10;

                ctx.beginPath();
                ctx.arc(x + r + m, y + r + m, r, 0 * Math.PI, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.stroke();
                ctx.font = '14px Arial'
                ctx.fillStyle = '#333';
                ctx.fillText(text, x + r * 3 + m, y + r * 2 + m);
                ctx.closePath();
            },
        };

        canvas.width = sf.width;
        canvas.height = sf.height;

        opts.div.append(canvas);

        for (var i = 0, l = opts.contents.length; i < l; i++) {
            var c = opts.contents[i],
                color = format().mut(c).color;

            if (typeof opts.shapes === 'object') {
                // console.log('shapes is obejct ', opts.shapes, c);
            } else {
                // console.log('shapes is not object ', opts.shapes, c);
                shapeSet[opts.shapes](0, i * 20, color, c);
            }
        }
    }

    var setFrame = function(ctx, opts) {
        var pos = opts.base.position(),
            width = setWidth(ctx, opts) || 200,
            height = setHeight(ctx.font, opts) || 200,
            locset = {
                'top': pos.top,
                'left': pos.left,
                'bottom': pos.top + opts.base.height() - height,
                'right': pos.left + opts.base.width() - width,
            },
            loc = (!opts.location ? 'top-left' : opts.location).split('-');

        opts.div.css('position', 'absolute')
            .css('width', width + 'px')
            .css('height', height + 'px');

        for (var i = 0, l = loc.length; i < l; i++) {
            var ll = loc[i];

            opts.div.css((ll === 'bottom' || ll === 'top') ? 'top' : 'left',
                locset[ll]);
        }

        return { 'width': width, 'height': height };
    }

    var setWidth = function(ctx, opts) {
        return d3.max(opts.contents, function(d) {
            return ctx.measureText(d).width;
        }) + 20;
    }

    var setHeight = function(font, opts) {
        var text = $('<span>Hg</span>').css({ 'fontFamily': font }),
            block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>'),
            div = $('<div></div>'),
            body = $('body');

        div.append(text, block);
        body.append(div);

        try {
            var result = {};

            block.css({ 'verticalAlign': 'baseline' });
            result.ascent = block.offset().top - text.offset().top;

            block.css({ 'verticalAlign': 'bottom' });
            result.height = block.offset().top - text.offset().top;

            result.descent = result.height - result.ascent;
        } finally {
            div.remove();
        }

        return result.height * opts.contents.length + 20;
    }

    var setLocate = function (by, id)   {
        var b = document.getElementById(by);
        var g = b.getBoundingClientRect();
        var p = $('#' + by).position();

        // on Empty Page
        // $('#' + id).css('left', g.right + 'px')
        //            .css('top', p.top + 'px')
        // on CDSS
        $('#' + id).css('left', p.left + g.width+ 'px')
                   .css('top', p.top + 'px');
    }

    return function(opts) {
        if (opts.canvas) {
            return draw(opts);
        }

        d3.selectAll('#' + opts.target + ' svg').remove();

        opts.re_data = opts.chart ? alignTo(outExistData(opts.data)) :
            outExistData(opts.data);
        var lineHeight = txtWidth(opts.re_data[0]).height;
        var id = opts.target || 'legend';
        var div = $('#' + id);
        div.height(opts.re_data.length * lineHeight + 10);
        var width = div.width(),
            height = div.height();
        var margin = 20;

        if (opts.by)    {
            setLocate(opts.by, id);

            window.onresize = function (evt)    {
                setLocate(opts.by, id);   
            }
        }

        var svg = d3.select('#' + id)
            .append('svg')
            .attr('id', 'legendSvg')
            .attr({ 'width': width, 'height': height })
            .append('g')
            .attr('transform', 'translate(0, 0)');
        var group = svg.selectAll('#legendGroup')
            .data(opts.re_data)
            .enter().append('g')
            .attr('id', 'legendGroup')
            .attr('transform', function(d, i) {
                return 'translate(' + (margin / 2) + ', ' +
                    (lineHeight * (i + 1)) + ')';
            });

        makeContents(group, opts);
    }
}));