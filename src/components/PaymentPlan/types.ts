import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export interface PaymentPlanCreateProps {
  societyRera: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface InputElement extends InputProps {
  elementType: "input";
}

export const planDetailsItem: InputElement[] = [
  {
    label: "Name",
    name: "name",
    required: true,
    type: "text",
    elementType: "input",
  },
  {
    label: "Abbr",
    name: "abbr",
    required: true,
    type: "text",
    elementType: "input",
  },
];

interface SelectElement extends SelectHTMLAttributes<HTMLSelectElement> {
  elementType: "select";
  options: {
    key: string;
    displayValue: string;
  }[];
  label: string;
}

export const planRatioInputOnly: InputElement[] = [
  {
    label: "Description",
    name: "description",
    required: true,
    elementType: "input",
  },
  {
    label: "Ratio",
    name: "ratio",
    required: true,
    elementType: "input",
  },
];

export const planRatioElements: (InputElement | SelectElement)[] = [
  {
    label: "Description",
    name: "description",
    required: true,
    elementType: "input",
  },
  {
    label: "Ratio",
    name: "ratio",
    required: true,
    elementType: "input",
  },
  {
    label: "Scope",
    name: "scope",
    elementType: "select",
    required: true,
    options: [
      {
        key: "sale",
        displayValue: "Sale",
      },
      {
        key: "tower",
        displayValue: "Tower",
      },
      {
        key: "flat",
        displayValue: "Flat",
      },
    ],
  },
  {
    label: "Condtion Type",
    name: "conditionType",
    elementType: "select",
    required: true,
    options: [
      {
        key: "on-booking",
        displayValue: "On Booking",
      },
      {
        key: "within-days",
        displayValue: "Within Days",
      },
      {
        key: "on-tower-stage",
        displayValue: "On Tower Stage",
      },
      {
        key: "on-flat-stage",
        displayValue: "On Flat Stage",
      },
    ],
  },

  { label: "Condtion Value", name: "conditionValue", elementType: "input" },
];

export interface RatioContainerProps {
  children?: ReactNode;
  id: string;
}
