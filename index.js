document.addEventListener('DOMContentLoaded', () => {
  fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Response for json file was not ok");
      }
      return response.json();
    })
    .then(response => {
      const dataSet = response.monthlyVariance;

      let years = [];
      let months = [];
      let variances = [];

      const w = 900;
      const h = 500;
      const padding = 40;

      dataSet.forEach((el, index) => {
        years[index] = el.year;
        months[index] = el.month;
        variances[index] = el.variance;
      });

      const startYear = years[0];
      const endYear = years[years.length - 1];
       
      const cellWidth = (w - padding) / (endYear - startYear);
      
      const xScale = d3.scaleLinear()
        .domain([d3.min(years), d3.max(years)])
        .range([padding, w - padding]);

      const yScale = d3.scaleBand() // scaleBand is used here because months need to be discrete categories/values
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range([padding, h - padding])
        .padding(0.05);

      const rectHeight = yScale.bandwidth();

      console.log(d3.min(months));
      console.log(d3.max(months));

      const svg = d3.select("#chart")
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .style("background-color", "white")
        .style("box-shadow", "10px 10px 5px 0px rgba(0, 0, 0, 0.5)");
      
      const maxVarianceAbsValue = d3.max(variances) + Math.abs(d3.min(variances));
      const rectColors = [
        "navy", "blue", "aqua", "lightblue", 
        "yellow", "orange", "red", "darkred", 
        "purple"];
      const colorUnitValue = maxVarianceAbsValue / rectColors.length; // used in logic for assigning color to a rect
      const varianceScale = d3.scaleLinear()
        .domain([d3.min(variances), d3.max(variances)])
        .range([0, maxVarianceAbsValue]);

      svg.selectAll("rect")
        .data(dataSet)
        .enter()
        .append("rect")
        .attr("id", (d, i) => i)
        .attr("class", "cell")
        .attr("width", cellWidth)
        .attr("height", rectHeight) // 12 months
        .attr("x", (d) => {
          return xScale(d.year);
        })
        .attr("y", (d) => {
          return yScale(d.month); 
        })
        .attr("fill", (d) => {
          for (let i = 0; i < rectColors.length; i++) {
            if (varianceScale(d.variance) <= colorUnitValue * (i + 1)) {
              return rectColors[i];
            }
          }
        });
      
      

      

    })
    .catch(error => {
      console.error("There was a problem fetching json data", error);
    });
});