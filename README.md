# Mango Frontend Test - Range Component

## Demo

The live demo for this project can be found here:  
[https://slider.xavivila.dev](https://slider.xavivila.dev)

---

## How to Run the Project

### Install Dependencies

To install the dependencies, run:

```bash
bun i
```

### Run Tests

To run both unit tests and end-to-end (E2E) tests, follow these steps:

#### Unit Tests

To run the unit tests, use the following command:

```bash
bun run test
```

#### E2E Tests

To run the e2e tests, use the following command:

```bash
bun run test:e2e
```

To run the e2e tests in Playwright UI mode, use the following command:

```bash
bun run test:e2e:ui
```

### .env

```bash
BASE_URL="http://demo3031494.mockable.io"
```

## Description

This project involves creating a `<Range />` component using **Next.js**. The component has two modes:

1. **Normal Range**: A configurable range with a minimum and maximum value.
2. **Fixed Values Range**: A range with a set of predefined fixed values.

---

## Description

### Mode 1: Normal Range

Route: `/exercise1`

**Requirements:**

- The component **must not be** an HTML5 `<input type="range">`. It must be a custom one.
- The user can drag two bullets (thumbs) along the range line.
- The user can click on the currency labels (min or max) and set a new value.
- The value should never be less than the min or greater than the max values.
- When hovering over a bullet, it should get larger, and the cursor should change to a draggable one.
- Dragging a bullet should change the cursor to a "dragging" cursor.
- The min and max values cannot be crossed in the range.
- Provide a mocked HTTP service returning min and max values (e.g., `{min: 1, max: 100}`) using a mock service like [Mockable.io](https://www.mockable.io/) or a custom mocked server.
- Write as many unit tests as possible.

---

### Mode 2: Fixed Values Range

Route: `/exercise2`

**Requirements:**

- The component **must not be** an HTML5 `<input type="range">`. It must be a custom one.
- Given a set of values: `[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]`, the user can only select these values along the range.
- Provide a mocked HTTP service that returns the array of numbers (e.g., `[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]`) using a mock service or a custom mocked server.
- For this type of range, the currency labels are not input-changeable; they are only labels.
- The user can drag two bullets (thumbs) along the range line.
- The min and max values cannot be crossed in the range.
- Write as many unit tests as possible.

---
