define("xyplot/view_xyplot", ["utils", "size", "xyplot/event_xyplot"], function(_utils, _size, _event)   {
"use strict";
    
    var view = function(_data)    {       
        var size  = _data.size;
        var svg   = _size.mkSvg("#xyplot_view", size.width, size.height, true);
        var xAxis = _size.setAxis(_data.x, "bottom", { ticks : 5 });
        var yAxis = _size.setAxis(_data.y, "left"  , { ticks : 5 });

        _size.mkAxis(svg, "xyplot_xaxis", 0                                     , size.rheight, xAxis);
        _size.mkAxis(svg, "xyplot_yaxis", (size.margin.left + size.margin.right), 0           , yAxis);

        var axiss = d3.selectAll(".xyplot_xaxis, .xyplot_yaxis");

        axiss.selectAll("text")
        .style("fill", "#626262");
        axiss.selectAll("path, line")
        .style({"fill" : "none", "stroke" : "#BFBFBF", "stroke-width" : "1", "shape-rendering" : "crispEdges"})

        svg.append("g")
        .append("line")
        .attr("class", "xyplot_fdrlevelline")
        .attr({"x1" : (size.margin.left + size.margin.right), "y1" : _data.y(0.05)})
        .attr({"x2" : size.rwidth, "y2" : _data.y(0.05)});

        svg.append("g")
        .append("text")
        .attr("class", "xyplot_fdrleveltext")
        .attr({"x" : size.rwidth - (size.margin.left * 4), "y" : _data.y(1)})
        .text("FDR Level = 0.05");

        var plot = svg.selectAll("circle")
        .data(_data.data.data.plot_list)
        .enter().append("circle")
        .attr("class", "xyplot_circles")
        .on({"mouseover" : _event.m_over, "mouseout" : _event.m_out})
        .transition().delay(function(_d, _i) { 
            return _i * (1 / 3); 
        })
        .attr("cx", function(_d) { 
            return _data.x(_d.x); 
        })
        .attr("cy", function(_d) { 
            return _data.y(_d.y); 
        })
        .attr("r", _data.radius);

        var text = svg.selectAll("text")
        .data(_data.data.data.plot_list)
        .enter().append("text")
        .attr("class", "xyplot_circles_text")
        .transition().delay(function(_d, _i) { 
            return _i * (1 / 3); 
        })
        .attr("x", function(_d) { 
            return _data.x(_d.x) + 5; 
        })
        .attr("y", function(_d) { 
            return _data.y(_d.y); 
        })
        .text(function(_d) { 
            if(_d.y > 20)   {
                return _d.title; 
            }
        });
    }    

    return {
        view : view
    };
});