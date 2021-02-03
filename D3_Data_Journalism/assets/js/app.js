// initiation of page size
var svgWidth = 820;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .classed("chart", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
        d3.max(censusData, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.9,
        d3.max(censusData, d => d[chosenYAxis]) * 1.1
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    // Change all circles positions based on the selection
    circlesGroup.selectAll("circle").transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    // Change the text positions based on the selection too
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
    
    if (chosenXAxis === "poverty") {
        xLabel = "Poverty: ";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age (Median): ";
    }
    else if (chosenXAxis === "income") {
        xLabel = "Household Income: "
    }

    var yLabel;

    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks Healthcare: ";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokers: ";
    }
    else if (chosenYAxis === "obesity") {
        yLabel = "Obesity: "
    }

    // create tooltip on the selection of states
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            // setting format for rates and income
            if (chosenXAxis === "poverty") {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}%<br>${yLabel} ${d[chosenYAxis]}%`);
            }
            else if (chosenXAxis === "income") {
                return (`${d.state}<br>${xLabel} $${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}%`);
            }
            else {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}%`);
            }
        });

    // call toop tip function by the mouse 
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
                    d3.select(this).select("circle").style("stroke", "black");
                    toolTip.show(data, this);
                    })
                // onmouseout event
                .on("mouseout", function (data) {
                    d3.select(this).select("circle").style("stroke", "#e3e3e3");
                    toolTip.hide(data, this);
                    });

    return circlesGroup;
}

// Loading the file
d3.csv("assets/data/data.csv").then((censusData, err) => {
    if (err) throw err;
    // parse data
    censusData.forEach(data => {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
    
    // Create a group of circles that will contain the data points 
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("g")

    // append initial circles
    circlesGroup.append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        .attr("opacity", "0.75");
    
    // After appending circles, in the same place,
    // Create text that contain abbr of states
    var textGroup = circlesGroup.append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", "0.35em")
        .text(d => d.abbr)
        .style("font-size", "12px")
        .style("text-anchor", "middle");
        
    
    // Create group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("aText active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("aText inactive", true)
        .text("Age (Median)");
    
    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("aText inactive", true)
        .text("Household Income (Median)");
    
    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)"); 
    
    var healthLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("text-anchor", "middle")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("aText active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("text-anchor", "middle")
        .attr("value", "smokes") // value to grab for event listener
        .classed("aText inactive", true)
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("text-anchor", "middle")
        .attr("value", "obesity") // value to grab for event listener
        .classed("aText inactive", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Create x-axis label event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    
    // Create y-axis label event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = yValue;

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(censusData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});