// app/org-admin/society/payment-plan/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getFlatPaymentPlans,
  markPaymentPlanActiveForFlat,
} from "@/redux/action/org-admin";
import styles from "./page.module.scss";
import Loader from "@/components/Loader/Loader";
import { useSearchParams } from "next/navigation";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";

type PlanItem = {
  id: string;
  description?: string | null;
  conditionType: string;
  conditionValue?: string | number | null;
  ratio: string | number;
  scope?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type RatioGroup = {
  id: string;
  ratio: string; // e.g. "30,40,30"
  items: PlanItem[];
  createdAt?: string;
  updatedAt?: string;
};

type TowerPlan = {
  id: string;
  name?: string;
  abbr?: string;
  summary?: string;
  amount?: number | string;
  conditionType?: string;
  conditionValue?: string | number | null;
  scope?: string;
  active?: boolean;
  createdAt?: string;
  ratios?: RatioGroup[];
  items?: PlanItem[];
};

const Page = () => {
  const [orgData, setOrgData] = useState<TowerPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const rera = searchParams.get("rera");
  const towerID = searchParams.get("towerId");
  const flatId = searchParams.get("FlatId"); // keep casing if your router uses it

  const fetchOnce = useCallback(async () => {
    if (!rera || !flatId) {
      setOrgData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getFlatPaymentPlans(rera, flatId);
      const items: TowerPlan[] = response?.data?.items ?? [];
      setOrgData(items);
    } catch (err) {
      console.error("Failed to load payment plans:", err);
      setOrgData([]);
    } finally {
      setLoading(false);
    }
  }, [rera, flatId]);

  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  const handleActivateItem = async (paymentItemId: string) => {
    if (!rera || !flatId) return;
    const ok = window.confirm("Are you sure you want to activate this payment plan item?");
    if (!ok) return;

    setActivatingId(paymentItemId);
    try {
      const res = await markPaymentPlanActiveForFlat(rera, flatId, paymentItemId);
      if (res?.error) {
        alert("Failed to activate payment plan item");
      } else {
        await fetchOnce();
      }
    } catch (e) {
      console.error(e);
      alert("Activation failed");
    } finally {
      setActivatingId(null);
    }
  };

  // ---- helpers ----
  const fmtGroupRatio = (ratioStr?: string) =>
    (ratioStr ?? "")
      .split(",")
      .map((r) => {
        const n = parseFloat(r);
        return Number.isNaN(n) ? r : String(n);
      })
      .join(":");

  const fmtItemRatio = (r: string | number) => {
    const n = typeof r === "string" ? parseFloat(r) : r;
    return Number.isFinite(n) ? n : r;
  };

  const fmtCondValue = (val: string | number | null | undefined, type: string) => {
    if (val === null || val === undefined || val === "") return "N/A";
    return /day/i.test(type) ? `${val} days` : String(val);
  };

  const breadcrumb = [
    { name: "Home", href: "/org-admin" },
    { name: "Societies", href: "/org-admin/society" },
    { name: "Towers", href: `/org-admin/society/towers?rera=${rera ?? ""}` },
    {
      name: "Flats",
      href: `/org-admin/society/towers/flats?rera=${rera ?? ""}&towerId=${towerID ?? ""}`,
    },
    { name: "Payment Plan" },
  ];

  const ItemRow: React.FC<{ item: PlanItem }> = ({ item }) => {
    const isActive = Boolean(item.active);
    const busy = activatingId === item.id;

    return (
      <li key={item.id} className={styles.item || ""}>
        {item.description ? (
          <div>
            <strong>Description:</strong> {item.description}
          </div>
        ) : null}
        <div>
          <strong>Condition Type:</strong> {item.conditionType}
        </div>
        <div>
          <strong>Condition Value:</strong> {fmtCondValue(item.conditionValue ?? null, item.conditionType)}
        </div>
        <div>
          <strong>Ratio:</strong> {fmtItemRatio(item.ratio)}
        </div>
        <div>
          <strong>Scope:</strong> {item.scope ?? "N/A"}
        </div>
        <div>
          <strong>Active:</strong> {isActive ? "Yes" : "No"}
        </div>

        <div className={styles.actionButtonWrapper}>
          {!isActive && (
            <button
              className={styles.activateBtn}
              onClick={() => handleActivateItem(item.id)}
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? "Activating..." : "Activate"}
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h2>Payment Plan List</h2>
      </div>

      <CustomBreadcrumbs items={breadcrumb} />

      {!rera || !flatId ? (
        <div className={styles.noData}>Missing parameters: rera / flatId</div>
      ) : loading ? (
        <div className={styles.loading}>
          <Loader />
        </div>
      ) : orgData.length === 0 ? (
        <div className={styles.noData}>No data available</div>
      ) : (
        <ul className={styles.orgList}>
          {orgData.map((plan, idx) => (
            <li key={plan.id ?? `plan-${idx}`} className={styles.orgItem}>
              <div className={styles.details}>
                <div>
                  <strong>Name:</strong> {plan.name || plan.summary || "Untitled"}
                </div>
                {plan.abbr ? (
                  <div>
                    <strong>Abbreviation:</strong> {plan.abbr}
                  </div>
                ) : null}

                {Array.isArray(plan.ratios) && plan.ratios.length > 0 ? (
                  <div>
                    <strong>Ratios:</strong>
                    <ul className={styles.ratioList || ""}>
                      {plan.ratios.map((group) => (
                        <li key={group.id} className={styles.ratioItem || ""}>
                          <div>
                            <strong>Group Ratio:</strong> {fmtGroupRatio(group.ratio)}
                          </div>
                          <ul className={styles.itemList || ""}>
                            {(group.items ?? []).map((item) => (
                              <ItemRow key={item.id} item={item} />
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : Array.isArray(plan.items) && plan.items.length > 0 ? (
                  <div>
                    <strong>Items:</strong>
                    <ul className={styles.itemList || ""}>
                      {plan.items.map((item) => (
                        <ItemRow key={item.id} item={item} />
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>Amount:</strong> {plan.amount}%
                    </div>
                    <div>
                      <strong>Condition Type:</strong> {plan.conditionType}
                    </div>
                    <div>
                      <strong>Condition Value:</strong>{" "}
                      {fmtCondValue(plan.conditionValue ?? null, plan.conditionType ?? "")}
                    </div>
                    <div>
                      <strong>Scope:</strong> {plan.scope}
                    </div>
                  </>
                )}

                <div>
                  <strong>Plan Active:</strong> {plan.active ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {plan.createdAt ? new Date(plan.createdAt).toLocaleString() : "Not Available"}
                </div>

                {/* No plan-level Activate button by design */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Page;
