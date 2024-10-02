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

      const w = 1100;
      const h = 650;
      const padding = 60;
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      const baseTemp = 8.66;

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
        "navy", 
        "blue", 
        "aqua", 
        "lightblue", 
        "yellow", 
        "orange",
        "crimson", 
        "red", 
        "darkred"];
      const colorUnitValue = maxVarianceAbsValue / rectColors.length; // used in logic for assigning color to a rect
      const varianceScale = d3.scaleLinear()
        .domain([d3.min(variances), d3.max(variances)])
        .range([0, maxVarianceAbsValue]);

      svg.selectAll("rect")
        .data(dataSet)
        .enter()
        .append("rect")
        .attr("id", (d, i) => i)
        .attr("data-month", (d) => (d.month - 1)) // the tests require the months to range from 0 to 11
        .attr("data-year", (d) => d.year)
        .attr("data-temp", (d) => d.variance)
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
      
      const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
      const yAxis = d3.axisLeft(yScale)
        .tickFormat((d, i) => {
          return monthNames[i];
        });

      // x axis
      svg.append("g")
        .attr("transform", "translate(0, " + (h - padding) + ")")
        .attr("id", "x-axis")
        .call(xAxis)
        .attr("color", "black");

      // y axis  
      svg.append("g")
        .attr("transform", "translate(" + padding + ", 0)")
        .attr("id", "y-axis")
        .call(yAxis)
        .attr("color", "black");
      
      // legend
      svg.append("g")
        .attr("id", "legend")
        .selectAll("rect")
        .data(rectColors)
        .enter()
        .append("rect")
        .attr("width", 40)
        .attr("height", 100)
        .attr("x", (d, i) => (w / 2 + 180) - ((rectColors.length - i) * 40)) // for centering
        .attr("y", -50)
        .attr("fill", (d) => d);
      

      function showToolTip(event) {
        const month = monthNames[event.target.getAttribute("data-month")];
        const year = event.target.getAttribute("data-year");
        const variance = event.target.getAttribute("data-temp");
        const temperature = (baseTemp + parseFloat(variance)).toFixed(2);

        tooltip.style.opacity = 1;

        tooltip.innerHTML = 
          `Month: ${month} <br/>
          Year: ${year} <br/>
          Temperature ${temperature} <br/>
          Variance: ${variance}`;
        
        /* 
        This attribute is just to satisfy the tests.
        I prefer the method I use above to access the
        information
        */
        d3.select("#tooltip")
          .attr("data-year", event.target.getAttribute("data-year"));  
      }

      function hideToolTip() {
        tooltip.innerText = "";
        tooltip.style.opacity = 0;
      }

      function captureLocation(event) {
        const x = event.clientX;
        const y = event.clientY;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;
      }

      const tooltip = document.getElementById("tooltip");
      const cells = document.getElementsByClassName("cell");
      for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener("mouseover", showToolTip);
        cells[i].addEventListener("mouseout", hideToolTip);
        cells[i].addEventListener("mousemove", captureLocation);
      }

      

    })
    .catch(error => {
      console.error("There was a problem fetching json data", error);
    });
});