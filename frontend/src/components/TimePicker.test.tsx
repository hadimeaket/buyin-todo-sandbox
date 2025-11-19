import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TimePicker from "./ui/TimePicker";

describe("TimePicker - Edge Cases", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Value Validation", () => {
    it("handles empty value correctly", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText("--:--")).toBeInTheDocument();
    });

    it("formats valid time correctly (HH:MM)", () => {
      render(<TimePicker value="14:30" onChange={mockOnChange} />);
      const input = screen.getByDisplayValue("14:30");
      expect(input).toBeInTheDocument();
    });

    it("handles midnight (00:00) correctly", () => {
      render(<TimePicker value="00:00" onChange={mockOnChange} />);
      expect(screen.getByDisplayValue("00:00")).toBeInTheDocument();
    });

    it("handles end of day (23:59) correctly", () => {
      render(<TimePicker value="23:59" onChange={mockOnChange} />);
      expect(screen.getByDisplayValue("23:59")).toBeInTheDocument();
    });

    it("handles single-digit hours with leading zero", () => {
      render(<TimePicker value="09:15" onChange={mockOnChange} />);
      expect(screen.getByDisplayValue("09:15")).toBeInTheDocument();
    });

    it("handles single-digit minutes with leading zero", () => {
      render(<TimePicker value="14:05" onChange={mockOnChange} />);
      expect(screen.getByDisplayValue("14:05")).toBeInTheDocument();
    });
  });

  describe("Invalid Input Handling", () => {
    it("rejects invalid hour (>23)", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "25:30" } });

      // Should not call onChange with invalid time
      expect(mockOnChange).not.toHaveBeenCalledWith("25:30");
    });

    it("rejects invalid minute (>59)", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "14:60" } });

      expect(mockOnChange).not.toHaveBeenCalledWith("14:60");
    });

    it("rejects negative hour values", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "-01:30" } });

      expect(mockOnChange).not.toHaveBeenCalledWith("-01:30");
    });

    it("rejects negative minute values", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "14:-30" } });

      expect(mockOnChange).not.toHaveBeenCalledWith("14:-30");
    });

    it("handles non-numeric input gracefully", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "abc:def" } });

      expect(mockOnChange).not.toHaveBeenCalledWith("abc:def");
    });

    it("handles incomplete time format (missing minutes)", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "14:" } });

      // Should not accept incomplete format
      expect(input.value).not.toBe("14:");
    });

    it("handles incomplete time format (missing hours)", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: ":30" } });

      expect(input.value).not.toBe(":30");
    });
  });

  describe("Dropdown Selection", () => {
    it("opens dropdown when input is clicked", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.click(input);

      // Should show time options
      expect(screen.getByText("00:00")).toBeInTheDocument();
    });

    it("selects time from dropdown and calls onChange", async () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("14:30")).toBeInTheDocument();
      });

      const option = screen.getByText("14:30");
      fireEvent.click(option);

      expect(mockOnChange).toHaveBeenCalledWith("14:30");
    });

    it("closes dropdown after selecting time", async () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("14:30")).toBeInTheDocument();
      });

      const option = screen.getByText("14:30");
      fireEvent.click(option);

      await waitFor(() => {
        expect(screen.queryByText("15:00")).not.toBeInTheDocument();
      });
    });

    it("closes dropdown when clicking outside", async () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("14:30")).toBeInTheDocument();
      });

      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText("14:30")).not.toBeInTheDocument();
      });
    });
  });

  describe("Disabled State", () => {
    it("disables input when disabled prop is true", () => {
      render(
        <TimePicker value="14:30" onChange={mockOnChange} disabled={true} />
      );
      const input = screen.getByDisplayValue("14:30") as HTMLInputElement;

      expect(input).toBeDisabled();
    });

    it("does not open dropdown when disabled", () => {
      render(<TimePicker value="" onChange={mockOnChange} disabled={true} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.click(input);

      expect(screen.queryByText("00:00")).not.toBeInTheDocument();
    });

    it("does not accept input changes when disabled", () => {
      render(
        <TimePicker value="14:30" onChange={mockOnChange} disabled={true} />
      );
      const input = screen.getByDisplayValue("14:30") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "15:00" } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Clear Functionality", () => {
    it("clears time when clear button is clicked", () => {
      render(<TimePicker value="14:30" onChange={mockOnChange} />);

      const clearButton = screen.getByLabelText(/clear time/i);
      fireEvent.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith("");
    });

    it("does not show clear button when value is empty", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);

      expect(screen.queryByLabelText(/clear time/i)).not.toBeInTheDocument();
    });

    it("does not show clear button when disabled", () => {
      render(
        <TimePicker value="14:30" onChange={mockOnChange} disabled={true} />
      );

      expect(screen.queryByLabelText(/clear time/i)).not.toBeInTheDocument();
    });
  });

  describe("Label and Required Props", () => {
    it("displays label when provided", () => {
      render(
        <TimePicker
          value=""
          onChange={mockOnChange}
          label="Start Time"
          id="start-time"
        />
      );

      expect(screen.getByText("Start Time")).toBeInTheDocument();
    });

    it("displays required indicator when required is true", () => {
      render(
        <TimePicker
          value=""
          onChange={mockOnChange}
          label="Start Time"
          required={true}
        />
      );

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("associates label with input using id", () => {
      render(
        <TimePicker
          value=""
          onChange={mockOnChange}
          label="Start Time"
          id="start-time-input"
        />
      );

      const label = screen.getByText("Start Time");
      expect(label).toHaveAttribute("for", "start-time-input");
    });
  });

  describe("Time Intervals", () => {
    it("generates time options with 15-minute intervals by default", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.click(input);

      // Check for 15-minute intervals
      expect(screen.getByText("00:00")).toBeInTheDocument();
      expect(screen.getByText("00:15")).toBeInTheDocument();
      expect(screen.getByText("00:30")).toBeInTheDocument();
      expect(screen.getByText("00:45")).toBeInTheDocument();
    });

    it("includes all 24 hours in dropdown", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.click(input);

      expect(screen.getByText("00:00")).toBeInTheDocument();
      expect(screen.getByText("12:00")).toBeInTheDocument();
      expect(screen.getByText("23:45")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("allows manual time entry via keyboard", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "16:45" } });

      expect(mockOnChange).toHaveBeenCalledWith("16:45");
    });

    it("accepts Tab key to navigate away from input", () => {
      render(<TimePicker value="" onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText("--:--");

      fireEvent.keyDown(input, { key: "Tab", code: "Tab" });

      // Should not prevent default Tab behavior
      expect(input).toBeInTheDocument();
    });
  });
});
