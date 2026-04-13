import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("should render trigger element", () => {
    render(
      <ConfirmDialog
        trigger={<button>Delete</button>}
        title="Confirm Delete"
        description="Are you sure?"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should show dialog content when opened via controlled state", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm Action"
        description="This cannot be undone."
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("should render default button texts", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Are you sure?"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Continue")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should render custom button texts", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Are you sure?"
        confirmText="Yes, delete"
        cancelText="No, keep"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("No, keep")).toBeInTheDocument();
  });

  it("should show 'Processing...' when loading", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Wait..."
        loading={true}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("should disable buttons when loading", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Wait..."
        loading={true}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Cancel")).toBeDisabled();
    expect(screen.getByText("Processing...")).toBeDisabled();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Sure?"
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByText("Continue"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
