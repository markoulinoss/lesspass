import { expect, vi } from "vitest";
import { render, renderWithProviders } from "../../tests/renders";
import { MasterPasswordInput } from "./masterPasswordInput";
import { useForm } from "react-hook-form";

describe("Master password", () => {
  const ManagedMasterPasswordInput = () => {
    const { register } = useForm<{ password: string }>({
      defaultValues: { password: "" },
    });
    return (
      <form onSubmit={vi.fn()}>
        <label htmlFor="password">Master password</label>
        <MasterPasswordInput
          id="password"
          placeholder="Master password"
          autoComplete="new-password"
          {...register("password")}
        />
      </form>
    );
  };

  test("should display real input value after 500ms", async () => {
    const { user, queryByTestId, findByTestId } = render(
      <ManagedMasterPasswordInput />,
    );
    const masterPasswordInput = queryByTestId("password") as HTMLInputElement;
    expect(masterPasswordInput.type).toBe("password");

    await user.type(masterPasswordInput, "password");
    expect(masterPasswordInput).toHaveValue("password");

    const expectedFingerprintIcons = [
      "icon-fa-flask",
      "icon-fa-archive",
      "icon-fa-beer",
    ];

    // check not all expected icons are present when user type
    expect(
      expectedFingerprintIcons.filter(
        (iconName) => queryByTestId(iconName) !== null,
      ).length,
    ).toBeLessThan(3);

    // wait for the expected icons to be present after 500ms
    await findByTestId(expectedFingerprintIcons[0]);
    await findByTestId(expectedFingerprintIcons[1]);
    await findByTestId(expectedFingerprintIcons[2]);

    // now check icons are the expected icons
    expect(
      expectedFingerprintIcons.filter(
        (iconName) => queryByTestId(iconName) !== null,
      ).length,
    ).toBe(3);
  });

  // check that it does not introduce a breaking change
  test("short master password does not block the form", async () => {
    const { user, queryByTestId } = render(<ManagedMasterPasswordInput />);
    const masterPasswordInput = queryByTestId("password") as HTMLInputElement;

    await user.type(masterPasswordInput, "short");
    expect(masterPasswordInput).not.toHaveAttribute("minlength");
    expect(masterPasswordInput.checkValidity()).toBe(true);
  });

  test("should not display a safe color while under the minimum length", async () => {
    const { user, queryByTestId } = render(<ManagedMasterPasswordInput />);
    const masterPasswordInput = queryByTestId("password") as HTMLInputElement;

    await user.type(masterPasswordInput, "Tr0ub4d&3");
    const output = document.querySelector("output");
    expect(output?.className).toContain("text-amber-600");
    expect(output?.className).not.toContain("text-green-500");
  });

  test("should display password strength feedback when typing", async () => {
    const { user, queryByTestId } = render(<ManagedMasterPasswordInput />);
    const masterPasswordInput = queryByTestId("password") as HTMLInputElement;

    // no feedback before typing
    expect(document.querySelector("output")).toBeNull();

    // feedback appears after typing
    await user.type(masterPasswordInput, "password");
    expect(document.querySelector("output")).not.toBeNull();
  });

  test("should not display a warning before typing", async () => {
    render(<ManagedMasterPasswordInput />);
    expect(document.querySelector("output")).toBeNull();
  });

  test("should display the translated too-short warning", async () => {
    const { user, queryByTestId } = renderWithProviders(<ManagedMasterPasswordInput />);
    const masterPasswordInput = queryByTestId("password") as HTMLInputElement;

    await user.type(masterPasswordInput, "a");
    const output = document.querySelector("output");
    expect(output?.textContent?.trim()).toBe("We recommend you use at least 10 characters");
  });
});
