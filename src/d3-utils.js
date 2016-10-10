// D3 selections util funcs

import { selection as d3Selection } from 'd3';
import tinycolor from 'tinycolor2';

d3Selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

d3Selection.prototype.textFitToBox = function(w,h,passes) {
    passes = passes||3;

    var startSize = parseInt(this.style("font-size").split('px')[0]);
    var bbox = this.node().getBBox();
    var newSize = Math.floor(startSize*Math.min(w/bbox.width, h/bbox.height));

    if (newSize!=startSize) {
        this.style('font-size', newSize + 'px');
        if(--passes)
            this.textFitToBox(w,h,passes);
    }
    return this;
};

d3Selection.prototype.textAbbreviateToFit = function(maxW) {
    function abbreviateText(txt, maxChars) {
        return txt.length<=maxChars?txt:(
            txt.substring(0, maxChars*2/3)
            + '...'
            + txt.substring(txt.length - maxChars/3, txt.length)
        );
    }

    var origTxt = this.text();
    var nChars = Math.round(origTxt.length*maxW/this.node().getBBox().width*1.2);  // Start above
    while(--nChars && maxW/this.node().getBBox().width<1){
        this.text(abbreviateText(origTxt, nChars));
    }
    return this;
};

// colorScale: d3.scaleLinear().domain([0, 1, 2]).range(['red', 'yellow', 'green'])
// angle: 0 (left-right), 90 (down-up), ...
d3Selection.prototype.addGradient = function(colorScale, angle) {

    angle = angle||0; // Horizontal

    var rad = Math.PI * angle/180;

    var gradId = "areaGradient" + Math.round(Math.random()*10000);

    var areaGradients = this.append("linearGradient")
        .attr("y1", Math.round(100*Math.max(0, Math.sin(rad))) + "%")
        .attr("y2", Math.round(100*Math.max(0, -Math.sin(rad))) + "%")
        .attr("x1", Math.round(100*Math.max(0, -Math.cos(rad))) + "%")
        .attr("x2", Math.round(100*Math.max(0, Math.cos(rad))) + "%")
        .attr("id", gradId);

    var threshVal = colorScale.domain()[0];
    var normVal = colorScale.domain()[colorScale.domain().length-1] - threshVal;
    for (var i=0, len=colorScale.domain().length; i<len; i++) {
        areaGradients.append("stop")
            .attr("offset", (100*(colorScale.domain()[i] - threshVal)/normVal) + "%")
            .attr("stop-color", colorScale.range()[i]);
    }

    // Use with: .attr("fill", 'url(#<gradId>)');

    return gradId;
};

d3Selection.prototype.addDropShadow = function() {

    var shadowId = "areaGradient" + Math.round(Math.random()*10000);

    var filter = this.append('defs').append('filter')
        .attr('id', shadowId)
        .attr('height', '130%');

    filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 3);

    filter.append('feOffset')
        .attr('dx', 2)
        .attr('dy', 2)
        .attr('result', 'offsetblur');

    var feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

    // Use with: .attr('filter', 'url(#<shadowId>)'))

    return shadowId;
};

d3Selection.prototype.appendOrdinalColorLegend = function(w, h, scale, label) {

    var legend = this;

    var colorBinWidth = w / scale.domain().length;
    scale.domain().forEach(function(val, index) {

        var colorG = legend.append('g');

        colorG.append("rect")
            .attr("width", colorBinWidth)
            .attr("height", h)
            .attr("x", colorBinWidth*index)
            .attr("y", 0)
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("stroke-width", 0)
            .attr("fill", scale(val));

        colorG.append("text")
            .text(val)
            .attr("x", colorBinWidth*(index+.5))
            .attr("y", h*0.5)
            .style("text-anchor", "middle")
            .style("dominant-baseline", "central")
            .style('fill', tinycolor(scale(val)).isLight()?'#333':'#DDD' )
            .textFitToBox(colorBinWidth, h*0.8);

        colorG.append('title')
            .text(val + ' ' + label);
    });

    legend.append("rect")
        .attr("width", w)
        .attr("height", h)
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("fill-opacity", 0)
        .style("pointer-events", 'none');

    return legend;
};

d3Selection.prototype.appendLinearColorLegend = function(w, h, scale, label) {

    var gradId = this.addGradient(scale, 0);

    this.append("rect")
        .attr("width", w)
        .attr("height", h)
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .style("fill", 'url(#' + gradId + ')');

    this.append("text")
        .attr("class", "legendText")
        .text(label)
        .attr("x", w*0.5)
        .attr("y", h*0.5)
        .style("text-anchor", "middle")
        .style("dominant-baseline", "central")
        .style('fill', tinycolor(scale((scale.domain()[scale.domain().length-1] - scale.domain()[0])/2)).isLight()?'#444':'#CCC' )
        .textFitToBox(w*0.8, h*0.9);

    this.append("text")
        .text(scale.domain()[0])
        .attr("x", w*0.02)
        .attr("y", h*0.5)
        .style("text-anchor", "start")
        .style("dominant-baseline", "central")
        .style('font', h*0.7 + 'px sans-serif')
        .style('fill', tinycolor(scale.range()[0]).isLight()?'#444':'#CCC' )
        .textFitToBox(w*0.3, h*0.7);

    this.append("text")
        .text(scale.domain()[scale.domain().length-1])
        .attr("x", w*0.98)
        .attr("y", h*0.5)
        .style("text-anchor", "end")
        .style("dominant-baseline", "central")
        .style('fill', tinycolor(scale.range()[scale.range().length-1]).isLight()?'#444':'#CCC' )
        .textFitToBox(w*0.3, h*0.7);

    return this;
};

d3Selection.prototype.appendColorLegend = function(x, y, w, h, scale, label) {
    var legendG = this.append("g")
        .attr("class", "legend");

    legendG.attr("transform", "translate(" + x + "," + y + ")");

    return (scale.copy().domain([1, 2]).range([1, 2])(1.5) === 1)
        ?legendG.appendOrdinalColorLegend(w, h, scale, label)
        :legendG.appendLinearColorLegend(w, h, scale, label);
};

d3Selection.prototype.appendSvgThrobber = function(x, y, r, color, duration, angleFull) {

    function genDonutSlice(cx, cy, r, thickness, startAngle, endAngle) {
        startAngle = startAngle/180*Math.PI;
        endAngle = endAngle/180*Math.PI;

        var outerR=r;
        var innerR=r-thickness;

        p=[
            [cx+outerR*Math.cos(startAngle), cy+outerR*Math.sin(startAngle)],
            [cx+outerR*Math.cos(endAngle), cy+outerR*Math.sin(endAngle)],
            [cx+innerR*Math.cos(endAngle), cy+innerR*Math.sin(endAngle)],
            [cx+innerR*Math.cos(startAngle), cy+innerR*Math.sin(startAngle)]
        ];
        angleDiff = endAngle - startAngle;
        largeArc = ((angleDiff % (Math.PI * 2)) > Math.PI)?1:0;
        path = [];

        path.push("M" + p[0].join());
        path.push("A" + [outerR,outerR,0,largeArc,1,p[1]].join());
        path.push("L" + p[2].join());
        path.push("A" + [innerR,innerR,0,largeArc,0,p[3]].join());
        path.push("z");

        return path.join(" ");
    }

    r = r||8;
    color = color||'darkblue';
    duration = duration||0.7;
    angleFull = angleFull||120;

    var thickness = r/3;

    var path = this.append('path')
        .attr('d', genDonutSlice(x, y, r, thickness, 0, angleFull))
        .attr('fill', color);

    path.append('animateTransform')
        .attr('attributeName', 'transform')
        .attr('attributeType', 'XML')
        .attr('type', 'rotate')
        .attr('from', '0 ' + x + ' ' + y)
        .attr('to', '360 ' + x + ' ' + y)
        .attr('begin', '0s')
        .attr('dur', duration + 's')
        .attr('fill', 'freeze')
        .attr('repeatCount', 'indefinite');

    return path;
};

d3Selection.prototype.appendImage = function(imgUrl, x, y, maxW, maxH, svgAlign) {

    svgAlign = svgAlign || "xMidYMid";

    return new function(svgElem, imgUrl, x, y, maxW, maxH, svgAlign) {

        this.img = svgElem.append("image")
            .attr("xlink:href", imgUrl)
            .attr("x", x)
            .attr("y", y)
            .attr("width", maxW)
            .attr("height", maxH)
            .attr("preserveAspectRatio", svgAlign + " meet");

        this.show = function() {
            this.img
                .attr("width", maxW)
                .attr("height", maxH);
            return this;
        };

        this.hide = function() {
            this.img
                .attr("width", 0)
                .attr("height", 0);
            return this;
        };
    }(this, imgUrl, x, y, maxW, maxH, svgAlign);
};

