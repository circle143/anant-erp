import {
  PaymentPlanCreateProps,
  InputProps,
  planDetailsItem,
  RatioContainerProps,
  planRatioInputOnly,
  Scope,
  scopeSelect,
  conditionTypeSelect,
  condtionValueInput,
} from "./types";
import styles from "./payment-plan.module.css";
import { Typography, Button } from "@mui/material";
import { useState } from "react";
import { uniqueId } from "lodash";
import { CreatePaymentPlanRequestBodyInput } from "@/utils/routes/payment-plans-group/type";

const Input = ({ label, ...props }: InputProps) => {
  return (
    <label className={styles["label"]}>
      <span className={styles["label-text"]}>{label}</span>

      <input {...props} className={styles["input"]} />
    </label>
  );
};

const RatioItem = ({ id, children }: RatioContainerProps) => {
  const [scope, setScope] = useState<Scope>(Scope.sale);
  const [conditionType, setCondtionType] = useState("");

  return (
    <div className={styles["ratio-container"]}>
      <div className={styles["form-header"]}>
        <Typography variant="h6" fontWeight={500}>
          Plan Ratio Item
        </Typography>

        {children}
      </div>
      <form data-item={id} className={styles["form-elements"]}>
        {planRatioInputOnly.map((item) => {
          const { elementType, ...inputProps } = item;
          return <Input {...inputProps} key={inputProps.label} />;
        })}

        {/* TODO: handle select here line 87 start */}
        <label className={styles["label"]}>
          <span className={styles["label-text"]}>{scopeSelect.label}</span>
          <select
            className={styles["input"]}
            name={scopeSelect.name}
            value={scope}
            onChange={(e) => setScope(() => e.target.value as Scope)}
            required
          >
            {scopeSelect.options.map((option) => {
              return (
                <option key={option.key} value={option.key}>
                  {option.displayValue}
                </option>
              );
            })}
          </select>
        </label>

        <label className={styles["label"]}>
          <span className={styles["label-text"]}>
            {conditionTypeSelect.label}
          </span>
          <select
            required
            className={styles["input"]}
            name={conditionTypeSelect.name}
            onChange={(e) => setCondtionType(e.target.value)}
          >
            {conditionTypeSelect.options(scope).map((option) => {
              return (
                <option key={option.key} value={option.key}>
                  {option.displayValue}
                </option>
              );
            })}
          </select>
        </label>

        {conditionType === "within-days" && (
          <Input {...condtionValueInput} key={condtionValueInput.label} />
        )}
      </form>
    </div>
  );
};

const RatioContainer = ({ id, children }: RatioContainerProps) => {
  const [items, setItems] = useState<string[]>(() => [uniqueId()]);

  const addItem = () => {
    setItems((prev) => [...prev, uniqueId()]);
  };

  const removeItem = (itemKey: string) => {
    if (items.length === 1) return;

    setItems((prev) => prev.filter((key) => key !== itemKey));
  };
  return (
    <div className={styles["ratio-container"]}>
      <div className={styles["form-header"]}>
        <Typography variant="h6" fontWeight={500}>
          Plan Ratio
        </Typography>

        {children}
      </div>

      <div className={styles["form-elements"]} data-ratio={id}>
        {items.map((item) => {
          return (
            <RatioItem key={item} id={item}>
              {items.length > 1 && (
                <Button color="error" onClick={() => removeItem(item)}>
                  Remove
                </Button>
              )}{" "}
            </RatioItem>
          );
        })}
      </div>

      <div>
        <Button onClick={addItem}>Add item</Button>
      </div>
    </div>
  );
};

export const PaymentPlanCreate = ({ societyRera }: PaymentPlanCreateProps) => {
  const [ratios, setRatios] = useState<string[]>(() => [uniqueId()]);

  const addRatio = () => {
    setRatios((prev) => [...prev, uniqueId()]);
  };

  const removeRatio = (ratioKey: string) => {
    if (ratios.length === 1) return;

    setRatios((prev) => prev.filter((key) => key !== ratioKey));
  };

  const createPaymentPlan = (value: CreatePaymentPlanRequestBodyInput) => {
    // call backend from here
  };

  const handleSubmit = () => {
    const form = document.getElementById("main-form") as HTMLFormElement;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const abbr = formData.get("abbr") as string;

    const ratioContainers = document.querySelectorAll("[data-ratio]");
    const ratios: { items: any[] }[] = [];

    let hasError = false;

    for (const container of ratioContainers) {
      const items: any[] = [];
      const itemForms = container.getElementsByTagName("form");

      let percentSum = 0;

      for (const form of itemForms) {
        if (!form.reportValidity()) return;

        const data = new FormData(form);
        const entries = Object.fromEntries(data.entries());
        if (!entries[condtionValueInput.name]) {
          entries[condtionValueInput.name] = "0";
        }

        items.push(entries);
        percentSum +=
          typeof entries.ratio === "string" ? Number(entries.ratio) : 0;
      }

      // Round to handle floating point issues like 99.99999999
      if (Math.round(percentSum) !== 100) {
        container.setAttribute("data-error", "true");
        hasError = true;
      } else {
        container.removeAttribute("data-error");
      }

      ratios.push({ items });
    }

    if (hasError) {
      alert("One or more Plan Ratios do not sum to 100%");
      return;
    }

    const result: CreatePaymentPlanRequestBodyInput = { name, abbr, ratios };
    console.log("✅ Valid:", result);
    createPaymentPlan(result);
  };

  return (
    <div className={`${styles["container"]} container`}>
      <Typography variant="h4" fontWeight={600}>
        Create Payment Plan
      </Typography>

      <div className={styles["form"]}>
        <div className={styles["form-group"]}>
          <Typography variant="h5" fontWeight={500}>
            Plan details
          </Typography>

          <form className={styles["form-elements"]} id="main-form">
            {planDetailsItem.map(({ elementType: _, ...item }) => {
              return <Input {...item} key={item.label} />;
            })}
          </form>
        </div>

        <div className={styles["form-group"]}>
          <div className={styles["form-header"]}>
            <Typography variant="h5" fontWeight={500}>
              Plan Ratios
            </Typography>

            <Button variant="outlined" onClick={addRatio}>
              Add another
            </Button>
          </div>

          <div className={styles["form-elements"]}>
            {ratios.map((ratio) => {
              return (
                <RatioContainer key={ratio} id={ratio}>
                  {ratios.length > 1 && (
                    <Button color="error" onClick={() => removeRatio(ratio)}>
                      Remove ratio
                    </Button>
                  )}
                </RatioContainer>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
        }}
      >
        <Button variant="contained" onClick={handleSubmit}>
          Create payment Plan
        </Button>
      </div>
    </div>
  );
};
