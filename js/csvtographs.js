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
    
    $("#x-select").change(function() {
        if($(this).find("option:selected").text() == "Select One") {
            // Do Nothing
        } else {
            var index = parseInt($(this).val());
            xLabels = ExtractFromCSV(index)
        }
    });
    
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
        
        if (chartType == "control") {
            var data = csvToControlChartData({
                            Y_COL: yAxisCol,
                            X_COL: xAxisCol,
                            SAMPLE_COL: populationCol,
                            INCIDENCE_COL: incidencesCol,
                            GROUP_COL: groupCol
                                 });
            //console.log(data);
            
            $("#chartDiv").empty();
            
            // Draw Chart
            var chartOpts = { label: { xAxis: "Year", yAxis: "% of Infections", chartTitle: "Infection Population" },
                              width: 760,
                              height: 400,
                              margin: { left: 80, right: 60, top: 20, bottom: 50 },
                              selector: "#chartDiv" };
                              
            drawControlChart(data, chartOpts);
        } else if (chartType == "funnel") {
            var data = csvToFunnelChartData({
                            Y_COL: yAxisCol,
                            X_COL: xAxisCol,
                            SAMPLE_COL: populationCol,
                            INCIDENCE_COL: incidencesCol,
                            GROUP_COL: groupCol
                                 });
            //console.log(data);
            
            $("#chartDiv").empty();
            
            // Draw Chart
            var chartOpts = { label: { xAxis: "Population", yAxis: "% of Infections", chartTitle: "Infection Population by Group" },
                              width: 760,
                              height: 400,
                              margin: { left: 80, right: 60, top: 20, bottom: 50 },
                              selector: "#chartDiv" };
                              
            drawFunnelChart(data, chartOpts);
        }
        
        return false;
    });
                  
});
