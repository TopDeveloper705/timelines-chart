import * as d3 from 'd3';

export default function() {

    var env = {
        svg: null,
        selection:null,
        margin : {top: 2, right: 2, bottom: 2, left: 2 },
        xScale: d3.scaleTime(),
        yScale: d3.scaleLinear(),
        transitionDuration: 700
    };

    function area(node, w, h) {

        env.xScale.range([env.margin.left, w-env.margin.right]);
        env.yScale.range([env.margin.top, h-env.margin.bottom]);

        env.svg = d3.select(node).append("svg")
            .attr("width", w)
            .attr("height", h);

        initStatic();

        return area;
    }

    function initStatic() {

        env.svg.append('rect')
            .attr('x', env.xScale.range()[0])
            .attr('y', env.yScale.range()[0])
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('width', env.xScale.range()[1])
            .attr('height', env.yScale.range()[1])
            .style('fill', '#EEE')
            .style('stroke', 'grey');

        env.selection = env.svg.append('rect')
            .attr('class', 'chart-zoom-selection')
            .attr('x', env.xScale.range()[0])
            .attr('y', env.yScale.range()[0])
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('width', 0)
            .attr('height', 0);
    }

    area.transitionDuration = function(_) {
        if (!arguments.length) { return env.transDuration; }
        env.transDuration = _;
        return area;
    };

    area.xDomain = function(_) {
        if (!arguments.length) { return env.xScale.domain(); }
        env.xScale.domain(_);
        return area;
    };

    area.yDomain = function(_) {
        if (!arguments.length) { return env.yScale.domain(); }
        env.yScale.domain(_);
        return area;
    };

    area.selectArea = function (startX, endX, startY, endY) {
        env.selection//.transition().duration(env.transDuration)
            .attr('x', env.xScale(startX))
            .attr('y', env.yScale(startY))
            .attr('width', env.xScale(endX)-env.xScale(startX))
            .attr('height', env.yScale(endY)-env.yScale(startY));
        return area;
    };

    return area;
};
