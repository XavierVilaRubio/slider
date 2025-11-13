import Range from "@/app/components/range/ui/Range";
import { fireEvent } from "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { vi } from "vitest";

const getNumericInput = async (label: string) => {
  return screen.findByRole<HTMLInputElement>("spinbutton", { name: label });
};

const createPointerEvent = (type: string, clientX: number) => {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as PointerEvent;
  Object.defineProperty(event, "clientX", { value: clientX });
  return event;
};

const dragThumb = (thumb: HTMLElement, from: number, to: number) => {
  act(() => {
    fireEvent.pointerDown(thumb, { clientX: from });
  });
  act(() => {
    window.dispatchEvent(createPointerEvent("pointermove", to));
  });
  act(() => {
    window.dispatchEvent(createPointerEvent("pointermove", to));
  });
  act(() => {
    window.dispatchEvent(createPointerEvent("pointerup", to));
  });
};

describe("Range integration", () => {
  it("allows continuous range adjustments via inputs and thumbs", async () => {
    const user = userEvent.setup();
    render(<Range min={0} max={100} step={5} />);

    const minInput = await getNumericInput("Minimum value");
    const maxInput = await getNumericInput("Maximum value");

    expect(minInput).toHaveValue(0);
    expect(maxInput).toHaveValue(100);

    await user.clear(minInput);
    await user.type(minInput, "15{enter}");

    expect(minInput).toHaveValue(15);
    expect(maxInput).toHaveValue(100);

    await user.clear(maxInput);
    await user.type(maxInput, "70{enter}");

    expect(maxInput).toHaveValue(70);

    const lowerThumb = screen.getByRole("slider", { name: "Lower bound" });
    const upperThumb = screen.getByRole("slider", { name: "Upper bound" });

    expect(lowerThumb).toHaveAttribute("aria-valuenow", "15");
    expect(upperThumb).toHaveAttribute("aria-valuenow", "70");

    act(() => {
      lowerThumb.focus();
    });
    expect(lowerThumb).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(lowerThumb).toHaveAttribute("aria-valuenow", "20");

    act(() => {
      upperThumb.focus();
    });
    expect(upperThumb).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(upperThumb).toHaveAttribute("aria-valuenow", "65");
  });

  it("renders fixed mode with labels and keyboard interaction", async () => {
    const user = userEvent.setup();
    render(<Range min={0} max={100} rangeValues={[10, 20, 40, 60, 80]} />);

    const minInput = await getNumericInput("Minimum value");
    const maxInput = await getNumericInput("Maximum value");

    expect(minInput).toBeDisabled();
    expect(maxInput).toBeDisabled();

    const labels = screen.getAllByText((content) => content.endsWith("€"));
    expect(labels).toHaveLength(5);

    const lowerThumb = screen.getByRole("slider", { name: "Lower bound" });
    const upperThumb = screen.getByRole("slider", { name: "Upper bound" });

    await user.click(lowerThumb);
    fireEvent.keyDown(lowerThumb, { key: "ArrowRight" });
    expect(lowerThumb).toHaveAttribute("aria-valuenow", "20");

    await user.click(upperThumb);
    fireEvent.keyDown(upperThumb, { key: "ArrowLeft" });
    expect(upperThumb).toHaveAttribute("aria-valuenow", "60");
  });

  it("updates values when dragging thumbs across the track", async () => {
    render(<Range min={0} max={100} step={5} />);

    const minInput = await getNumericInput("Minimum value");
    const maxInput = await getNumericInput("Maximum value");
    const lowerThumb = screen.getByRole("slider", { name: "Lower bound" });
    const upperThumb = screen.getByRole("slider", { name: "Upper bound" });
    const track = lowerThumb.parentElement as HTMLDivElement;

    const mockRect = {
      left: 100,
      right: 300,
      top: 0,
      bottom: 0,
      width: 200,
      height: 0,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    } satisfies DOMRect;
    const rectSpy = vi
      .spyOn(track, "getBoundingClientRect")
      .mockReturnValue(mockRect);

    dragThumb(lowerThumb, 100, 200);

    expect(lowerThumb).toHaveAttribute("aria-valuenow", "50");
    expect(minInput).toHaveValue(50);

    dragThumb(upperThumb, 300, 240);

    expect(upperThumb).toHaveAttribute("aria-valuenow", "70");
    expect(maxInput).toHaveValue(70);

    rectSpy.mockRestore();
  });
});
