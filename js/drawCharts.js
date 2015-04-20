/*
 * drawCharts.js
 *
 * by Justin Ratra
 */



// #######################
//   Bar Chart Functions 
// #######################

function DateToString(d) {      // JavaScript Date Object --> "MM/YYYY"
    var m = d.getMonth()+1;
    return ( (m < 10 ? "0"+m : m) + "/" + d.getFullYear());
}

function DateToString2(d) {
    return ((d.getMonth() + 1) + "/1/" + d.getFullYear());
}

function DateToString3(d) {
    return ((d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear());
}

function StringToDate(s) {      // MM/YYYY --> JavaScript Date Object
    var a = s.split("/");
    return new Date(a[1], a[0], 0);
    //return new Date(a[0] + "/01/" + a[1]);
}

function drawBarChart(barData, titles, width, height, selector) {
    var data = barData.data;
    var max = barData.max;
    var dateLabels = barData.dateLabels;
    var hospitalLabels = barData.hospitalLabels;
    var numHospitals = hospitalLabels.length;

    var tooltip = d3.select('body').append('div')
                                .attr('class', 'tooltip')
                                .style('opacity', 1e-6);

    var x0 = d3.scale.ordinal()
                       .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
			          .range([height, 0]);

    // Need to randomly generate colors based on number of hospitals
    // Also differentiate My Hospital vs others
    var color = d3.scale.ordinal()
	                      .range(randomColor({ count: numHospitals, hue: 'random', luminosity: 'bright' }));
    //var color = d3.interpolateRgb("#ffd", "#056");
    //var color = d3.scale.ordinal()
    //              .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var xAxis = d3.svg.axis()
			              .scale(x0)
			    	      .orient("bottom");

    var yAxis = d3.svg.axis()
			              .scale(y)
			    		  .orient("left");
    //.tickFormat(d3.format(".2s"));
    //.tickFormat(d3.format(function (d) { return d + "%"; }));

    var svg = d3.select(selector).append("svg")
			            .attr("width", width + margin.left + margin.right)
			    		.attr("height", height + margin.top + margin.bottom)
                        .attr("viewBox", "0 0 " + (width+margin.left+margin.right) + " " + (height+margin.top+margin.bottom))
	     	   	        .attr("preserveAspectRatio", "xMidYMid")
			    		.append("g")
			    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x0.domain(dateLabels);
    x1.domain(hospitalLabels).rangeRoundBands([0, x0.rangeBand()]);
    //y.domain([0, d3.max(data, function (d) { return d3.max(d.hospitals, function (d) { return d.value; }); })]);
    y.domain([0, max]);

    // draw x-axis
    svg.append("g")
    		    .attr("class", "x axis")
    		    .attr("transform", "translate(0," + height + ")")
    		    .call(xAxis)
                .append("text")
                .attr("x", width / 2)
                .attr('y', 30)
                .attr('dy', '.71em')
                .style('text-anchor', 'middle')
                .style('font-size', '14px')
                .text(titles.xAxis);

    // draw y-axis
    svg.append("g")
    		    .attr("class", "y axis")
    		    .call(yAxis)
    		    .append("text")
    		    .attr("transform", "rotate(-90)")
    		    .attr("y", "-50")
    		    .attr("x", -(height / 4))
    		    .attr("dy", ".71em")
    		    .style("text-anchor", "end")
    		    .style("font-size", "14px")
    		    .text(titles.yAxis);

    var state = svg.selectAll(".state")
    		    .data(data)
    		    .enter().append("g")
    		    .attr("class", "g")
    		    .attr("transform", function (d) { return "translate(" + x0(d.date) + ",0)"; });

    state.selectAll("rect")
	            .data(function (d) { return d.hospitals; })
    		    .enter().append("rect")
    		    .attr("width", x1.rangeBand())
	            .attr("x", function (d) { return x1(d.hid); })
	            .attr("y", function (d) { return y(d.ratio); })
	            .attr("height", function (d) { return height - y(d.ratio); })
	            .style("fill", function (d, i) { return color(i / (numHospitals - 1)); })
                .on("mouseover", function (d, i) {
                    $("div.tooltop").show();
                    tooltip.transition().duration(100).style("opacity", 1);
                }).on("mousemove", function (d, i) {
                    //var divHtml = '<h5>' + d['date'] + '</h5>';
                    var divHtml = '<strong>Date: </strong>' + d['date'] + '<br/>';
                    divHtml += '<strong>Hospital ID: </strong> ' + d['hid'] + '<br/>';
                    //divHtml += '<strong>Ratio: </strong> ' + (d['ratio'] * 100).toFixed(2) + '%' + '<br/>';
                    divHtml += '<strong>Ratio: </strong> ' + (d['ratio']).toFixed(2) + '%' + '<br/>';
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

    // draw title
    svg.append('text')
	            .attr("x", width / 2)
	            .attr("y", 0 - (margin.top / 2))
	            .attr("text-anchor", "middle")
	            .style("font-size", '18px')
                .style("font-weight", "bold")
	            .text(titles.chartTitle);

    var legend = svg.selectAll(".legend")
    		    .data(hospitalLabels.slice())
    		    .enter().append("g")
    		    .attr("class", "legend")
    		    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
    		    .attr("x", width - 18)
    		    .attr("width", 18)
    		    .attr("height", 18)
    		    .style("fill", color);

    legend.append("text")
    		    .attr("x", width - 24)
    		    .attr("y", 9)
    		    .attr("dy", ".35em")
    		    .style("text-anchor", "end")
    		    .text(function (d) { return d; });
}

// #######################
//   Run Chart Functions 
// #######################

function drawRunChart(dataObj, label, width, height, selector) {
    var data = dataObj.data;
    var avg = dataObj.avg;
    var stdev = dataObj.stdev;
    var min = dataObj.min;
    var max = dataObj.max;
    var interval = dataObj.interval;
    var print_percent = max == -Infinity ? true : false;
    var avg_line_bool = dataObj.avg_line;
    var avg_single_data = [];
    var ucl = dataObj.ucl;
    var lcl = dataObj.lcl;
    var hids = dataObj.hids;
    
   //console.log("data = ", data);
   console.log("Run Chart Title = ", label.chartTitle);
   console.log("Run Chart Data = ", dataObj);
    
    //var X_DATA_PARSE = d3.time.format("%Y-%m-%d").parse;
    //var X_DATA_PARSE = d3.time.format("%B/%Y").parse;
    var X_DATA_PARSE = d3.time.format("%m/%d/%Y").parse;
    
    if (interval !== "quarter") {
        //console.log("d3 time format parse");
        _.each(data, function (item) {
               _.each(item, function (o) {
                     o.date = X_DATA_PARSE(o.date);
               });
        });
        //console.log("d3 time format parse");
    } else {
        var quarterTicks = function (date, i) {
            if (i >= 0) {
                i++;
                var date2 = new Date();
                date2.setMonth(date.getMonth() - 1);
                var q = Math.ceil((date2.getMonth()) / 3);
                //console.log("date2 = ", date2);
                //console.log("Q + q = ", "Q" + q);
                
                if (q == 4) q = 1;
                else q++;

                
                return "Q" + q + " - " + date.getFullYear();
            }
        };
    }

    var x = d3.time.scale()
	     	             .range([0, width]);

    var y = d3.scale.linear()
	     	             .range([height, 0]);

    var xAxis = d3.svg.axis()
	     	                 .scale(x)
	     	   			     .orient("bottom");
    
    if (interval == "quarter") {
        xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.months, 3).tickFormat(quarterTicks);
    }

    var yAxis = d3.svg.axis()
	     	                 .scale(y)
	     	   			     .orient("left");
    
    //var color = d3.scale.ordinal()
	//                      .range(randomColor({ count: data.length, hue: 'blue' }));
    var color = data.length;
    if (color == 1)
        color = d3.scale.ordinal().range(randomColor({ count: data.length, hue: 'blue', luminosity: 'dark' }));
    else if (color == 2)
        color = d3.scale.ordinal().range(["#ec7a08", "#2b39b5"]);
    else
        color = d3.scale.ordinal().range(randomColor({ count: data.length, luminosity: 'bright' }));

    
    var svg = d3.select(selector).append("svg")
	     	                .attr("width", width + margin.left + margin.right)
	     	   	    		.attr("height", height + margin.top + margin.bottom)
	     	   	    		.attr("viewBox", "0 0 " + (width+margin.left+margin.right) + " " + (height+margin.top+margin.bottom))
	     	   	    		.attr("preserveAspectRatio", "xMidYMid")
	     	   				.append("g")
	     	   				.attr("transform", "translate(" + (margin.left-40) + "," + margin.top + ")");
    
    var line = d3.svg.line()
                 .interpolate("linear")
                 .x(function (d) { return x(d.date); })
                 .y(function (d) { return y(d.ratio); });
    

    var tooltip = d3.select('body').append('div')
                                .attr('class', 'tooltip')
                                .style('opacity', 1e-6);

    // Set X Domain
    x.domain([data[0][0].date, data[0][data[0].length-1].date]);

    // Set Y Domain (including Control Limits)
    var max = d3.max(data, function (d) { return (d3.max(d, function (d) { return d.ratio; })); });
    if (print_percent) max = d3.max(data, function (d) { return (d3.max(d, function (d) { return d.ucl; })); });
    if (ucl > max) max = ucl;
    y.domain([0, max]);
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
                   //.style('font-size', '14px')
                   .style('font-size', '11px')
                   .text(label.xAxis);

    // draw y-axis
    svg.append("g")
	               .attr("class", "y axis")
	      		   .call(yAxis)
	               .append("text")
	               .attr("transform", "rotate(-90)")
	      		   .attr("y", "-50")
	      		   .attr("x", -(height / 4))
	      		   .attr("dy", ".71em")
	      		   .style("text-anchor", "end")
                   //.style('font-size', '14px')
                   .style('font-size', '11px')
	      		   .text(label.yAxis);
    
    // Draw center line to indicate mean.
    svg.append("svg:line")
       .attr("x1", x(data[0][0].date))
       .attr("y1", y(avg))
       .attr("x2", x(data[0][data[0].length-1].date))
       .attr("y2", y(avg))
       .style("stroke", "rgba(0, 165, 46, 0.6)")
       .style("stroke-width", 2)
       .on("mouseover", function (d, i) {
           $('div.tooltip').show();
           tooltip.transition().duration(100).style("opacity", 1);
       }).on("mousemove", function () {
           //var divHtml = '<h4>Mean Value</h4>';
           //    if (print_percent) divHtml += avg.toFixed(2) + " %";
           //    else divHtml += avg.toFixed(2);
           var divHtml = '<strong>Mean:</strong>&emsp;';
               if (print_percent) divHtml += avg.toFixed(2) + ' %';
               else {
                 divHtml += avg.toFixed(2);
                 divHtml += '<br /><strong>StDev:</strong>&emsp;' + stdev.toFixed(2) + '<br />';
               }
             
           
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
           //.attr("fill", function (d) { return ((d.ratio > ucl || d.ratio < lcl) ? "rgba(220, 55, 41, 0.8)" : color (i / (data.length-1)) ); })
           //.attr("fill", function (d) { return ( print_percent ? (d.ratio > d.ucl || d.ratio < d.lcl) : (d.ratio > ucl || d.ratio < lcl) ? "rgba(220, 55, 41, 0.8)" : color (i / (data.length-1)) ); })
           .attr("fill", function (d) {
                 if (print_percent) {
                    if (d.ratio > d.ucl || d.ratio < d.lcl) return "rgba(220, 55, 41, 0.8";
                 } else {
                    if (d.ratio > ucl || d.ratio < lcl) return "rgba(220, 55, 41, 0.8)";
                 }
                 return color (i / (data.length-1));
            })
           .attr("cx", function (d) { return x(d.date); })
           .attr("cy", function (d) { return y(d.ratio); })
           .attr("r", 3)
           .on("mouseover", function (d, i) {
               $("div.tooltip").show();
               tooltip.transition().duration(100).style("opacity", 1);
           }).on("mousemove", function (d, i) {
               //var divHtml = '<h5><strong>Date:</strong>&emsp;' + DateToString(d.date) + '</h5>';
               //divHtml += '<h5><strong>Value:</strong>&emsp;' + d.ratio.toFixed(2) + '%</h5>';
               var num = d['ratio'];
               var divHtml = '<strong>Date:</strong>&emsp;' + DateToString(d.date) + '<br/>';
                   divHtml += '<strong>Hospital ID: </strong> ' + d['hid'] + '<br/>';
                 if (print_percent) {
                   divHtml += '<strong>Average: </strong> ' + num.toFixed(2) + '%' + '<br/>';
                 } else {
                   if (num % 1 === 0) divHtml += '<strong>Average: </strong> ' + num + '<br/>';
                   else divHtml += '<strong>Average: </strong> ' + num.toFixed(2) + '<br/>';
                 }
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

    if (print_percent) {
        // upper limit line
        var upper_limit_line = d3.svg.line()
                                     .x(function (d) { return x(d.date); })
                                     .y(function (d) { return y(d.ucl); })
                                     .interpolate("linear");
                                     //.interpolate("step-before");
        // lower limit line
        var lower_limit_line = d3.svg.line()
                                     .x(function (d) { return x(d.date); })
                                     .y(function (d) { return y(d.lcl); })
                                     .interpolate("linear");
                                     //.interpolate("step-before");
        svg.append("svg:path")
            .attr("class", "limit-line")
            .attr("fill", "none")
            .attr("d", upper_limit_line(data[0]));
        svg.append("svg:path")
            .attr("class", "limit-line")
            .attr("fill", "none")
            .attr("d", lower_limit_line(data[0]));
    } else {
        // upper limit line
        svg.append("line")
	                   .attr("class", "limit-line")
	        		   .attr({ x1: 0, y1: y(ucl), x2: width, y2: y(ucl) });
        svg.append("text")
	                   .attr({ x: width + 5, y: y(ucl) + 4 })
	        		   .text("UCL: " + ucl.toFixed(2));

        // lower limit line
        svg.append("line")
	                   .attr("class", "limit-line")
	        		   .attr({ x1: 0, y1: y(lcl), x2: width, y2: y(lcl) });
        svg.append("text")
	                   .attr({ x: width + 5, y: y(lcl) + 4 })
	        		   .text("LCL: " + lcl.toFixed(2));
    }
    
    
    // draw title
    svg.append('text')
	                    .attr("x", width / 2)
	                    .attr("y", 0 - (margin.top / 2))
	                    .attr("text-anchor", "middle")
                        .attr("class", "no-data")
	                    //.style("font-size", '18px')
	                    .style("font-size", "14px")
	                    .style("font-weight", "bold")
	                    .text(label.chartTitle);
   
   if ((ucl == lcl && ucl == 0) || isNaN(ucl)) {
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
    
    if (data.length >= 2) {
        var legend = svg;
        
        if (data.length >= 2) {
            legend = svg.selectAll(".legend")
    	    		    .data(hids)
    	    		    .enter().append("g")
    	    		    .attr("class", "legend")
    	    		    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
            
            legend.append("rect")
    	    		    .attr("x", width - 18)
    	    		    .attr("y", 11)
    	    		    .attr("width", 18)
    	    		    .attr("height", 18)
            .style("fill", function (d, i) { return color(i / (hids.length - 1)); });
                        //.style("fill", color(i / (data.length - 1)));
    	    		    //.style("fill", ["#4682b4", "#dc1e50"]);
    	    		    //.style("fill", ["rgba(70, 130, 180, 1.0)", "rgba(220, 30, 80, 0.4)"]);
        } else {
            legend = svg.selectAll(".legend")
    	    		    .data([global_hid, "AVG"])
    	    		    //.data(["AVG", global_hid])
    	    		    .enter().append("g")
    	    		    .attr("class", "legend")
    	    		    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
            
            legend.append("rect")
    	    		    .attr("x", width - 18)
    	    		    .attr("y", 11)
    	    		    .attr("width", 18)
    	    		    .attr("height", 18)
                        .style("fill", color);
    	    		    //.style("fill", ["#4682b4", "#dc1e50"]);
    	    		    //.style("fill", ["rgba(70, 130, 180, 1.0)", "rgba(220, 30, 80, 0.4)"]);
        }

        legend.append("text")
                    //.attr("x", width - 24)
                    // Translation Formula = y = 1.0982x + 4.1833
    			    .attr("x", function (d) { return (width + ($("#hidden-span").text(d).width() * 1.0982 + 4.1833)) })
    			    .attr("y", 20)
    			    .attr("dy", ".35em")
    			    .style("text-anchor", "end")
    			    .text(function (d) { return d; });
    }

    $(selector + " g.x g.tick text").map(function () {
        // translation formula 1:
        // y = 0.4932x + 11.422
        // translation formula 2:
        // y = 0.3961x + 14.865
        var text = $("#hidden-span").text($(this).text());

        var translation = text.width() * 0.4932 + 11.422;
        //var translation = text.width() * 0.3961 + 14.865;
        $(this).attr("transform", "rotate(-90), translate(" + "-" + translation + ", -14)");
        return;
    });
}

// #######################
//    Box Plot Functions
// #######################

// Function to Calculate Error Bars for Box and Whisker Plot
function iqr(k) {
    return function (d, i) {
        var q1 = d.quartiles[0];
        var q3 = d.quartiles[2];
        var iqr = (q3 - q1) * k;
        var i = -1;
        var j = d.length;

        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
    }
}

function drawBoxPlot(boxData, title, width, height, selector, boxLabels) {
    var data = boxData.data;
    var min = boxData.min;
    var max = boxData.max;
    
    console.log("Box Plot Title = ", title);
    console.log("Box Plot Data = ", data);

    var labels = true;
    //var labels = false;

    var chart = d3.box()
                  .whiskers(iqr(1.5))
        	      .height(height)
        		  .domain([0, max])
        		  .showLabels(labels);

    var svg = d3.select(selector)
                .append("svg")
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom + 50)
	     	   	.attr("viewBox", "0 0 " + (width+margin.left+margin.right) + " " + (height+margin.top+margin.bottom))
	     	   	.attr("preserveAspectRatio", "xMidYMid")
                .attr('class', 'box')
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scale.ordinal()
                    .domain(data.map(function (d) { return d[0] }))
                    .rangeRoundBands([0, width], 0.7, 0.3);

    var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient('bottom')

    var y = d3.scale.linear()
                    .domain([0, max])
                    .range([height + margin.top, 0 + margin.top]);

    var yAxis = d3.svg.axis()
                      .scale(y)
                      .orient('left');

    // draw box plots
    svg.selectAll('.box')
            .data(data)
            .enter()
            .append('g')
            .attr("transform", function (d) { return "translate(" + x(d[0]) + "," + margin.top + ")"; })
            .call(chart.width(x.rangeBand()));

    // draw title
    svg.append('text')
            .attr("x", width / 2)
            .attr("y", 0 + (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(title.chartTitle);

    // draw y-axis
    svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -(height / 4))
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .style('font-size', '14px')
            .text(title.yAxis);

    // draw x-axis
    svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (height + margin.top + 15) + ')')
            .call(xAxis)
            .selectAll("text")
                //.style("text-anchor", "end")
                .style("text-anchor", "start")
                //.attr("dx", "-.8em")
                .attr("dx", ".8em")
                .attr("dy", ".15em")
                //.attr("transform", function (d) { return "rotate(-65)"; })
                .attr("transform", "rotate(55)" )
            .append('text')
            .attr('x', width / 2)
            .attr('y', 85)
            .attr('dy', '.71em')
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .text(title.xAxis);
    
    
    if (!boxLabels) {
        $("text.whisker, text.box[text-anchor=end]").css("opacity", 1e-6);
        $("text.box[text-anchor=start]").css("font-weight", "bold");
        $("rect.box").closest("g").mouseover(function () {
            $(this).find("text.whisker, text.box[text-anchor=end]")
                    .css("opacity", 1);
        });
        $("rect.box").closest("g").mouseout(function () {
            $(this).find("text.whisker, text.box[text-anchor=end]")
                    .css("opacity", 1e-6);
        });
    }


    //$(selector + " g.x g.tick text").map(function () {
    //$("g.x g.tick text").map(function () {
    //    // translation formula 1:
    //    // y = 0.4932x + 11.422
    //    // translation formula 2:
    //    // y = 0.3961x + 14.865
    //    var text = $("#hidden-span").text($(this).text());

    //    //var translation = text.width() * 0.4932 + 11.422;
    //    var translation = text.width() * 0.3961 + 14.865;
    //    $(this).attr("transform", "rotate(90), translate(" + translation + ", -14)");
    //    return;
    //});

    //var chartHeight = $chartDiv.height();
    //$body.height(bodyHeight + (chartHeight / 2));
}

// #######################
//  Funnel Plot Functions
// #######################

//  --- Sorts dataset by population size
function compare(a, b) {
    if (a.sample_size < b.sample_size)
        return -1;
    if (a.sample_size > b.sample_size)
        return 1;
    return 0;
}

// Sort By Multiple Attributes helper functions
function dynamicSort(property) {
    return function (obj1, obj2) {
        return obj1[property] > obj2[property] ? 1
                        : obj1[property] < obj2[property] ? -1 : 0;
    }
}

function dynamicSortMultiple(props) {
    return function (obj1, obj2) {
        var i = 0, result = 0, numProps = props.length;

        while (result === 0 && i < numProps) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}

function drawFunnelPlot(data, title, width, height, selector) {
    var dataset = data.data;
    var sorted_names = data.names;
    var mean_incidence_rate = data.rate;
    
    console.log("Funnel Plot Data = ", data);

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
            	               .domain([0, d3.max(dataset, function (d) { return d3.max([d['ratio'], d['plus_3sd']]); })])
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
       //.style('font-size', '14px')
       .style('font-size', '11px')
       .text(title.xAxis);

    // draw y-axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + padding + ", 0)")
       .call(yAxis)
       .append('text')
       .attr('transform', 'rotate(-90)')
       .attr('y', '-50')
       .attr('x', -(height / 4))
       .attr('dy', '.71em')
       .style('text-anchor', 'end')
       //.style('font-size', '14px')
       .style('font-size', '11px')
       .text(title.yAxis);

    // draw title
    svg.append('text')
	   .attr("x", width / 2)
	   .attr("y", 0 + (margin.top / 2))
	   .attr("text-anchor", "middle")
	   //.style("font-size", '18px')
	   .style("font-size", '14px')
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
            	                })
            	                .interpolate("linear");
    var confidence3sd_upper = d3.svg.line()
            	                .x(function (d) {
            	                    return xScale(d['sample_size']);
            	                })
            	                .y(function (d) {
            	                    return yScale(d['plus_3sd']);
            	                })
            	                .interpolate("linear");
    var confidence2sd_lower = d3.svg.line()
            	                .x(function (d) {
            	                    return xScale(d['sample_size']);
            	                })
            	                .y(function (d) {
            	                    if (d['minus_2sd'] < 0.0) {
            	                        return yScale(0);
            	                    } else {
            	                        return yScale(d['minus_2sd']);
            	                    }
            	                })
            	                .interpolate("linear");
    var confidence2sd_upper = d3.svg.line()
            	                .x(function (d) {
            	                    return xScale(d['sample_size']);
            	                })
            	                .y(function (d) {
            	                    return yScale(d['plus_2sd']);
            	                })
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
       .attr("y1", yScale(mean_incidence_rate))
       .attr("x2", xScale(max_x))
       .attr("y2", yScale(mean_incidence_rate))
       //.style("stroke", "rgba(6, 120, 155, 0.6)")
       .style("stroke", "rgba(101, 200, 128, 1.0)")
       .style("stroke-width", 2)
       .on("mouseover", function (d, i) {
           $('div.tooltip').show();
           tooltip.transition().duration(100).style("opacity", 1);
       }).on("mousemove", function () {
           var divHtml = '<h4>Mean Value</h4>';
               divHtml += (mean_incidence_rate * 100).toFixed(2) + '%';
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
             var val = d['ratio'];
             if (d['hid'] == global_hid) return "rgba(236, 122, 8, 0.6)";
             //else if (val > d['plus_3sd'] || val < d['minus_3sd']) return "rgba(255, 0, 0, 0.6)";
             //else if (val > d['plus_2sd'] || val < d['minus_2sd']) return "rgba(205, 205, 0, 0.6)";
             else return "rgba(22, 68, 81, 0.6)";
       })
       .attr("cx", function (d) {
           return xScale(d['sample_size']);
       })
       .attr("cy", function (d) {
           return yScale(d['ratio']);
       })
       .attr("name", function (d) {
           return $.inArray(d['hid'], sorted_names);
       })
       .attr("r", 5)
       .on("mouseover", function (d, i) {
           $("div.tooltip").show();
           tooltip.transition().duration(100).style("opacity", 1);
           if (d['hid'] == global_hid) {
                // Possibly highlight circle
           }
       }).on("mousemove", function (d, i) {
           var divHtml = '<strong>Hospital ID: ' + d['hid'] + '</strong><br/>';
           //divHtml += '<strong>Incidences: </strong> ' + d['indicator'] + '<br/>';
           //divHtml += '<strong>Population: </strong> ' + d['sample_size'] + '<br/>';
           //divHtml += '<strong>Percentage: </strong> ' + (d['ratio'] * 100).toFixed(2) + '%';
           if (d['hid'] == global_hid) {
             divHtml += 'Incidences: ' + d['indicator'] + '<br/>';
             divHtml += 'Population: ' + d['sample_size'] + '<br/>';
           }
           divHtml += 'Percentage: ' + (d['ratio'] * 100).toFixed(2) + '%';

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

function customizeCSVData(chartData, Y_COL, X_COL, HID_COL, START_DATE, END_DATE, COMPLETE_BOOL) {
    // Returns data object formatted for SPC chart 
    //      depending on chartType value
    // 
    // chartType 
    //  1 = Run Chart                   Y_COL = number?
    //  2 = Box and Whisker Plot
    //  3 = Funnel Plot                 Y_COL = "Yes" / "No", add functionality for "Checked" / "Unchecked"
    //  4 = Bar Chart
    //
    var chartType = chartData.chartType;
    //var byMonth = chartData.byMonth;
    var interval = chartData.interval;
    var indicatorVal = chartData.indicator;

    // Handle Run Chart with multiple lines
    var avg_line = false;
    if (typeof HID_COL !== 'number') {
        HID_COL = HID_COL[0];
        avg_line = true;
    }

    if (chartType == 1) {           // Draw Run Chart
        var dataset = [];
        
        var hids = chartData.hids;

        var avg_count = 0;
        var avg_sum = 0;
        var variance_sum = 0;
        
        var min = Infinity;
        var max = -Infinity;
        
        // Need to get each month (and possibly year) between START_DATE and END_DATE
        var startMonth = START_DATE.getMonth() + 1;
        var startYear = START_DATE.getFullYear();
        var endMonth = END_DATE.getMonth() + 1;
        var endYear = END_DATE.getFullYear();
        var dateLabels = [];
        var jsDateLabels = [];
        //var qCount = 0;
        

        for (startYear; startYear <= endYear; startYear++) {
            if (interval == "month") {
                if (startYear < endYear) {
                    for (startMonth; startMonth <= 12; startMonth++) {
                        //var dateStr = startMonth + "/" + startYear;
                        var dateStr = startMonth + "/1/" + startYear;
                        dateLabels.push(dateStr);
                        var dateJs = new Date(startMonth + "/1/" + startYear);
                        jsDateLabels.push(dateJs);
                    }
                    startMonth = 1;
                } else if (startYear == endYear) {
                    for (startMonth; startMonth <= endMonth; startMonth++) {
                        //var dateStr = startMonth + "/" + startYear;
                        var dateStr = startMonth + "/1/" + startYear;
                        dateLabels.push(dateStr);
                        var dateJs = new Date(startMonth + "/1/" + startYear);
                        jsDateLabels.push(dateJs);
                    }
                } else { }
            } else if (interval == "year") {
                var dateStr = "1/1/" + startYear;
                dateLabels.push(dateStr);
                var dateJs = new Date("1/1/" + startYear);
                jsDateLabels.push(dateJs);
            } else if (interval == "quarter") {
                if (startYear < endYear) {
                    for (startMonth; startMonth <= 12; startMonth++) {
                        /*
                        if (qCount == 4) qCount = 0;
                        qCount++;
                        //var dateStr = startMonth + "/" + startYear;
                        if (qCount == 1) {
                            var dateStr = startMonth + "/1/" + startYear;
                            var dateJs = new Date(startMonth + "/1/" + startYear);
                            jsDateLabels.push(dateJs);
                            
                            dateStr = startMonth + " - " + (startMonth+2) + " " + startYear;
                            //dateStr = "Q" + ((startMonth % 3)+1) + " " + startYear;
                            dateLabels.push(dateStr);
                        }
                        */
                        if (startMonth == 1 || startMonth == 4 || startMonth == 7 || startMonth == 10) {
                            var dateStr = startMonth + "/1/" + startYear;
                            var dateJs = new Date(startMonth + "/1/" + startYear);
                            jsDateLabels.push(dateJs);
                            
                            dateStr = "Q" + ((startMonth % 3)+1) + " " + startYear;
                            dateLabels.push(dateStr);
                        }
                    }
                    startMonth = 1;
                } else if (startYear == endYear) {
                    for (startMonth; startMonth <= endMonth; startMonth++) {
                        /*
                        if (qCount == 4) qCount = 0;
                        qCount++;
                        
                        if (qCount == 1) {
                            var dateStr = startMonth + "/1/" + startYear;
                            var dateJs = new Date(startMonth + "/1/" + startYear);
                            jsDateLabels.push(dateJs);
                            
                            dateStr = startMonth + " - " + (startMonth+2) + " " + startYear;
                            //dateStr = "Q" + ((startMonth % 3)+1) + " " + startYear;
                            dateLabels.push(dateStr);
                        }
                        */
                        if (startMonth == 1 || startMonth == 4 || startMonth == 7 || startMonth == 10) {
                            //var dateStr = startMonth + "/" + startYear;
                            var dateStr = startMonth + "/1/" + startYear;
                            var dateJs = new Date(startMonth + "/1/" + startYear);
                            jsDateLabels.push(dateJs);
                            
                            dateLabels.push(dateStr);
                        }
                    }
                } else { }
            }
            
            /*
            if (byMonth) {
                if (startYear < endYear) {
                    for (startMonth; startMonth <= 12; startMonth++) {
                        //var dateStr = startMonth + "/" + startYear;
                        var dateStr = startMonth + "/1/" + startYear;
                        dateLabels.push(dateStr);
                        var dateJs = new Date(startMonth + "/1/" + startYear);
                        jsDateLabels.push(dateJs);
                    }
                    startMonth = 1;
                } else if (startYear == endYear) {
                    for (startMonth; startMonth <= endMonth; startMonth++) {
                        //var dateStr = startMonth + "/" + startYear;
                        var dateStr = startMonth + "/1/" + startYear;
                        dateLabels.push(dateStr);
                        var dateJs = new Date(startMonth + "/1/" + startYear);
                        jsDateLabels.push(dateJs);
                    }
                } else { }
            } else {
                //var dateStr = startYear;
                var dateStr = "1/1/" + startYear;
                dateLabels.push(dateStr);
                var dateJs = new Date("1/1/" + startYear);
                jsDateLabels.push(dateJs);
            }
            */
        }
        
        _.each(hids, function (hid) {
               /*
               var arr = [];
               _.each(dateLabels, function (date) {
                    arr.push({ date: date, hid: hid, sample_size: 0, indicator: 0, ratio: 0, vals: [] });
               });
               dataset.push(arr);
               */
               if (interval !== "quarter") {
                    var arr = [];
                    _.each(dateLabels, function (date) {
                         arr.push({ date: date, hid: hid, sample_size: 0, indicator: 0, ratio: 0, vals: [] });
                    });
                    dataset.push(arr);
               } else {
                    var arr = [];
                    _.each(jsDateLabels, function (date) {
                         arr.push({ date: date, hid: hid, sample_size: 0, indicator: 0, ratio: 0, vals: [] });
                    });
                    dataset.push(arr);
               }
        });
        
        //console.log("dataset = ", dataset);

        _.each(csvArray, function (item, i) {
               // Check if Data Row is complete
               if (COMPLETE_BOOL) {
                    if (!checkIfComplete(item))
                        return;
               }

            // Get Y-Axis indicator
            //var val = parseInt(item[Y_COL]);  -This assumes item[Y_COL] (y-axis) = number (not "Yes" or "Checked")
            var val = 0;
            //if (Y_COL == 77) { }
            if (Y_COL == global_cols["global_losend_col"].val) {
               //val = parseInt(item[Y_COL]) - parseInt(item[7]);     // Assumes item[77] = Day of Life at discharge, item[7] = Day of Life at admission
               //console.log("= globallosend");
               
               //console.log("item[Y_COL] = ", item[Y_COL]);
               //console.log("parseInt item[Y_COL] = ", parseInt(item[Y_COL]));
               //console.log("item[global_cols['global_losstart_col'].val] = ", item[global_cols["global_losstart_col"].val]);
               //console.log("parseInt item[global_cols['global_losstart_col'].val] = ", parseInt(item[global_cols["global_losstart_col"].val]));
               
               var dayOut = parseInt(item[Y_COL]);
               var dayIn = parseInt(item[global_cols["global_losstart_col"].val]);
               if (isNaN(dayIn)) dayIn = 1;
               
               //val = parseInt(item[Y_COL]) - parseInt(item[global_cols["global_losstart_col"].val]);     // Assumes item[77] = Day of Life at discharge, item[7] = Day of Life at admission
               //console.log("val = ", val);
               val = dayOut - dayIn;
            } else {
               val = item[Y_COL];
               //console.log("val = ", val);
            }

            // Get Date
            // This assumes item[X_COL] (x-axis) = datetime    (YYYY-MM-DD)
            //var dte = item[X_COL];
            //var jsDte = new Date(item[X_COL]);
            
            var jsDte = StringToDate(item[global_cols["global_birthmonth_col"].val] + "/" + item[global_cols["global_birthyear_col"].val]);
            
            var dteStr = DateToString2(jsDte);
            var dateIndex = $.inArray(dteStr, dateLabels);
            //var dateIndex = _.findIndex(dataset, { date: dteStr });
            //var dateIndex = -1;
            //dateIndex = $.map(dataset, function (obj, index) { if (obj.date == dteStr) return index; });
            //dateIndex = _.each(dataset, function (item, i) { if (item.date == dteStr) return i; });
               //console.log("dateIndex = ", dateIndex);
               
            if (interval == "quarter") {
               //console.log("interval = quarter");
               //console.log("jsDte = X_COL = ", jsDte);
               //console.log("jsDteLabels = ", jsDateLabels);
               var END = new Date("12/31/" + jsDateLabels[jsDateLabels.length-1].getFullYear());
               END.setHours(23, 59, 59, 999);
               
               for (var i = 0; i < jsDateLabels.length-1; i++) {
                    //console.log("if jsDte = ", jsDte);
                    //console.log(" >= jsDateLabels[i]", jsDateLabels[i]);
                    //console.log(" && < jsDateLabels[i+1]", jsDateLabels[i+1]);
                    var start = jsDateLabels[i];
                    if ((jsDte >= jsDateLabels[i]) && (jsDte < jsDateLabels[i+1])) {
                        dateIndex = i;
                        break;
                    }
               }
               if ((jsDte >= jsDateLabels[jsDateLabels.length-1]) && (jsDte <= END)) {
                   dateIndex = jsDateLabels.length-1;
               }
            }
            
            // Get Hospital ID
            var hid = item[HID_COL];
            var hospIndex = $.inArray(hid, hids);
            //var hospIndex = _.findIndex(allHids, hid);
            //var hospIndex = -1;
            //hospIndex = $.map(allHids, function (item, index) { if (item == hid) return index; });
            //hospIndex = _.each(allHids, function (item, i) { if(item == hid) return i; });

            // if jsDte is between START_DATE and END_DATE
            //    AND ((hid matches Global Hospital ID) OR (drawing avg line))
            //if ((dateIndex !== -1) && (jsDte >= START_DATE) && (jsDte < END_DATE) && (hid == global_hid || avg_line) && (val !== '') && (typeof val !== "undefined") && (jsDte !== '') && (typeof jsDte !== "undefined"))
            if ((dateIndex !== -1) && (jsDte >= START_DATE) && (jsDte < END_DATE) && (hid == global_hid || avg_line) && (typeof val !== "undefined") && (jsDte !== '') && (typeof jsDte !== "undefined")) {
               
               //console.log("indicatorVal = ", indicatorVal);
               //console.log("typeof indicatorVal = ", typeof indicatorVal);
               if (typeof indicatorVal === "number") {
                    //var num = parseInt(val);
                    var num = parseFloat(val);
                    if (isNaN(num)) return;
                    //console.log("num = ", num);
                    //console.log("dateIndex = ", dateIndex);
                    //console.log("dateLabels = ", dateLabels);
               
                    if (hospIndex !== -1) {
                        dataset[hospIndex][dateIndex].vals.push(num);
                        //dataset[hospIndex][dateIndex].avg_sum += num;
                        //dataset[hospIndex][dateIndex].avg_count++;
                    }
               
                    if (avg_line) {
                        dataset[hids.length-1][dateIndex].sample_size++;
                        dataset[hids.length-1][dateIndex].vals.push(num);
                    }
               
                    avg_sum += num;              // get total sum
                    avg_count++;
                    if (num > max) max = num;    // get maximum value
                    if (num < min) min = num;    // get minimum value
               } else {
                    if (hospIndex !== -1) {
                        dataset[hospIndex][dateIndex].sample_size++;
                        avg_count++;
               
                        if (val == indicatorVal) {
                            dataset[hospIndex][dateIndex].indicator++;
                            avg_sum++;
                        }
                    } else {
                        dataset[hids.length-1][dateIndex].sample_size++;
                        avg_count++;
               
                        if (val == indicatorVal) {
                            dataset[hids.length-1][dateIndex].indicator++;
                            avg_sum++;
                        }
                    }
               }

            }
        });

        var avg = avg_sum / avg_count;
        if (typeof indicatorVal !== "number") avg = avg_sum / (avg_count - avg_sum);
        //console.log("avg = ", avg);
        //console.log("avg_sum = ", avg_sum);
        //console.log("avg_count = ", avg_count);

        if (typeof indicatorVal === "number") {
            _.each(dataset, function (hidData) {
                  var sum = 0;
                  var items = [];
                  _.each(hidData, function (o) {
                        var current_sum = 0;
                        var size = o.vals.length;
                         
                        _.each(o.vals, function (item) {
                            //console.log("o.vals item = ", item);
                            variance_sum += ((item - avg) * (item - avg));
                            current_sum += item;
                            
                            sum += item;
                            items.push(item);
                        });
                        
                         o.sample_size = size;
                         
                        if (size > 0)
                            o.ratio = current_sum / size;
                        else
                            o.ratio = 0;
                  });
                   /*
                  if (hids.length > 1)
                  {
                   console.log("obj = ", obj);
                       dataset.push({ date: obj.hospitals[0].date, hid: 0, vals: items, ratio: sum / items.length, indicator: 0, sample_size: 0 });
                  }
                   */
            });
            //console.log("variance_sum = ", variance_sum);
            //console.log("avg_count = ", avg_count);
        } else {
            _.each(dataset, function (hidData) {
            
                   _.each(hidData, function (o) {
                        if (o.hid !== "AVG") {
                            if (o.sample_size == 0) {
                                o.ratio = 0;
                                o.lcl = 0;
                                o.ucl = 0;
                            } else {
                                o.ratio = (o.indicator / o.sample_size) * 100;
                                //o.ucl = (avg + (3 * (Math.sqrt(((avg * (1-avg))/o.sample_size))))).toFixed(2);
                                //o.lcl = (avg - (3 * (Math.sqrt(((avg * (1-avg))/o.sample_size))))).toFixed(2);
                                var ucl = 100 * (avg + (3 * (Math.sqrt(((avg * (1-avg))/o.sample_size)))));
                                var lcl = 100 * (avg - (3 * (Math.sqrt(((avg * (1-avg))/o.sample_size)))));
                          
                                if (ucl > 100) ucl = 100;
                                if (lcl < 0) lcl = 0;
                                o.ucl = ucl;
                                o.lcl = lcl;
                                //console.log("avg = ", avg);
                                //console.log("o.ucl = ", o.ucl);
                                //console.log("o.lcl = ", o.lcl);
                            }
                   
                            variance_sum += ((o.ratio - avg) * (o.ratio - avg));
                        } else {
                            if (o.sample_size == 0) {
                                o.ratio = 0;
                                o.ucl = 0;
                                o.lcl = 0;
                            } else {
                                o.ratio = (o.indicator / o.sample_size);
                                var ucl = 100 * (avg + (3 * (Math.sqrt(((avg * (1-avg))/o.sample_size)))));
                                var lcl = 100 * (avg - (3 * (Math.sqrt(((avg * (1-avg))/o.sample_size)))));
                          
                                if (ucl > 100) ucl = 100;
                                if (lcl < 0) lcl = 0;
                                o.ucl = ucl;
                                o.lcl = lcl;
                            }
                        }
                   });
                   
                   avg = avg * 100;
           });
        }

        //var variance = variance_sum / avg_count;          // Population Statistics
        var variance = variance_sum / (avg_count - 1);      // Sample Statistics
        //console.log("variance = ", variance);

        var stdev = Math.sqrt(variance);
        //console.log("stdev = ", stdev);

        var ucl = avg + (3 * stdev);
        if (typeof indicatorVal !== "number" && ucl > 100) ucl = 100;   // assumes ucl is a percentage
        var lcl = avg - (3 * stdev);
        if (lcl < 0) lcl = 0;       // assumes lcl cannot be negative

        // Sort data by date
        //console.log("run chart dataset = ", dataset);
        //dataset = _.sortBy(dataset, function (o) { var dt = new Date(o.date); return dt; });

        return { data: dataset, avg: avg, ucl: ucl, lcl: lcl, avg_line: avg_line, max: max, min: min, hids: hids, stdev: stdev, interval: interval };

    } else if (chartType == 2) {    // Draw Box and Whisker Plot
        var dataset = [];

        _.each(X_COL, function (item, i) {
            // Create X-Axis Label
            var labelText = $("#xDataDrop2").find("option[value='" + item + "']").text();
            
            var labelTextArr = labelText.split(/\(choice=(.*)\)/);
            if (labelTextArr.length > 1) {
               labelText = labelTextArr[1];
            }

            // Format dataset
            dataset[i] = [];
            dataset[i][0] = labelText;
            dataset[i][1] = [];
        });
        
        var max = -Infinity;
        var min = Infinity;

        // format data
        _.each(csvArray, function (item, i) {
               // Check if Data Row is complete
               if (COMPLETE_BOOL) {
                    if (!checkIfComplete(item))
                        return;
               }
               
            //var dte = item[global_cols["global_date_col"].val];
            //var jsDte = new Date(dte);
            
            var jsDte = StringToDate(item[global_cols["global_birthmonth_col"].val] + "/" + item[global_cols["global_birthyear_col"].val]);
            
            //console.log("dte = ", dte);
            //console.log("jsDte = ", jsDte);
            //console.log("START_DATE = ", START_DATE);
            //console.log("END_DATE = ", END_DATE);
            //console.log((jsDte >= START_DATE));

            //var num = parseInt(item[Y_COL]);
            var num = parseFloat(item[Y_COL]);
            if (Y_COL == global_cols["global_losend_col"].val) {
               var dayOut = parseInt(item[Y_COL]);
               var dayIn = parseInt(item[global_cols["global_losstart_col"].val]);
               if (isNaN(dayIn)) dayIn = 1;
               
               //num = parseInt(item[Y_COL]) - parseInt(item[global_cols["global_losstart_col"].val]);
               num = dayOut - dayIn;
               
               if (num < 1 || isNaN(num)) return;
            }
            var hid = item[HID_COL];

            // Checks if it is the right Hospital ID and within the Date Range
            if ((num !== '') && (!isNaN(num)) && (typeof num !== "undefined") && (hid == global_hid) && (jsDte >= START_DATE) && (jsDte <= END_DATE)) {
               //console.log("num = ", num);
                _.each(X_COL, function (header, i) {
                    if (item[header] == "Checked") {        // Assumes item[header] always = "Checked" / "Unchecked"
                        dataset[i][1].push(num);
                        if (num > max) max = num;
                        if (num < min) min = num;
                    }
                });
            }
        });
        
        // Adds a 0 item if there are no numbers in array to prevent NaN from showing in chart
        _.each(X_COL, function(item, i) {
            var arr = dataset[i][1];
            if (arr.length < 1) {
               arr.push(0);
            }
        });
        
        //console.log("dataset = ", dataset);
        return { data: dataset, min: min, max: max };
    } else if (chartType == 3) {	// Draw Funnel Plot 
        var funnelData = [];

        var indicatorVal = chartData.indicator;
        var total_population = 0;
        var incidence_population = 0;
        var sample_size = 0;
        var incidences = 0;

        //var jsFirstDate = new Date(csvArray[0][X_COL]);
        //var firstDate = (jsFirstDate.getMonth() + 1) + "/" + jsFirstDate.getFullYear();

        //funnelData[0] = { sample_size: 0, indicator: 0, date: firstDate, ratio: 0 };
        
        //console.log("allHids = ", allHids);
        _.each(allHids, function(item) {
               funnelData.push({ hid: item, sample_size: 0, indicator: 0, ratio: 0 });
        });
        //console.log("allHids = ", allHids);

        _.each(csvArray, function (item, i) {
               // Check if Data Row is complete
               if (COMPLETE_BOOL) {
                    if (!checkIfComplete(item))
                        return;
               }
               
            //var dte = (jsDate.getMonth() + 1) + "/" + jsDate.getFullYear();
            //var jsDate = new Date(item[X_COL]);
            
            var jsDate = StringToDate(item[global_cols["global_birthmonth_col"].val] + "/" + item[global_cols["global_birthyear_col"].val]);
            
            var indicator = item[Y_COL];
            var size = funnelData.length;
            var hid = item[HID_COL];
               
            var hidIndex = $.inArray(hid, allHids);
            //console.log("hid = ", hid);
            //console.log("hidIndex = ", hidIndex);
            
            //if (hid == "10") {
            //   console.log("START_DATE", START_DATE);
            //   console.log("END_DATE", END_DATE);
            //   console.log("indicator", indicator);
            //   console.log("size", size);
            //   console.log("hid", hid);
            //   console.log("hidIndex", hidIndex);
            //}

            // check if all items are defined, there is a valid hospital id, and date is within range
            //if ((hidIndex !== -1) && (jsDate >= START_DATE) && (jsDate <= END_DATE) && (indicator !== '') && (typeof indicator !== "undefined") && (jsDate !== '') && (typeof jsDate !== "undefined")) 
            if ((hidIndex !== -1) && (jsDate >= START_DATE) && (jsDate <= END_DATE) && (typeof indicator !== "undefined") && (jsDate !== '') && (typeof jsDate !== "undefined")) {
                    //if (hid == "10") {
                    //    console.log("Date", item[global_cols["global_birthmonth_col"].val] + "/" + item[global_cols["global_birthyear_col"].val]);
                    //    console.log("jsDate", jsDate);
                    //    console.log("indicator = ", indicator);
                    //    console.log("indicatorVal = ", indicatorVal);
                    //    indicator == indicatorVal ? console.log("i = ival!") : console.log("===not equal.===");
                    //    console.log("funnelData[hidIndex] = ", funnelData[hidIndex]);
                    //}
               
                    funnelData[hidIndex].sample_size++;
                    //if (indicator == "Yes")        // Assumes Indicator is always Yes/No
                    //console.log("indicator = ", indicator);
                    //console.log("indicatorVal = ", indicatorVal);
               
                    if (indicator == indicatorVal) {       // Assumes Indicator is always Yes/No
                        funnelData[hidIndex].indicator++;
                        incidence_population++;
                    }
               
                    total_population++;
            }
        });

        _.each(funnelData, function (item) {
               if (item.sample_size !== 0)
                    item.ratio = item.indicator / item.sample_size;
               else
                    item.ratio = 0;
        });

        // Calculate mean incidence over entire population
        var mean_incidence_rate = incidence_population / total_population;
        var mean_incidence = incidence_population / funnelData.length;

        var sigma_squared = mean_incidence_rate * (1 - mean_incidence_rate);

        // Create Sorted List of Labels
        var sorted_names = [];
        _.each(funnelData, function (item) {
            sorted_names.push(item["hid"]);
        });

        // Sorts dataset by population size for drawing confidence intervals
        funnelData.sort(compare);

        // Calculate standard error for each value: SE = SD / sqrt(n)
        //  ---Creating Control Limits/Confidence Intervals
        _.each(funnelData, function (item) {
            item['std_error'] = Math.sqrt(sigma_squared / item['sample_size']);
            item['plus_2sd'] = mean_incidence_rate + (2 * item['std_error']);
            item['minus_2sd'] = mean_incidence_rate - (2 * item['std_error']);
            item['plus_3sd'] = mean_incidence_rate + (3 * item['std_error']);
            item['minus_3sd'] = mean_incidence_rate - (3 * item['std_error']);
        });
        
        //console.log("funnelData = ", funnelData);

        return { data: funnelData, names: sorted_names, rate: mean_incidence_rate };
    } else if (chartType == 4) {    // Draw Bar Chart
        var barData = [];

        var byMonth = true;

        // Get Date Range from User Input
        /*
        var startDateText = $("#startDateText").val();
        var endDateText = $("#endDateText").val();
        var byMonth = true;

        if ($("#yearRadio:checked").length > 0)
            byMonth = false;

        //var START_DATE = new Date("2011-01-01");      // Date Range
        //var END_DATE = new Date("2015-12-31");      // Date Range
        var START_DATE = new Date(startDateText);      // Date Range
        var END_DATE = new Date(endDateText);      // Date Range
        */

        var idLabels = [];
        var dateLabels = [];

        // Need to get each month (and possibly year) between START_DATE and END_DATE
        var startMonth = START_DATE.getMonth() + 1;
        var startYear = START_DATE.getFullYear();
        var endMonth = END_DATE.getMonth() + 1;
        var endYear = END_DATE.getFullYear();

        for (startYear; startYear <= endYear; startYear++) {
            if (byMonth) {
                if (startYear < endYear) {
                    for (startMonth; startMonth <= 12; startMonth++) {
                        var dateStr = startMonth + "/" + startYear;
                        dateLabels.push(dateStr);

                        barData.push({ date: dateStr, hospitals: [] });
                    }
                    startMonth = 1;
                } else if (startYear == endYear) {
                    for (startMonth; startMonth <= endMonth; startMonth++) {
                        var dateStr = startMonth + "/" + startYear;
                        dateLabels.push(dateStr);

                        barData.push({ date: dateStr, hospitals: [] });
                    }
                } else { }
            } else {
                var dateStr = startYear;
                dateLabels.push(dateStr);
                barData.push({ date: dateStr, hospitals: [] });
            }
        }

        _.each(csvArray, function (item, i) {
               // Check if Data Row is complete
               if (COMPLETE_BOOL) {
                    if (!checkIfComplete(item))
                        return;
               }
               
            var item_date = new Date(item[X_COL]);
            var item_id = item[HID_COL];

            if (item_date > START_DATE && item_date < END_DATE && typeof item_id !== "undefined" && item_id !== '') {
                if (byMonth)
                    item_date = DateToString(item_date);
                else
                    item_date = item_date.getFullYear();

                var newId = $.inArray(item_id, idLabels);
                if (newId == -1) {
                    idLabels.push(item_id);

                    for (var i = 0; i < dateLabels.length; i++) {
                        barData[i].hospitals.push({
                            hid: item_id,
                            date: dateLabels[i],
                            indicator: 0,
                            sample_size: 0,
                            ratio: 0
                        });
                    }
                }

                var newDate = $.inArray(item_date, dateLabels);
                newId = $.inArray(item_id, idLabels);

                if (newDate !== -1 && newId !== -1) {
                    barData[newDate].hospitals[newId].sample_size++;
                    if (item[Y_COL] == "Yes") barData[newDate].hospitals[newId].indicator++;
                }
            }
        });

        var maxRatio = 0;

        _.each(barData, function (item) {
            var hospItems = item.hospitals;

            for (var i = 0; i < idLabels.length; i++) {
                if (hospItems[i].sample_size !== 0) {
                    var ratio = (hospItems[i].indicator / hospItems[i].sample_size) * 100;
                    hospItems[i].ratio = ratio;

                    if (ratio > maxRatio) maxRatio = ratio;
                }
            }
        });

        //console.log("idLabels = ", idLabels);
        //console.log("dateLabels = ", dateLabels);
        //console.log("barData = ", barData);

        return { data: barData, max: maxRatio, dateLabels: dateLabels, hospitalLabels: idLabels };
    }
}