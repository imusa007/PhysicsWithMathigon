# Kinematics — Velocity vs Time

> color: "#FF6F00"
> description: Measure velocity at different times, plot your data, and extract acceleration from the slope.

## Background

> section: background
> id: background-1

In uniform acceleration, velocity and time are related by:

**v = v₀ + at**

where **a** is acceleration (the slope of a v-t graph) and **v₀** is the initial velocity
(the y-intercept). In this lab you will enter your measurements and the graph will
fit a straight line automatically.

---

## Data Entry & Live Plot

> section: data-lab
> id: data-table

Enter your (t, v) measurements in the table. The scatter plot and best-fit line
will update as you type.

    .lab-container
      .data-panel
        h3 Data Table
        table.vt-table
          thead
            tr
              th Time t (s)
              th Velocity v (m/s)
          tbody
            - for (let i = 0; i < 8; i++)
              tr
                td: input.t-val(type="number" step="0.1" placeholder=`t${i+1}`)
                td: input.v-val(type="number" step="0.1" placeholder=`v${i+1}`)
        .results-box#fit-results
          p Enter at least 2 data points to see the fit.

      .plot-panel
        svg#vt-plot(width=360 height=360)

---

## Analysis Questions

> section: analysis
> id: analysis-1

Based on your graph, answer the following:

1. What is the measured acceleration from the slope of your best-fit line?
2. Does your y-intercept make physical sense? What does it represent?
3. Estimate the uncertainty in your slope by considering how much the line could
   rotate and still pass through most of your data points.

