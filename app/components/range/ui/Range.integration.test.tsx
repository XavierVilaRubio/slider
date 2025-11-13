import Range from "@/app/components/range/ui/Range";
import { fireEvent } from "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

const getNumericInput = async (label: string) => {
  return screen.findByRole<HTMLInputElement>("spinbutton", { name: label });
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
});
