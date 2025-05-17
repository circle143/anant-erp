"use client";
import styles from "./page.module.scss";
import React, { useEffect, useState } from "react";
import {
  getTowers,
  getAllTowerUnsoldFlats,
  getSocieties,
  getSocietySaleReport,
  getTowerSalesReport,
} from "@/redux/action/org-admin";
import {
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  CircularProgress,
  AppBar,
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Loader from "@/components/Loader/Loader";
import CustomBreadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { report } from "@/utils/breadcrumbs";
// Types
interface Society {
  reraNumber: string;
  name: string;
}
interface Tower {
  id: string;
  name: string;
  societyId: string;
}
interface Flat {
  id: string;
  name: string;
}

// TabPanel component
function TabPanel(props: {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

// Main Page Component
const Page = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);

  const [society, setSociety] = useState("");
  const [tower, setTower] = useState("");
  const [flat, setFlat] = useState("");

  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [societyReport, setSocietyReport] = useState<any | null>(null);
  const [towerReport, setTowerReport] = useState<any | null>(null);

  // Handle Tab Switch
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Load societies
  useEffect(() => {
    const fetchAllSocieties = async (
      cursor: string | null = null,
      accumulated: Society[] = []
    ): Promise<Society[]> => {
      setLoadingSocieties(true);
      const response = await getSocieties(cursor);
      if (response?.error) {
        setLoadingSocieties(false);
        return accumulated;
      }

      const items = response?.data?.items || [];
      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllSocieties(nextCursor, newData);
      }

      setLoadingSocieties(false);
      return newData;
    };

    fetchAllSocieties().then((data) => {
      setSocieties(data);
    });
  }, []);

  // Handle society change
  const handleSocietyChange = async (e: SelectChangeEvent<string>) => {
    const reraNumber = e.target.value;
    setSociety(reraNumber);
    setTower("");
    setFlat("");
    setTowers([]);
    setFlats([]);
    setSocietyReport(null);
    setTowerReport(null);

    if (!reraNumber) return;
    setLoadingTowers(true);

    // Fetch society report
    const report = await getSocietySaleReport(reraNumber);
    if (!report?.error) {
      setSocietyReport(report);
    }

    const fetchAllTowers = async (
      cursor: string | null = null,
      accumulated: Tower[] = []
    ): Promise<Tower[]> => {
      const response = await getTowers(cursor, reraNumber);
      if (response?.error) return accumulated;

      const items = response?.data?.items || [];
      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllTowers(nextCursor, newData);
      }

      return newData;
    };

    const towerData = await fetchAllTowers();
    setTowers(towerData);
    setLoadingTowers(false);
  };

  // Handle tower change
  const handleTowerChange = async (e: SelectChangeEvent<string>) => {
    const towerId = e.target.value;
    setTower(towerId);
    setFlat("");
    setFlats([]);

    if (!towerId) return;
    const report = await getTowerSalesReport(society, towerId);
    console.log("Tower Report", report);
    const flatsMap: Record<string, Flat> = {};
    report.data.flats.forEach((flat: Flat) => {
      flatsMap[flat.id] = flat;
    });

    const enrichedBreakdown = report.data.paymentBreakdown.map(
      (breakdown: {
        paidItems: { flat_id: string }[] | null;
        unpaidItems: { flat_id: string }[] | null;
      }) => {
        const attachFlatInfo = (items: { flat_id: string }[] | null) => {
          if (!items) return null;
          return items.map((item) => ({
            ...item,
            flatInfo: flatsMap[item.flat_id] || null,
          }));
        };

        return {
          ...breakdown,
          paidItems: attachFlatInfo(breakdown.paidItems),
          unpaidItems: attachFlatInfo(breakdown.unpaidItems),
        };
      }
    );

    // Replace original paymentBreakdown with enriched one
    report.data.paymentBreakdown = enrichedBreakdown;
    delete report.data.flats;
    console.log("Enriched Report", report);
    if (!report?.error) {
      setTowerReport(report);
    }
    const selectedTower = towers.find((t) => t.id === towerId);
    if (!selectedTower) return;

    setLoadingFlats(true);

    const fetchAllUnsoldFlats = async (
      cursor: string | null = null,
      accumulated: Flat[] = []
    ): Promise<Flat[]> => {
      const response = await getAllTowerUnsoldFlats(
        cursor,
        selectedTower.societyId,
        towerId
      );
      if (response?.error) return accumulated;

      const items = response?.data?.items || [];
      const newData = [...accumulated, ...items];
      const hasNext = response?.data?.pageInfo?.nextPage;
      const nextCursor = response?.data?.pageInfo?.cursor;

      if (hasNext && nextCursor) {
        return await fetchAllUnsoldFlats(nextCursor, newData);
      }

      return newData;
    };

    const flatData = await fetchAllUnsoldFlats();
    setFlats(flatData);
    setLoadingFlats(false);
  };
  interface PriceBreakdownComponent {
    type: string;
    price: string;
    summary: string;
    total: string;
    superArea: number;
  }

  interface Owner {
    id: string;
    saleId: string;
    level: number;
    salutation: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    photo: string;
    maritalStatus: string;
    nationality: string;
    email: string;
    phoneNumber: string;
    middleName: string;
    numberOfChildren: number;
    anniversaryDate: string | null;
    aadharNumber: string;
    panNumber: string;
    passportNumber: string;
    profession: string;
    designation: string;
    companyName: string;
    createdAt: string;
    updatedAt: string;
  }

  interface SaleDetail {
    id: string;
    flatId: string;
    societyId: string;
    orgId: string;
    totalPrice: string;
    paid: string;
    remaining: string;
    priceBreakdown: PriceBreakdownComponent[];
    createdAt: string;
    updatedAt: string;
    owners: Owner[];
  }

  interface FlatInfo {
    id: string;
    towerId: string;
    flatTypeId: string;
    name: string;
    floorNumber: number;
    facing: string;
    createdAt: string;
    updatedAt: string;
    saleDetail: SaleDetail;
  }

  interface PaymentItem {
    flat_id: string;
    amount: string;
    flatInfo: FlatInfo;
  }

  interface PaymentBreakdown {
    id: string;
    societyId: string;
    orgId: string;
    scope: string;
    summary: string;
    conditionType: string;
    conditionValue?: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
    total: string;
    paid: string;
    remaining: string;
    paidItems?: PaymentItem[] | null;
    unpaidItems?: PaymentItem[] | null;
  }

  interface TowerReportData {
    error: boolean;
    data: {
      overall: {
        total: string;
        paid: string;
        remaining: string;
      };
      paymentPlan: {
        total: string;
        paid: string;
        remaining: string;
      };
      paymentBreakdown: PaymentBreakdown[];
    };
  }
  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <CustomBreadcrumbs items={report} />
        <FormControl fullWidth size="small">
          <Select
            id="society-select"
            value={society}
            onChange={handleSocietyChange}
            displayEmpty
          >
            <MenuItem value="">Select Society</MenuItem>
            {societies.map((s) => (
              <MenuItem key={s.reraNumber} value={s.reraNumber}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {loadingSocieties && <Loader />}
        <FormControl fullWidth size="small">
          <Select
            id="tower-select"
            value={tower}
            onChange={handleTowerChange}
            displayEmpty
            disabled={!society || loadingTowers}
          >
            <MenuItem value="">Select Tower</MenuItem>
            {towers.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {loadingTowers && <Loader />}
      </div>
      <Box sx={{ bgcolor: "background.paper", width: "100%" }}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab label="Society Sales Report" {...a11yProps(0)} />
            <Tab label="Tower Sales Report" {...a11yProps(1)} />
          </Tabs>
        </AppBar>

        {/* Tab 1: Tower Sales Report */}
        <TabPanel value={tabIndex} index={0} dir={theme.direction}>
          {!society ? (
            <Typography>Select a society to view the sales report</Typography>
          ) : loadingSocieties ? (
            <Loader />
          ) : societyReport && !societyReport.error ? (
            <div className={styles.cardsContainer}>
              <div className={styles.card}>
                <div className={styles.label}>Total Amount</div>
                <div className={styles.value}>
                  ₹{societyReport.data.total.toLocaleString()}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.label}>Paid Amount</div>
                <div className={styles.value}>
                  ₹{societyReport.data.paid.toLocaleString()}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.label}>Pending Amount</div>
                <div className={styles.value}>
                  ₹{societyReport.data.pending.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <Typography>No report found for the selected society</Typography>
          )}
        </TabPanel>

        {/* Tab 2: Unsold Flats */}
        <TabPanel value={tabIndex} index={1} dir={theme.direction}>
          <div className={styles.tab2}>
            {!tower ? (
              <Typography>Select a tower to view the sales report</Typography>
            ) : loadingTowers || loadingFlats ? (
              <Loader />
            ) : towerReport ? (
              <div className={styles.reportContainer}>
                {/* Overall Summary */}
                <div className={styles.summarySection}>
                  <h3 className={styles.sectionTitle}>
                    Overall Financial Summary
                  </h3>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryItem}>
                      <span>Total Value:</span>
                      <span>₹{towerReport.data.overall.total}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Amount Paid:</span>
                      <span className={styles.paid}>
                        ₹{towerReport.data.overall.paid}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Remaining Balance:</span>
                      <span className={styles.remaining}>
                        ₹{towerReport.data.overall.remaining}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Plan */}
                <div className={styles.summarySection}>
                  <h3 className={styles.sectionTitle}>Payment Plan Summary</h3>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryItem}>
                      <span>Plan Total:</span>
                      <span>₹{towerReport.data.paymentPlan.total}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Plan Paid:</span>
                      <span className={styles.paid}>
                        ₹{towerReport.data.paymentPlan.paid}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Plan Remaining:</span>
                      <span className={styles.remaining}>
                        ₹{towerReport.data.paymentPlan.remaining}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className={styles.breakdownSection}>
                  <h3 className={styles.sectionTitle}>
                    Payment Breakdown Details
                  </h3>
                  {towerReport.data.paymentBreakdown.map(
                    (plan: PaymentBreakdown, index: number) => (
                      <div key={plan.id} className={styles.paymentPlan}>
                        <div className={styles.planHeader}>
                          <h4 className={styles.planTitle}>
                            {plan.summary} ({plan.conditionType})
                          </h4>
                          <div className={styles.planStats}>
                            <span>Total: ₹{plan.total}</span>
                            <span className={styles.paid}>
                              Paid: ₹{plan.paid}
                            </span>
                            <span className={styles.remaining}>
                              Remaining: ₹{plan.remaining}
                            </span>
                          </div>
                        </div>

                        {/* Paid Items */}
                        {plan.paidItems && (
                          <div className={styles.flatSection}>
                            <h5 className={styles.subTitle}>Paid Flats</h5>
                            {plan.paidItems.map((item) => (
                              <div
                                key={item.flat_id}
                                className={styles.flatCard}
                              >
                                <div className={styles.flatHeader}>
                                  <span className={styles.flatName}>
                                    {item.flatInfo.name}
                                  </span>
                                  <span className={styles.ownerName}>
                                    {
                                      item.flatInfo.saleDetail.owners[0]
                                        .firstName
                                    }{" "}
                                    {
                                      item.flatInfo.saleDetail.owners[0]
                                        .lastName
                                    }
                                  </span>
                                  <span className={styles.paidAmount}>
                                    ₹{item.amount}
                                  </span>
                                </div>
                                <div className={styles.priceBreakdown}>
                                  <h6>Price Components:</h6>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Type</th>
                                        <th>Price/SqFt</th>
                                        <th>Total</th>
                                        <th>Summary</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.flatInfo.saleDetail.priceBreakdown.map(
                                        (component, idx) => (
                                          <tr key={idx}>
                                            <td>{component.type}</td>
                                            <td>₹{component.price}</td>
                                            <td>₹{component.total}</td>
                                            <td>{component.summary}</td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Unpaid Items */}
                        {plan.unpaidItems && (
                          <div className={styles.flatSection}>
                            <h5 className={styles.subTitle}>Unpaid Flats</h5>
                            {plan.unpaidItems.map((item) => (
                              <div
                                key={item.flat_id}
                                className={styles.flatCard}
                              >
                                <div className={styles.flatHeader}>
                                  <span className={styles.flatName}>
                                    {item.flatInfo.name}
                                  </span>
                                  <span className={styles.ownerName}>
                                    {
                                      item.flatInfo.saleDetail.owners[0]
                                        .firstName
                                    }{" "}
                                    {
                                      item.flatInfo.saleDetail.owners[0]
                                        .lastName
                                    }
                                  </span>
                                  <span className={styles.remaining}>
                                    ₹{item.amount}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <Typography>No report found for the selected tower</Typography>
            )}
          </div>
        </TabPanel>
      </Box>
    </div>
  );
};

export default Page;
{
  /* Flat Dropdown */
}
{
  /* <div>
      <label>
        Flat: <span style={{ color: "red" }}>*</span>
      </label>
      <FormControl fullWidth size="small">
        <Select
          id="flat-select"
          value={flat}
          onChange={(e) => setFlat(e.target.value)}
          displayEmpty
          disabled={!tower || loadingFlats}
        >
          <MenuItem value="">Select Flat</MenuItem>
          {flats.length === 0 && (
            <MenuItem disabled value="">
              No flats available
            </MenuItem>
          )}
          {flats.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loadingFlats && <Loader />}
    </div> */
}
