/*
 * controlChart.js
 *
 * by Justin Ratra
 *
 * Runs on csvToGraphs/home.html
 * global functions
 *
 */

// ######################
//    Global Variables
// ######################

//var csvArray = [];
var groups = [];
var xLabels = [];


// ######################
//    Global Functions
// ######################

// Extract all unique items from a given csv column
function ExtractFromCSV(index) {
    var arr = [];
    
    for (var i = 0; i < csvArray.length; i++) {
        var item = csvArray[i][index];
        
        //console.log("i = ", i);
        //console.log("index = ", index);
        // Validate item is defined before adding.
        if (arr.indexOf(item) == -1 && (item !== "undefined"))
            arr.push(item);
        
        //console.log("item = ", item);
    }
    
    //console.log("array = ", arr);
    //console.log("csvArray = ", csvArray);
    
    return arr;
}

function ExtractGroupFromCSV(index) {
    groups = [];
    
    for (var i = 0; i < csvArray.length; i++) {
        var item = csvArray[i][index];
        
        // Validate item is defined before adding.
        if (groups.indexOf(item) == -1 && !(item === "undefined"))
            groups.push(item);
    }
}

// #######################
//   Run Chart Functions
// #######################

function csvToControlChartData(chartData) {
    // Returns data object formatted for Control p-chart
    //      depending on chartType value
    //
    var Y_COL = chartData.Y_COL;
    var SAMPLE_COL = chartData.SAMPLE_COL;
    var INCIDENCE_COL = chartData.INCIDENCE_COL;
    var X_COL = chartData.X_COL;
    var GROUP_COL = chartData.GROUP_COL;
    var GROUPS = chartData.GROUPS;
    var XLABELS = chartData.XLABELS;
    var START = chartData.START;
    var END = chartData.END;
    
    var dataset = [];
    
    var global_climits = false;
    
    var y_count = 0;
    var y_sum = 0;
    var sample_sum = 0;
    var sample_count = 0;
    var incidence_sum = 0;
    var incidence_count = 0;
    
    var variance = 0;
    var stdev = 0;
    
    var min = Infinity;
    var max = -Infinity;
    
    // Create Data Object
    //for (var i = 0; i < groups.length; i++)
    for (var i = 0; i < GROUPS.length; i++) {
        var arr = [];
        //for (var j = 0; j < xLabels.length; j++)
        for (var j = 0; j < XLABELS.length; j++) {
            arr.push({
                //x_axis: xLabels[j],
                //group: groups[i],
                x_axis: XLABELS[j],
                group: GROUPS[i],
                incidences: 0,
                sample_size: 0,
                percentage: 0,
                ucl: 0,
                lcl: 0
            });
        }
        dataset.push(arr);
    }
    //console.log("dataset = ", dataset);
    
    // Populate Data Object
    for (var i = 0; i < csvArray.length; i++) {
        var item = csvArray[i];
        
        var group = item[GROUP_COL];
        var X_VAL = item[X_COL];
        var Y_VAL = parseFloat(item[Y_COL]);
        var SAMPLE_VAL = parseFloat(item[SAMPLE_COL]);
        var INCIDENCE_VAL = parseFloat(item[INCIDENCE_COL]);
        
        //var groupIndex = groups.indexOf(group);
        var groupIndex = GROUPS.indexOf(group);
        //var xIndex = xLabels.indexOf(X_VAL);
        var xIndex = XLABELS.indexOf(X_VAL);
        
        if (groupIndex > -1 && xIndex > -1) {
            if (!isNaN(Y_VAL)) {
                dataset[groupIndex][xIndex].percentage = Y_VAL;
                y_sum += Y_VAL;
                y_count++;
                if (Y_VAL > max) max = Y_VAL;
                if (Y_VAL < min) min = Y_VAL;
                
                //console.log("Y_VAL = ", Y_VAL);
                //console.log("max = ", max);
                //console.log("min = ", min);
            }
            if (!isNaN(SAMPLE_VAL)) {
                dataset[groupIndex][xIndex].sample_size = SAMPLE_VAL;
                //console.log("SAMPLE_VAL = ", SAMPLE_VAL);
                sample_sum += SAMPLE_VAL;
                sample_count++;
            }
            if (!isNaN(INCIDENCE_VAL)) {
                dataset[groupIndex][xIndex].incidences = INCIDENCE_VAL;
                incidence_sum += INCIDENCE_VAL;
                incidence_count++;
            }
        } else {
            //console.log("SKIPPED ROW!!");
        }
    }
    
    var avg = 0;
    //console.log("incidence_sum = ", incidence_sum);
    //console.log("sample_sum = ", sample_sum);
    //if (sample_sum !== 0 && !isNaN(sample_sum) && !isNaN(incidence_sum))
    //    avg = incidence_sum / sample_sum;
    //else if (y_count !== 0 && !isNaN(y_sum) && !isNaN(y_count))
    //    avg = y_sum / y_count;
    
    //var global_lim = (3*Math.sqrt((avg*(1-avg))/(sample_sum/groups.length)));
    var global_lim = (3*Math.sqrt((avg*(1-avg))/(sample_sum/GROUPS.length)));
    var global_ucl = 100 * (avg + global_lim);
    var global_lcl = 100 * (avg - global_lim);
    
    //if (avg !== 0)
    if (sample_sum !== 0 && !isNaN(sample_sum) && !isNaN(incidence_sum)) {
        avg = incidence_sum / sample_sum;
    
        // Calculate Control Limits of p-chart
        for (var i = 0; i < dataset.length; i++) {
            var item = dataset[i];
            for (var j = 0; j < item.length; j++) {
                var ss = item[j].sample_size;
            
                if (item[j].percentage == 0) {
                    if (ss == 0) item[j].percentage = 0;
                    else item[j].percentage = 100 * (item[j].incidences / ss);
                }
            
                var lim = (3*Math.sqrt((avg*(1-avg))/ss));
                var ucl = avg + lim;
                var lcl = avg - lim;
                
                ucl == Infinity || ucl == -Infinity ? ucl = 0 : ucl = ucl;
                lcl == Infinity || lcl == -Infinity ? lcl = 0 : lcl = lcl;
                
                item[j].ucl = 100 * ucl;
                item[j].lcl = 100 * lcl;
                
                if (ucl > max) max = ucl;
                if (lcl < min) min = lcl;
                
                //console.log("ucl = ", ucl);
                //console.log("lcl = ", lcl);
            }
        }
        
        avg = avg * 100;
    } else if (y_count !== 0 && !isNaN(y_sum) && !isNaN(y_count)) {
        avg = y_sum / y_count;
        var variance_sum = 0;
        
        // Calculate Control Limits of p-chart
        for (var i = 0; i < dataset.length; i++) {
            var item = dataset[i];
            for (var j = 0; j < item.length; j++) {
            
                variance_sum += ((item[j].percentage - avg) * (item[j].percentage - avg));
            }
        }
        
        var variance = variance_sum / (dataset.length)  // Population Statistics
        //variance = variance_sum / (dataset.length - 1)  // Sample Statistics
        stdev = Math.sqrt(variance);
        
        var lim = 3 * stdev;
        
        global_ucl = avg + lim;
        global_lcl = avg - lim;
        
        global_climits = true;
    }
    
    return { data: dataset, avg: avg, max: max, min: min, ucl: global_ucl, lcl: global_lcl, groups: GROUPS, xLabels: XLABELS, global_climits: global_climits, stdev: stdev, variance: variance };
}

function drawControlChart(dataObj, chartObj) {
    var label = chartObj.label;
    var width = chartObj.width;
    var height = chartObj.height;
    var margin = chartObj.margin;
    var selector = chartObj.selector;
    
    var data = dataObj.data;
    var avg = dataObj.avg;
    var stdev = dataObj.stdev;
    var min = dataObj.min;
    var max = dataObj.max;
    var ucl = dataObj.ucl;
    var lcl = dataObj.lcl;
    var GROUPS = dataObj.groups;
    var XLABELS = dataObj.xLabels;
    var global_climits = dataObj.global_climits;
    var stdev = dataObj.stdev;
    var variance_data = dataObj.variance;
    
    //var interval = dataObj.interval;
    //var print_percent = max == -Infinity ? true : false;
    //var avg_line_bool = dataObj.avg_line;
    //var avg_single_data = [];
    //var ucl = dataObj.ucl;
    //var lcl = dataObj.lcl;
    //var hids = dataObj.hids;
    
    //console.log("data = ", data);
    console.log("Run Chart Title = ", label.chartTitle);
    console.log("Run Chart Data = ", dataObj);
    
    //var x = d3.time.scale()
    //          .range([0, width]);
    //var x = d3.scale.ordinal().rangeBands([0, width]);
    //var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.2);
    var x = d3.scale.ordinal().rangePoints([0, width]);
    
    var y = d3.scale.linear()
              .range([height, 0]);
    
    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");
    
    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");
    
    //var color = d3.scale.ordinal()
	//                      .range(randomColor({ count: data.length, hue: 'blue' }));
    //var color = data.length;
    //if (color == 1)
    //    color = d3.scale.ordinal().range(randomColor({ count: data.length, hue: 'blue', luminosity: 'dark' }));
    //else
    //    color = d3.scale.ordinal().range(randomColor({ count: data.length, luminosity: 'bright' }));
    var color = d3.scale.category10();
    color.domain(GROUPS);
    
    
    var svg = d3.select(selector).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("viewBox", "0 0 " + (width+margin.left+margin.right) + " " + (height+margin.top+margin.bottom))
                .attr("preserveAspectRatio", "xMidYMid")
                .append("g")
                .attr("transform", "translate(" + (margin.left-40) + "," + margin.top + ")");
    
    var line = d3.svg.line()
                 .interpolate("linear")
                 .x(function (d) { return x(d.x_axis); })
                 //.x(function (d) { return x(d.x_axis) + xAxis.rangeBands(); })
                 .y(function (d) { return y(d.percentage); });
    
    
    var tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 1e-6);
    
    // Set X Domain
    //x.domain([data[0][0].date, data[0][data[0].length-1].date]);
    //var xAxisLabels = xLabels.unshift("");
    //x.domain(xLabels);
    x.domain(XLABELS);
    
    // Set Y Domain (including Control Limits)
    var max_percent = d3.max(data, function (d) { return (d3.max(d, function (d) { return d.percentage; })); });
    var min_percent = d3.min(data, function (d) { return (d3.min(d, function (d) { return d.percentage; })); });
    if (max_percent > max) max = max_percent;
    if (min_percent < min) min = min_percent;
    
    if (global_climits) {
        if (ucl > max) max = ucl;
        
        if (lcl < min) min = lcl;
    } else {
        var max_ucl = d3.max(data, function (d) { return (d3.max(d, function (d) { return d.ucl; })); });
        var min_lcl = d3.min(data, function (d) { return (d3.min(d, function (d) { return d.lcl; })); });
        
        if (max_ucl > max) max = max_ucl;
        
        if (min_lcl < min) min = min_lcl;
    }
    
    //if (print_percent) max = d3.max(data, function (d) { return (d3.max(d, function (d) { return d.ucl; })); });
    //if (ucl > max) max = ucl;
    y.domain([min, max]);
    //y.domain(d3.extent(data, function (d) { return d.y_axis; }));     // Y-AXIS-Range = [Min, Max]
    //y.domain([0, d3.max(data, function (d) { return d.y_axis; })]);     // Y-AXIS-Range = [0, Max]
    
    // draw line(s)
    svg.selectAll(".run-line")
       .data(data)
       .enter().append("path")
       .attr("class", "line")
       .style("fill", "none")
       .style("stroke-width", "1.5px")
       .style("stroke", function (d, i) { return color(i / (data.length - 1)); })
       .attr("d", line);
    
    
    // draw x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(label.xAxis);
    
    // draw y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", "-50")
        .attr("x", -(height / 2))
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-size', '14px')
        .text(label.yAxis);
    
    // Draw center line to indicate mean.
    svg.append("svg:line")
        //.attr("x1", x(xLabels[0]) + 47)
        //.attr("x1", x(XLABELS[0]) + 47)
        .attr("x1", x(0))
        .attr("y1", y(avg))
        .attr("x2", x(xLabels[xLabels.length-1]))
        //.attr("x2", x(XLABELS[XLABELS.length-1]) + xAxis.rangeBands())
        .attr("y2", y(avg))
        .style("stroke", "rgba(0, 165, 46, 0.6)")
        .style("stroke-width", 2)
        .on("mouseover", function (d, i) {
            $('div.tooltip').show();
            tooltip.transition().duration(100).style("opacity", 1);
        }).on("mousemove", function () {
              var divHtml = '<strong>Mean:</strong>&emsp;';
                  divHtml += avg.toFixed(2) + ' %';
              
              var left_position = (d3.event.pageX - 2) + "px";
              tooltip.html(divHtml).style("left", left_position).style('top', (d3.event.pageY - 80) + "px");
        }).on("mouseout", function (d, i) {
              tooltip.transition().duration(100).style("opacity", 1e-6);
        });
    
    // draw data points on line
    for (var i = 0; i < data.length; i++) {
        //console.log("data i = ", data[i]);
        //console.log("data.length = ", data.length);
        
        svg.selectAll('.circle-' + i)
        .data(data[i])
        .enter()
        .append("circle")
        .attr("fill", function (d) {
              if (d.percentage > d.ucl || d.percentage < d.lcl)
                return "rgba(220, 55, 41, 0.8)";
              else
                return color (i / (data.length-1));
        }).attr("cx", function (d) { return x(d.x_axis); })
        .attr("cy", function (d) { return y(d.percentage); })
        .attr("r", 3)
        .on("mouseover", function (d, i) {
            $("div.tooltip").show();
            tooltip.transition().duration(100).style("opacity", 1);
        }).on("mousemove", function (d, i) {
            //var divHtml = '<h5><strong>Date:</strong>&emsp;' + DateToString(d.date) + '</h5>';
            //divHtml += '<h5><strong>Value:</strong>&emsp;' + d.ratio.toFixed(2) + '%</h5>';
            var num = d['percentage'];
            //var divHtml = '<strong></strong>&emsp;' + DateToString(d.date) + '<br/>';
            var divHtml = '<strong>' + d.x_axis + '</strong>&emsp;' + '<br/>';
                divHtml += '<strong>Group ID: </strong> ' + d['group'] + '<br/>';
                divHtml += '<strong>Average: </strong> ' + num.toFixed(2) + '%' + '<br/>';
                divHtml += '<strong>Sample Size: </strong> ' + d['sample_size'];
            
            if ($(window).width() - d3.event.pageX < 160) {
              var left_position = (d3.event.pageX - 155) + "px";
            } else {
              var left_position = (d3.event.pageX - 2) + "px";
            }
            tooltip.html(divHtml).style("left", left_position).style("top", (d3.event.pageY - 80) + "px");
        }).on("mouseout", function (d, i) {
            tooltip.transition().duration(100).style("opacity", 1e-6);
        });
    }
    
    if (global_climits) {
        // upper limit line
        svg.append("line")
            .attr("class", "limit-line")
            .attr("stroke", "#000")
            .attr({ x1: 0, y1: y(ucl), x2: width, y2: y(ucl) });
        svg.append("text")
            .attr({ x: width + 5, y: y(ucl) + 4 })
            .text("UCL: " + ucl.toFixed(2));
        
        // lower limit line
        svg.append("line")
            .attr("class", "limit-line")
            .attr("stroke", "#000")
            .attr({ x1: 0, y1: y(lcl), x2: width, y2: y(lcl) });
        svg.append("text")
            .attr({ x: width + 5, y: y(lcl) + 4 })
            .text("LCL: " + lcl.toFixed(2));
    } else {
        // upper limit line
        var upper_limit_line = d3.svg.line()
                                 .x(function (d) { return x(d.x_axis); })
                                 .y(function (d) { return y(d.ucl); })
                                 .interpolate("linear");
                                //.interpolate("step-before");
        // lower limit line
        var lower_limit_line = d3.svg.line()
                                 .x(function (d) { return x(d.x_axis); })
                                 .y(function (d) { return y(d.lcl); })
                                 .interpolate("linear");
                                 //.interpolate("step-before");
        for (var i = 0; i < data.length; i++) {
            svg.append("svg:path")
               .attr("class", "limit-line")
               .attr("fill", "none")
               .attr("stroke", color (i / (data.length-1)))
               //.attr("display", "none")
               .attr("d", upper_limit_line(data[i]));
            svg.append("svg:path")
               .attr("class", "limit-line")
               .attr("fill", "none")
               .attr("stroke", color (i / (data.length-1)))
               //.attr("display", "none")
               .attr("d", lower_limit_line(data[i]));
        }
    }
    //if (data.length == 1) {
    //    // upper limit line
    //    var upper_limit_line = d3.svg.line()
    //                             .x(function (d) { return x(d.x_axis); })
    //                             .y(function (d) { return y(d.ucl); })
    //                             .interpolate("linear");
    //                            //.interpolate("step-before");
    //    // lower limit line
    //    var lower_limit_line = d3.svg.line()
    //                             .x(function (d) { return x(d.x_axis); })
    //                             .y(function (d) { return y(d.lcl); })
    //                             .interpolate("linear");
    //                             //.interpolate("step-before");
    //    svg.append("svg:path")
    //       .attr("class", "limit-line")
    //       .attr("fill", "none")
    //       .attr("stroke", "#000")
    //       .attr("d", upper_limit_line(data[0]));
    //    svg.append("svg:path")
    //       .attr("class", "limit-line")
    //       .attr("fill", "none")
    //       .attr("stroke", "#000") 
    //       .attr("d", lower_limit_line(data[0]));
    //} else {
    //    // upper limit line
    //    var upper_limit_line = d3.svg.line()
    //                             .x(function (d) { return x(d.x_axis); })
    //                             .y(function (d) { return y(d.ucl); })
    //                             .interpolate("linear");
    //                            //.interpolate("step-before");
    //    // lower limit line
    //    var lower_limit_line = d3.svg.line()
    //                             .x(function (d) { return x(d.x_axis); })
    //                             .y(function (d) { return y(d.lcl); })
    //                             .interpolate("linear");
    //                             //.interpolate("step-before");
    //    for (var i = 0; i < data.length; i++) {
    //        svg.append("svg:path")
    //           .attr("class", "limit-line")
    //           .attr("fill", "none")
    //           .attr("stroke", color (i / (data.length-1)))
    //           //.attr("display", "none")
    //           .attr("d", upper_limit_line(data[i]));
    //        svg.append("svg:path")
    //           .attr("class", "limit-line")
    //           .attr("fill", "none")
    //           .attr("stroke", color (i / (data.length-1)))
    //           //.attr("display", "none")
    //           .attr("d", lower_limit_line(data[i]));
    //    }
    //    //// upper limit line
    //    //svg.append("line")
    //    //.attr("class", "limit-line")
    //    //.attr({ x1: 0, y1: y(ucl), x2: width, y2: y(ucl) });
    //    //svg.append("text")
    //    //.attr({ x: width + 5, y: y(ucl) + 4 })
    //    //.text("UCL: " + ucl.toFixed(2));
    //    //
    //    //// lower limit line
    //    //svg.append("line")
    //    //.attr("class", "limit-line")
    //    //.attr({ x1: 0, y1: y(lcl), x2: width, y2: y(lcl) });
    //    //svg.append("text")
    //    //.attr({ x: width + 5, y: y(lcl) + 4 })
    //    //.text("LCL: " + lcl.toFixed(2));
    //}
    
    
    // draw title
    svg.append('text')
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("class", "no-data")
        .style("font-size", '18px')
        //.style("font-size", "14px")
        .style("font-weight", "bold")
        .text(label.chartTitle);
    
    //if ((ucl == lcl && ucl == 0) || isNaN(ucl)) {
    //    svg.append('text')
    //    .attr("x", width / 2)
    //    .attr("y", height / 2)
    //    .attr("text-anchor", "middle")
    //    .attr("class", "no-data")
    //    .style("font-size", "20px")
    //    .text("No Data Available");
    //    
    //    $(selector + " svg g :not(.no-data)").hide();
    //    //$(selector).closest('.chart-container').find('.date-toggle').hide();
    //}
    
    if (data.length > 1) {
        var legend = svg;
        
       legend = svg.selectAll(".legend")
                    //.data(groups)
                    .data(GROUPS)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
       
       legend.append("rect")
            .attr("x", width + 18)
            .attr("y", 11)
            .attr("width", 18)
            .attr("height", 18)
            //.style("fill", function (d, i) { return color(i / (xLabels.length - 1)); });
            .style("fill", function (d, i) { return color(i / (data.length - 1)); });
       //.style("fill", color(i / (data.length - 1)));
       //.style("fill", ["#4682b4", "#dc1e50"]);
       //.style("fill", ["rgba(70, 130, 180, 1.0)", "rgba(220, 30, 80, 0.4)"]);
       
        legend.append("text")
        //.attr("x", width - 24)
        // Translation Formula = y = 1.0982x + 4.1833
        //.attr("x", 800)
        .attr("x", width + 58)
        .attr("y", 20)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d; });
    }
    
    //$(selector + " g.x g.tick text").map(function () {
    //                                     // translation formula 1:
    //                                     // y = 0.4932x + 11.422
    //                                     // translation formula 2:
    //                                     // y = 0.3961x + 14.865
    //                                     var text = $("#hidden-span").text($(this).text());
    //                                     
    //                                     var translation = text.width() * 0.4932 + 11.422;
    //                                     //var translation = text.width() * 0.3961 + 14.865;
    //                                     $(this).attr("transform", "rotate(-90), translate(" + "-" + translation + ", -14)");
    //                                     return;
    //                                     });
}



// ##########################
//   Funnel Chart Functions
// ##########################

//  --- Sorts dataset by population size
function compare(a, b) {
    if (a.sample_size < b.sample_size)
        return -1;
    if (a.sample_size > b.sample_size)
        return 1;
    return 0;
}

function csvToFunnelChartData(chartData) {
    var Y_COL = chartData.Y_COL;
    var SAMPLE_COL = chartData.SAMPLE_COL;
    var INCIDENCE_COL = chartData.INCIDENCE_COL;
    var X_COL = chartData.X_COL;
    var GROUP_COL = chartData.GROUP_COL;
    var GROUPS = chartData.GROUPS;
    var XLABELS = chartData.XLABELS;
    //var START = chartData.START;
    //var END = chartData.END;
    
    
    var dataset = [];
    
    var total_population = 0;
    var incidence_population = 0;
    
    var max = -Infinity;
    var min = Infinity;
    
    // Create Data Object
    //for (var i = 0; i < groups.length; i++) {
    for (var i = 0; i < GROUPS.length; i++) {
        dataset.push({
            //group: groups[i],
            group: GROUPS[i],
            incidences: 0,
            sample_size: 0,
            percentage: 0,
            percentage_vals: []
        });
    }
    //console.log("dataset = ", dataset);
    
    // Populate Data Object
    for (var i = 0; i < csvArray.length; i++) {
        var item = csvArray[i];
        
        var group = item[GROUP_COL];
        var X_VAL = item[X_COL];
        var Y_VAL = parseFloat(item[Y_COL]);
        var SAMPLE_VAL = parseFloat(item[SAMPLE_COL]);
        var INCIDENCE_VAL = parseFloat(item[INCIDENCE_COL]);
        
        //var groupIndex = groups.indexOf(group);
        var groupIndex = GROUPS.indexOf(group);
        var xLabelsIndex = XLABELS.indexOf(X_VAL);
        
        if (groupIndex > -1) {
            if (xLabelsIndex > -1) {
                if (!isNaN(Y_VAL)) {
                    dataset[groupIndex].percentage += Y_VAL;
                    dataset[groupIndex].percentage_vals.push(Y_VAL);
                    //y_sum += Y_VAL;
                    //y_count++;
                    if (Y_VAL > max) max = Y_VAL;
                    if (Y_VAL < min) min = Y_VAL;
                    
                    //console.log("Y_VAL = ", Y_VAL);
                    //console.log("max = ", max);
                    //console.log("min = ", min);
                }
                if (!isNaN(SAMPLE_VAL)) {
                    dataset[groupIndex].sample_size += SAMPLE_VAL;
                    //console.log("SAMPLE_VAL = ", SAMPLE_VAL);
                    //sample_sum += SAMPLE_VAL;
                    //sample_count++;
                    
                    total_population += SAMPLE_VAL;
                }
                if (!isNaN(INCIDENCE_VAL)) {
                    dataset[groupIndex].incidences += INCIDENCE_VAL;
                    incidence_population += INCIDENCE_VAL;
                    //incidence_sum += INCIDENCE_VAL;
                    //incidence_count++;
                }
            }
        } else {
            console.log("SKIPPED ROW!!");
        }
    }
    
    // Calculate Percentages
    for (var i = 0; i < dataset.length; i++) {
        var item = dataset[i];
        if (item.sample_size !== 0) item.percentage = item.incidences / item.sample_size;
        else item.percentage = 0;
    }
    
    // Calculate Total Mean
    var avg = incidence_population / total_population;
    
    // Calculate Variance
    var variance = avg * (1 - avg);
    
    // Sorts dataset by population size for drawing confidence intervals
    dataset.sort(compare);
    
    var sorted_groups = [];
    
    // Calculates Confidence Intervals
    for (var i = 0; i < dataset.length; i++) {
        var item = dataset[i];
        item.std_error = Math.sqrt(variance / item.sample_size);
        item.plus_2sd = avg + (2 * item.std_error);
        item.minus_2sd = avg - (2 * item.std_error);
        item.plus_3sd = avg + (3 * item.std_error);
        item.minus_3sd = avg - (3 * item.std_error);
        
        sorted_groups.push(item.group);
    }
    
    return { data: dataset, avg: avg, groups: sorted_groups };
}

function drawFunnelChart(data, chartObj) {
    var title = chartObj.label;
    var width = chartObj.width;
    var height = chartObj.height;
    var selector = chartObj.selector;
    var margin = chartObj.margin;
    
    var dataset = data.data;
    var sorted_groups = data.groups;
    var avg = data.avg;
    //var GROUPS = data.groups;
    //var XLABELS = data.xLabels;
    
    //console.log("Funnel Plot Title = ", title.chartTitle);
    //console.log("Funnel Plot Data = ", data);
    
    // Remove any items that have a population of 0
    for (var i = dataset.length-1; i >= 0; i--) {
        if (dataset[i].sample_size == 0) {
            dataset.splice(i, 1);
            sorted_groups.splice(i, 1);
        }
    }
    
    var padding = 30;
    
    var svg = d3.select(selector).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid");
    
    var tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 1e-6);
    var max_x = d3.max(dataset, function (d) {
                       return d['sample_size'];
                       });
    var min_x = d3.min(dataset, function (d) {
                       return d['sample_size'];
                       });
    
    // Create scale functions
    var xScale = d3.scale.linear()
                   //.domain([0, max_x])
                   .domain([min_x, max_x])
                   .range([padding, width - padding * 2]);
    var yScale = d3.scale.linear()
                    .domain([0, d3.max(dataset, function (d) { return d3.max([d['percentage'], d['plus_3sd']]); })])
                    .range([height - padding, padding]);
    
    // Set up axes format
    var formatAsPercentage = d3.format("%");
    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5)
                    .tickSize(4, 0, 0);
    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5)
                    .tickSize(4, 0, 0)
                    .tickFormat(formatAsPercentage);
    
    // draw x-axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis)
        .append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(title.xAxis);
    
    // draw y-axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ", 0)")
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left )
        .attr('x', -(height / 2))
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(title.yAxis);
    
    // draw title
    svg.append('text')
        .attr("x", width / 2)
        .attr("y", 0 + (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", '18px')
        .style("font-weight", "bold")
        .text(title.chartTitle);
    
    
    // Draw Confidence Intervals
    var confidence3sd_lower = d3.svg.line()
        .x(function (d) { return xScale(d['sample_size']); })
        .y(function (d) {
           if (d['minus_3sd'] < 0.0) {
                return yScale(0);
           } else {
                return yScale(d['minus_3sd']);
           }
        }).interpolate("linear");
    var confidence3sd_upper = d3.svg.line()
        .x(function (d) { return xScale(d['sample_size']); })
        .y(function (d) { return yScale(d['plus_3sd']); })
        .interpolate("linear");
    var confidence2sd_lower = d3.svg.line()
        .x(function (d) { return xScale(d['sample_size']); })
        .y(function (d) {
           if (d['minus_2sd'] < 0.0) {
                return yScale(0);
           } else {
                return yScale(d['minus_2sd']);
           }
        }).interpolate("linear");
    var confidence2sd_upper = d3.svg.line()
        .x(function (d) { return xScale(d['sample_size']); })
        .y(function (d) { return yScale(d['plus_2sd']); })
        .interpolate("linear");
    
    svg.append("svg:path")
        .attr("d", confidence2sd_upper(dataset))
        .attr("class", "confidence95");
    svg.append("svg:path")
        .attr("d", confidence2sd_lower(dataset))
        .attr("class", "confidence95");
    svg.append("svg:path")
        .attr("d", confidence3sd_upper(dataset))
        .attr("class", "confidence99");
    svg.append("svg:path")
        .attr("d", confidence3sd_lower(dataset))
        .attr("class", "confidence99");
    
    // Draw center line to indicate mean.
    svg.append("svg:line")
        .attr("x1", xScale(min_x))
        .attr("y1", yScale(avg))
        .attr("x2", xScale(max_x))
        .attr("y2", yScale(avg))
        //.style("stroke", "rgba(6, 120, 155, 0.6)")
        .style("stroke", "rgba(101, 200, 128, 1.0)")
        .style("stroke-width", 2)
        .on("mouseover", function (d, i) {
            $('div.tooltip').show();
            tooltip.transition().duration(100).style("opacity", 1);
        }).on("mousemove", function () {
            var divHtml = '<h4>Mean Value</h4>';
                divHtml += (avg * 100).toFixed(2) + '%';
              
            var left_position = (d3.event.pageX - 2) + "px";
            tooltip.html(divHtml).style("left", left_position).style('top', (d3.event.pageY - 80) + "px");
       }).on("mouseout", function (d, i) {
            tooltip.transition().duration(100).style("opacity", 1e-6);
       });
    
    // Create Circles
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        //.attr("fill", function (d) { return (d['hid'] == global_hid ? "rgba(236, 122, 8, 0.75)" : "rgba(22, 68, 81, 0.6)"); })
        .attr("fill", function (d) {
              //var val = d['percentage'];
              //if (d['hid'] == global_hid) return "rgba(236, 122, 8, 0.6)";
              ////else if (val > d['plus_3sd'] || val < d['minus_3sd']) return "rgba(255, 0, 0, 0.6)";
              ////else if (val > d['plus_2sd'] || val < d['minus_2sd']) return "rgba(205, 205, 0, 0.6)";
              //else return "rgba(22, 68, 81, 0.6)";
              return "rgba(22, 68, 81, 0.6)";
              })
        .attr("cx", function (d) {
              return xScale(d['sample_size']);
              })
        .attr("cy", function (d) {
              return yScale(d['percentage']);
              })
        .attr("name", function (d) {
              return $.inArray(d['group'], sorted_groups);
              })
        .attr("r", 5)
        .on("mouseover", function (d, i) {
            $("div.tooltip").show();
            tooltip.transition().duration(100).style("opacity", 1);
            //if (d['hid'] == global_hid) {
            //// Possibly highlight circle
            //}
        }).on("mousemove", function (d, i) {
              var divHtml = '<strong>Group ID: ' + d['group'] + '</strong><br/>';
              //divHtml += '<strong>Incidences: </strong> ' + d['indicator'] + '<br/>';
              //divHtml += '<strong>Population: </strong> ' + d['sample_size'] + '<br/>';
              //divHtml += '<strong>Percentage: </strong> ' + (d['ratio'] * 100).toFixed(2) + '%';
              divHtml += 'Incidences: ' + d['incidences'] + '<br/>';
              divHtml += 'Population: ' + d['sample_size'] + '<br/>';
              divHtml += 'Percentage: ' + (d['percentage'] * 100).toFixed(2) + '%';
              
              if ($(window).width() - d3.event.pageX < 160) {
                var left_position = (d3.event.pageX - 155) + "px";
              } else {
                var left_position = (d3.event.pageX - 2) + "px";
              }
              tooltip.html(divHtml).style("left", left_position).style("top", (d3.event.pageY - 80) + "px");
        }).on("mouseout", function (d, i) {
              tooltip.transition().duration(100).style("opacity", 1e-6);
        });
    
    // If there isn't any data, show messsage
    if (dataset.length == 0) {
        svg.append('text')
           .attr("x", width / 2)
           .attr("y", height / 2)
           .attr("text-anchor", "middle")
           .attr("class", "no-data")
           .style("font-size", "20px")
           .text("No Data Available");
        
        $(selector + " svg g :not(.no-data)").hide();
        //$(selector).closest('.chart-container').find('.date-toggle').hide();
    }
}
