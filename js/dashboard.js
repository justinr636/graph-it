var margin = { top: 20, right: 50, bottom: 30, left: 50 };
var width = 960;
var height = 450;
//var width = 960;
//var height = 927

var csvArray = [];  // Stores CSV
var titles = [];    // Stores CSV Column Headers
var groups = [];

var allHids = [];   // Stores Unique Hospital IDs
var chartOptions = [];

function isNumeric(n) { return !isNaN(parseFloat(n)) && isFinite(n); }

function drawChart(opts) {
    var chartType = opts.options.chartType;
    
    if (chartType == 1) {           // Draw Run Chart
        drawRunChart(customizeCSVData(opts.options, opts.Y_COL, opts.X_COL, opts.HID_COL, opts.START_DATE, opts.END_DATE, global_complete),
                 opts.titles, opts.width, opts.height, opts.selector);
    } else if (chartType == 2) {    // Draw Box Plot
        // Customize Report - Box and Whisker Plot
        drawBoxPlot(customizeCSVData(opts.options, opts.Y_COL, opts.X_COL, opts.HID_COL, opts.START_DATE, opts.END_DATE, global_complete),
                    opts.titles, opts.width, opts.height, opts.selector, opts.boxLabels);
                             //{ yAxis: $yAxisTitleText.val(), xAxis: $xAxisTitleText.val(), chartTitle: $chartTitleText.val() },
                             //width - margin.left - margin.right,
                             //height - margin.top - margin.bottom,
                             //"div#custChartDiv");
    } else if (chartType == 3) {    // Draw Funnel Plot
        drawFunnelPlot(customizeCSVData(opts.options, opts.Y_COL, opts.X_COL, opts.HID_COL, opts.START_DATE, opts.END_DATE, global_complete),
                   opts.titles, opts.width, opts.height, opts.selector);
    } else if (chartType == 4) {    // Draw Bar Chart
    }
    
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

//function promptUserForColumns() {
//}

var global_hid = "AVG";
var global_complete = false;

var col_titles = [
                   //"global_date_col",
                   "global_birthmonth_col", "global_birthyear_col",
                   "global_losstart_col", "global_milk_col", "global_pharm_col",
                   "global_dischargemeds_col", "global_losend_col", "global_hid_col",
                   "global_weight_col", "global_maxcal_col", "global_locations_cols",
                   "global_mfdrugs_cols", "global_formulas_cols", "global_dismeds_cols",
                   "global_complete_col" ];

var global_cols = { };

for (var i = 0; i < col_titles.length; i++) {
    var str = col_titles[i];
    global_cols[str] = {};
    global_cols[str].val = -1;          // Index of CSV Column
    global_cols[str].name = [];         // CSV Header Text
}

//global_cols["global_date_col"].name.push("Date of Audit");
global_cols["global_birthmonth_col"].name.push("Birth Month (1-12)");
global_cols["global_birthyear_col"].name.push("Birth Year");

global_cols["global_losstart_col"].name.push("If outborn, what day of life was admission to your hospital?     Date of birth is day of life ONE.  ");
global_cols["global_losend_col"].name.push("What day of life was infant discharged from your hospital?    Day of birth is considered day of life ONE.  ");
global_cols["global_milk_col"].name.push("Did infant receive any of his/her mother's own milk at any time during hospitalization?  ");
global_cols["global_pharm_col"].name.push("Did infant receive pharmacologic agents for NAS?");
global_cols["global_dischargemeds_col"].name.push("At time of discharge or transfer from  your hospital, was infant receiving medications for NAS?");
global_cols["global_hid_col"].name.push("Your Hospital ID");
global_cols["global_weight_col"].name.push("Birth weight (Grams)");
global_cols["global_maxcal_col"].name.push("What was the maximum caloric density of human milk or formula given to infant during hospitalization?");
global_cols["global_locations_cols"].name.push("In what locations did the infant receive care during hospitalization?      Check all that apply. (choice=");
global_cols["global_mfdrugs_cols"].name.push("What were the maternal-fetal opioid exposures?      Check all that apply.  Information can come from maternal self-report, maternal, or neonatal toxicology screen.   Do not include if exposure was clearly ONLY in first trimester.  Short-acting opioids include codeine, oxycodone, hydrocodone, morphine, and hydromorphine.  Buprenorphine includes Subutex and Suboxone.  (choice=");
global_cols["global_mfdrugs_cols"].name.push("What were other maternal-fetal exposures of note?      Check all that apply.    Do not include if exposure was clearly only in first trimester.   (choice=");
global_cols["global_formulas_cols"].name.push("What types of formula did infant receive during hospitalization?      Check all that apply.   (choice=");
global_cols["global_dismeds_cols"].name.push("If yes, what medication was infant receiving at time of discharge or transfer?      Check all that apply.   (choice=");

global_cols["global_complete_col"].name.push("Complete?");


//global_cols["global_date_col"].name.push("");
global_cols["global_birthmonth_col"].name.push("month_of_birth");
global_cols["global_birthyear_col"].name.push("year_of_birth");

global_cols["global_losstart_col"].name.push("outborn_day_of_admission");
global_cols["global_losend_col"].name.push("discharge_day");
global_cols["global_milk_col"].name.push("hm_any");
global_cols["global_pharm_col"].name.push("pharm_tx_any");
global_cols["global_dischargemeds_col"].name.push("discharge_med");
global_cols["global_hid_col"].name.push("hospital_id");
global_cols["global_weight_col"].name.push("birth_weight");
global_cols["global_maxcal_col"].name.push("caloric_maximum");
global_cols["global_locations_cols"].name.push("care_locations_");
global_cols["global_mfdrugs_cols"].name.push("maternal_opioid_exposure_");
global_cols["global_formulas_cols"].name.push("formula_types_");
global_cols["global_dismeds_cols"].name.push("discharge_med_type_");

global_cols["global_complete_col"].name.push("neoqicnnepqin_nas_data_form_complete");

function validateCSVFile() {
// ensures hard-coded columns for Local and State Reports
// are in the proper location
    //console.log("titles = ", titles);
    
    // Check for values in cookies
    /*
    for (var property in global_cols) {
        if (global_cols.hasOwnProperty(property)) {
            if ((document.cookie.indexOf(property) >= 0) && (document.cookie.indexOf(property + "_text") >= 0)) {
                var val = parseInt(getCookie(property));
                var name = getCookie(property+"_text");
                global_cols[property].val = val;
                global_cols[property].name = name;
                //if (titles[global_cols[property].val] !== global_cols[property].name) {     // Checks if CSV column header == column header stored in user's cookie
                //    global_cols[property].val = -1;
                //}
                var nameArr = global_cols[property].name;
                
                //console.log("val = ", val);
                //console.log("name = ", name);
                //console.log("nameArr = ", nameArr);
                
                for (var i = 0; i < nameArr.length; i++) {      // Checks if CSV column header == column header stored in user's cookie
                    if (titles[val].indexOf(nameArr[i]) < 0) {
                        global_cols[property].val = -1;
                    }
                }
            }
        }
    }
    */

    // Check for specific CSV columns
    for (var i = 0; i < titles.length; i++) {
        
        var item = titles[i];
    
        for (var property in global_cols) {
            if (global_cols.hasOwnProperty(property)) {
                var propArr = property.split("_");
                var mult_cols = (propArr[propArr.length-1] == "cols");
                if (global_cols[property].val == -1 || mult_cols) {
                    //if (titles[i] == global_cols[property].name) {
                    //    global_cols[property].val = i;
                    //    setCookie(property, i, 365);
                    //    setCookie(property+"_text", titles[i], 365);
                    //}
                    var nameArr = global_cols[property].name;
                    for (var j = 0; j < nameArr.length; j++)
                    {
                        if (titles[i].indexOf(nameArr[j]) >= 0) {      // If global_header matches csv_header, store its index and header name in global_cols and cookies
                            if (mult_cols) {
                                if (typeof global_cols[property].val !== "number") global_cols[property].val.push(i);
                                else global_cols[property].val = [i];
                                
                                //setCookie(property, global_cols[property].val, 365);
                                //setCookie(property+"_text", nameArr[j], 365);
                            } else {
                                global_cols[property].val = i;
                                //setCookie(property, i, 365);
                                //setCookie(property+"_text", nameArr[j], 365);
                                break;
                            }
                            
                        }
                    }
                }
            }
        }
        
    }
    
    // Display Error Messages
    for (var property in global_cols) {
        if (global_cols.hasOwnProperty(property)) {
            if (global_cols[property].val == -1) {
                //var propArr = property.split('_');
                //$('#' + propArr[0] + '-' + propArr[1] + '-error').show();
                var propArr = property.split('_');
                if (propArr[propArr.length-1] !== "cols") {
                    var html =  '<div class="alert alert-warning global-var-error">' +
                                    $("#global-single-var-error-template").html() +
                                '</div>';
                    
                    var newDiv = $(html).appendTo("#global-var-error-wrapper");
                    newDiv.find(".global-prop-hidden").val(property);
                    newDiv.find("span.colName").text(global_cols[property].name[0]);
                    
                    if(property == "global_date_col" || property == "global_birthmonth_col" || property == "global_birthyear_col" || property == "global_hid_col") {
                        newDiv.removeClass("alert-warning");
                        newDiv.addClass("alert-danger");
                    }
                } else {
                    var html =  '<div class="alert alert-warning global-var-error">' +
                                    $("#global-mult-var-error-template").html() +
                                '</div>';
                    
                    var newDiv = $(html).appendTo("#global-var-error-wrapper");
                    newDiv.find(".global-prop-hidden").val(property);
                    newDiv.find("span.colName").text(global_cols[property].name[0]);
                }
            }
        }
    }
    
    console.log("global_cols = ", global_cols);
    //console.log("document.cookie = ", document.cookie);
}

function checkIfComplete(csv_item) {
    //if (item[complete_col] == "0" || item[complete_col] == "1" || item[complete_col] == "Incomplete" || item[complete_col] == "Unverified")
    //    return false;
    //else
    //    return true;
    var index = global_cols["global_complete_col"].val;
    
    if (csv_item[index] == "2" || csv_item[index] == "Complete")
        return true;
    else
        return false;
}

function validateComplete() {
    if (global_cols["global_complete_col"].val !== -1) {
        if ($(".complete-check:checked").length > 0) global_complete = true;
        else global_complete = false;
    } else {
        global_complete = false;
    }
}

function setCookie(cname, cval, cexdays) {
    var d = new Date();
    d.setTime(d.getTime() + (cexdays*24*60*60*1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cval + "; " + expires;
    
    //console.log("document.cookie = ", document.cookie);
    
    var isChromium = window.chrome,
        vendorName = window.navigator.vendor;
    if(isChromium !== null && isChromium !== "undefined" && vendorName === "Google Inc.") {
        // is Google chrome
        store.set(cname, cval);
        //if (window.localStorage !== "undefined") {
        //    //try {
        //    //    localStorage.setItem(cname, cval);
        //    //    //console.log("set cookie, name = ", name);
        //    //    //console.log("set cookie, val = ", val);
        //    //} catch (e) {
        //    //    console.log("Exceeded localStorage quota");
        //    //}
        //}
    }
}

function getCookie(cname) {
    var val = "";
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) val = c.substring(name.length, c.length);
    }
    
    var isChromium = window.chrome,
        vendorName = window.navigator.vendor;
    if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
        // is Google chrome
        val = store.get(cname);
        //if (window.localStorage !== "undefined") {
        //    val = localStorage.getItem(cname);
        //}
    }
    
    //console.log("got cookie, val = ", val);
    return val;
}