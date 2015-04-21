/*
 * csvtograph.js
 *
 * by Justin Ratra
 *
 * Runs on csvToGraphs/home.html
 * after page loads
 *
 */

$(document).ready(function () {

    // Read CSV File and load data into 'csvArray'
    var errorCount = 0;
    $("#csvfile").change(function (e) {
        errorCount++;
        
        var fileExt = e.target.files[0].name.split('.');
        fileExt = fileExt[fileExt.length-1];
        
        if (errorCount > 1 || fileExt !== "csv") {
        
          // Display File Read Error!
        
          alert("Error reading file!");
        
        } else {
          var reader = new FileReader();
          
          reader.onload = function (e) {
            var str = e.target.result;
            csvArray = [];
            csvArray = d3.csv.parseRows(str);
            
            // Remove labels from csv data set
            titles = csvArray[0];
            csvArray.splice(0, 1);
            
            // Add all CSV Column Names to DropDown menus
            var title_html = '<option value="">Select One</option>';
            for (var i = 0; i < titles.length; i++) {
                title_html += '<option value="' + i + '">' + titles[i] + '</option>';
            }
            $(".dataDrop").html(title_html);
        
          };
        
          //reader.readAsText(e.target.files.item(errorCount-1));
          reader.readAsText(e.target.files.item(0));
        }
        
    });
    
    // Handle Main Menu Tab Navigation
    $("ul.navbar-nav li").click(function (e) {
        e.preventDefault();
        var index = $(this).index();
        
        $(this).addClass("active").siblings().removeClass("active");
        if (index == 0) {
            $("#home-tab").show();
            $("#help-tab").hide();
        } else if (index == 1) {
            $("#help-tab").show();
            $("#home-tab").hide();
        }
        
        return false;
    });
    
    // Handle Help Tab Navigation
    $("#help-nav li").click(function (e) {
        e.preventDefault();
        $(this).addClass("active").siblings().removeClass("active");
        
        var index = $(this).index();
        
        $("#help-nav-tabs").children().hide();
        
        if (index == 0) {
            $("#help-gstart-tab").show();
        } else if (index == 1) {
            $("#help-charts-tab").show();
        } else if (index == 2) {
            $("#help-faqs-tab").show();
        }
        
        return false;
    });
    
    // Handle Switching Chart Type dropdown (for UI)
    $("#chart-type-select").change(function () {
        var chartType = $(this).val();
            
        $("#y-select-div, #incidences-select-div, #population-select-div").hide();
        
        if (chartType == "control") {
            $("#control-chart-type-div").show();
            var cType = $('input[name="control-type"]').val();
            
            if(cType == "x") {
                $("#y-select-div").show();
            } else if (cType == "p") {
                $("#incidences-select-div, #population-select-div").show();
            }
        } else {
            $("#control-chart-type-div").hide();
            $("#incidences-select-div, #population-select-div").show();
        }
    });
    $("#x-chart-radio").click(function () { $("#incidences-select-div, #population-select-div").hide(); $("#y-select-div").show(); });
    $("#p-chart-radio").click(function () { $("#incidences-select-div, #population-select-div").show(); $("#y-select-div").hide(); });
    
    // populate #datasets-select with all groups
    $("#group-by-select").change(function () {
        if($(this).find("option:selected").text() == "Select One") {
            // Do Not Group Data
            $("#datasets-select").html('<option value="all">Show All</option>');
        } else {
            var index = parseInt($(this).val());
            
            //ExtractGroupFromCSV(index);
            groups = ExtractFromCSV(index);
            
            var datasets_html = '<option value="all">Show All</option>';
            for (var i = 0; i < groups.length; i++) {
                datasets_html += '<option value="' + groups[i] + '">' + groups[i] + '</option>';
            }
            
            $("#datasets-select").html(datasets_html);
        }
    });
    
    // populate #x-labels-select with all x axis labels
    $("#x-select").change(function () {
        if($(this).find("option:selected").text() == "Select One") {
            // Do Not Group Data
            $("#x-labels-select").html('<option value="all">Show All</option>');
        } else {
            var index = parseInt($(this).val());
            
            //ExtractGroupFromCSV(index);
            xLabels = ExtractFromCSV(index);
            
            var xlabels_html = '<option value="all">Show All</option>';
            for (var i = 0; i < xLabels.length; i++) {
                xlabels_html += '<option value="' + xLabels[i] + '">' + xLabels[i] + '</option>';
            }
            
            $("#x-labels-select").html(xlabels_html);
        }
    });
    
    // Creating Charts
    $("#create-chart-btn").click(function (e) {
        e.preventDefault();
        
        // set values to create chart
        //$("#chart-type-select").val("funnel");
        //$("#group-by-select").val("0").trigger('change');
        //$("#x-select").val("1").trigger('change');
        //$("#y-select").val("4");
        //$("#population-select").val("2");
        //$("#incidences-select").val("3");
        
        // Get values to create chart
        var chartType = $("#chart-type-select").val();
        var groupCol = $("#group-by-select").val();
        var xAxisCol = $("#x-select").val();
        var yAxisCol = $("#y-select").val();
        var populationCol = $("#population-select").val();
        var incidencesCol = $("#incidences-select").val();
        var xlbls = $("#x-labels-select").val();
        if (xlbls[0] == "all") {
            var arr = [];
            $("#x-labels-select option").each(function () {
                arr.push($(this).val());
            });
            arr.splice(0,1);
            xlbls = arr;
        }
        var grps = $("#datasets-select").val();
        if (grps[0] == "all") {
            var arr = [];
            $("#datasets-select option").each(function () {
                arr.push($(this).val());
            });
            arr.splice(0,1);
            grps = arr;
        }
        
        var chartLabels = {
            xAxis: $("#xaxis-title-text").val(),
            yAxis: $("#yaxis-title-text").val(),
            chartTitle: $("#chart-title-text").val()
        };
        
        if (chartType == "control") {
            var data = csvToControlChartData({
                            Y_COL: yAxisCol,
                            X_COL: xAxisCol,
                            SAMPLE_COL: populationCol,
                            INCIDENCE_COL: incidencesCol,
                            GROUP_COL: groupCol,
                            GROUPS: grps,
                            XLABELS: xlbls
                                 });
            //console.log(data);
            
            $("#chartDiv").empty();
            
            // Draw Chart
            var chartOpts = { label: chartLabels,
                              width: 760,
                              height: 400,
                              margin: { left: 100, right: 60, top: 20, bottom: 50 },
                              selector: "#chartDiv" };
                              
            drawControlChart(data, chartOpts);
        } else if (chartType == "funnel") {
            var data = csvToFunnelChartData({
                            Y_COL: yAxisCol,
                            X_COL: xAxisCol,
                            SAMPLE_COL: populationCol,
                            INCIDENCE_COL: incidencesCol,
                            GROUP_COL: groupCol,
                            GROUPS: grps,
                            XLABELS: xlbls
                                 });
            //console.log(data);
            
            $("#chartDiv").empty();
            
            var margin = { left: 60, right: 10, top: 30, bottom: 50 }
            
            // Draw Chart
            var chartOpts = { label: chartLabels,
                              margin: margin,
                              width: 760,
                              height: 400,
                              selector: "#chartDiv" };
                              
            drawFunnelChart(data, chartOpts);
        }
        
        return false;
    });
    
    // Handle Print Button
    $("#print-page-btn").click(function () {
        $(".print-area").printArea();
    });
});
