import {
  PaymentPlanCreateProps,
  InputProps,
  planDetailsItem,
  planRatioElements,
  RatioContainerProps,
} from "./types";
import styles from "./payment-plan.module.css";
import { Typography, Button } from "@mui/material";
import { FormEvent, useState } from "react";
import { uniqueId } from "lodash";

const Input = ({ label, ...props }: InputProps) => {
  return (
    <label className={styles["label"]}>
      <span className={styles["label-text"]}>{label}</span>

      <input {...props} className={styles["input"]} />
    </label>
  );
};

const RatioItem = ({ id, children }: RatioContainerProps) => {
  return (
    <div className={styles["ratio-container"]}>
      <div className={styles["form-header"]}>
        <Typography variant="h6" fontWeight={500}>
          Plan Ratio Item
        </Typography>

        {children}
      </div>

      <form data-item={id} className={styles["form-elements"]}>
        {planRatioElements.map((item) => {
          if (item.elementType === "input") {
            const { elementType, ...inputProps } = item;
            return <Input {...inputProps} key={inputProps.label} />;
          }

          const { elementType, label, options, ...selectProps } = item;
          return (
            <label className={styles["label"]}>
              <span className={styles["label-text"]}>{label}</span>
              <select {...selectProps} className={styles["input"]}>
                {options.map((option) => {
                  return (
                    <option key={option.key} value={option.key}>
                      {option.displayValue}
                    </option>
                  );
                })}
              </select>
            </label>
          );
        })}
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

        items.push(entries);
        percentSum +=
          typeof entries.ratio === "string" ? Number(entries.ratio) : 0;
      }

      // Round to handle floating point issues like 99.99999999
      if (Math.round(percentSum) !== 100) {
        console.error(percentSum);
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

    const result = { name, abbr, ratios };
    console.log("✅ Valid:", result);
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
            {planDetailsItem.map((item) => {
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

// import { PaymentPlanCreateProps, InputProps, planDetailsItem } from "./types";
// import styles from "./payment-plan.module.css";
//
// import { Typography, Button } from "@mui/material";
// import { FormEvent, useRef, useState, forwardRef } from "react";
//
// export const Input = forwardRef<HTMLInputElement, InputProps>(
//   ({ label, ...props }, ref) => {
//     return (
//       <label className={styles["label"]}>
//         <span className={styles["label-text"]}>{label}</span>
//         <input {...props} ref={ref} className={styles["input"]} />
//       </label>
//     );
//   },
// );
//
// export const PaymentPlanCreate = ({ societyRera }: PaymentPlanCreateProps) => {
//   const [ratios, setRatios] = useState([{}]); // At least one
//   const ratioRefs = useRef<any[][]>([]); // [ratioIndex][fieldName]
//
//
//
//   const addRatio = () => {
//
//     setRatios((prev) => [...prev, {}]);
//   };
//
//   const removeRatio = (index: number) => {
//     if (ratios.length === 1) return; // Prevent removing last
//     setRatios((prev) => prev.filter((_, i) => i !== index));
//     ratioRefs.current.splice(index, 1);
//   };
//
//   const onSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//
//     const ratioData = ratioRefs.current.map((refSet) => ({
//       stage: refSet[0]?.value || "",
//       percentage: refSet[1]?.value || "",
//       amount: refSet[2]?.value || "",
//       remarks: refSet[3]?.value || "",
//     }));
//
//     console.log("Plan Ratio Data:", ratioData);
//   };
//
//   return (
//     <div className={`${styles["container"]} container`}>
//       <Typography variant="h4" fontWeight={600}>
//         Create Payment Plan
//       </Typography>
//
//       <form className={styles["form"]} onSubmit={onSubmit}>
//         <div className={styles["form-group"]}>
//           <Typography variant="h5" fontWeight={500}>
//             Plan details
//           </Typography>
//
//           <div className={styles["form-elements"]}>
//             {planDetailsItem.map((item) => (
//               <Input {...item} key={item.label} />
//             ))}
//           </div>
//         </div>
//
//         <div className={styles["form-group"]}>
//           <div className={styles["form-header"]}>
//             <Typography variant="h5" fontWeight={500}>
//               Plan Ratio
//             </Typography>
//             <Button variant="outlined" onClick={addRatio}>
//               Add another
//             </Button>
//           </div>
//
//           <div className={styles["form-elements"]}>
//             {ratios.map((_, idx) => {
//               if (!ratioRefs.current[idx]) ratioRefs.current[idx] = [];
//
//               return (
//                 <div key={idx} className={styles["ratio-item"]}>
//                   <Input
//                     label="Stage"
//                     ref={(el: HTMLInputElement | null) => {
//                       if (!ratioRefs.current[idx]) ratioRefs.current[idx] = [];
//                       ratioRefs.current[idx][0] = el;
//                     }}
//                   />
//                   <Input
//                     label="Percentage"
//                     ref={(el: HTMLInputElement | null) => {
//                       if (!ratioRefs.current[idx]) ratioRefs.current[idx] = [];
//                       ratioRefs.current[idx][0] = el;
//                     }}
//                   />
//                   <Input
//                     label="Amount"
//                     ref={(el: HTMLInputElement | null) => {
//                       if (!ratioRefs.current[idx]) ratioRefs.current[idx] = [];
//                       ratioRefs.current[idx][0] = el;
//                     }}
//                   />
//                   <Input
//                     label="Remarks"
//                     ref={(el: HTMLInputElement | null) => {
//                       if (!ratioRefs.current[idx]) ratioRefs.current[idx] = [];
//                       ratioRefs.current[idx][0] = el;
//                     }}
//                   />
//                   {ratios.length > 1 && (
//                     <Button
//                       variant="text"
//                       color="error"
//                       onClick={() => removeRatio(idx)}
//                     >
//                       Remove
//                     </Button>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//
//         <Button variant="contained" type="submit">
//           Submit
//         </Button>
//       </form>
//     </div>
//   );
// };
