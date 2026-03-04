# Module 1 — Vectors

> color: "#1565C0"
> description: Case Study 1, Case Study 2, Lab, Homework. Vector addition, dot and cross product.

## What is a Vector?

> section: intro
> id: intro-slider

A **vector** has magnitude and direction. Set components: x = ${vx}{vx|3|-5,5,1}, y = ${vy}{vy|2|-5,5,1}

Magnitude ≈ **${round(sqrt(vx\*vx + vy\*vy), 2)}**

    figure: svg#vector-intro(width=340 height=340)

---

## Vector Addition

> section: addition
> id: addition-interactive

**a**: x = ${ax}{ax|2|-4,4,1}, y = ${ay}{ay|1|-4,4,1} &nbsp;&nbsp; **b**: x = ${bx}{bx|1|-4,4,1}, y = ${by}{by|3|-4,4,1}

**a + b** = (${ax+bx}, ${ay+by})

    figure: svg#vector-add(width=340 height=340)

---

> section: addition
> id: addition-quiz
> goals: blank-0 blank-1

**Practice:** What is (2,3) + (8,7)? Enter the two components.

**(2,3) + (8,7) = ( [[10]], [[10]] )**

---

## Vector Subtraction

> section: subtraction
> id: sub-interactive

**a**: x = ${ax2}{ax2|3|-4,4,1}, y = ${ay2}{ay2|2|-4,4,1} &nbsp;&nbsp; **b**: x = ${bx2}{bx2|1|-4,4,1}, y = ${by2}{by2|3|-4,4,1}

**a − b** = (${ax2-bx2}, ${ay2-by2})

    figure: svg#vector-sub(width=340 height=340)

---

## Dot Product

> section: dot-product
> id: dot-interactive

**a**: x = ${dax}{dax|3|-4,4,1}, y = ${day}{day|1|-4,4,1} &nbsp;&nbsp; **b**: x = ${dbx}{dbx|1|-4,4,1}, y = ${dby}{dby|2|-4,4,1}

**a · b** = ${dax\*dbx + day\*dby} &nbsp;&nbsp; Angle ≈ **${round(acos(max(-1,min(1,(dax\*dbx+day\*dby)/(max(0.01,sqrt(dax\*dax+day\*day))\*max(0.01,sqrt(dbx\*dbx+dby\*dby))))))\*180/pi, 1)}°**

    figure: svg#vector-dot(width=340 height=340)

---

## Cross Product

> section: cross-product
> id: cross-interactive

**a**: x = ${cax}{cax|3|-4,4,1}, y = ${cay}{cay|1|-4,4,1} &nbsp;&nbsp; **b**: x = ${cbx}{cbx|1|-4,4,1}, y = ${cby}{cby|2|-4,4,1}

**a × b** = ${cax\*cby - cay\*cbx} &nbsp;&nbsp; Parallelogram area = **${abs(cax\*cby - cay\*cbx)}** sq units

    figure: svg#vector-cross(width=340 height=340)

---

## Summary

> section: summary
> id: summary-1

| Operation | Formula | Result Type |
|-----------|---------|-------------|
| Addition | (a_x+b_x, a_y+b_y) | Vector |
| Subtraction | (a_x−b_x, a_y−b_y) | Vector |
| Dot Product | a_x·b_x + a_y·b_y | Scalar |
| Cross Product | a_x·b_y − a_y·b_x | Scalar (2D) |

