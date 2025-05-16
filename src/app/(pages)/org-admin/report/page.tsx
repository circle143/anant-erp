"use client";

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

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <label>
                    Society: <span style={{ color: "red" }}>*</span>
                </label>
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
                <CustomBreadcrumbs items={report} />
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
                        <Typography>
                            Select a society to view the sales report
                        </Typography>
                    ) : loadingSocieties ? (
                        <Loader />
                    ) : societyReport && !societyReport.error ? (
                        <Box>
                            <Typography>
                                Total Amount: ₹
                                {societyReport.data.total.toLocaleString()}
                            </Typography>
                            <Typography>
                                Paid Amount: ₹
                                {societyReport.data.paid.toLocaleString()}
                            </Typography>
                            <Typography>
                                Pending Amount: ₹
                                {societyReport.data.pending.toLocaleString()}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography>
                            No report found for the selected society
                        </Typography>
                    )}
                </TabPanel>

                {/* Tab 2: Unsold Flats */}
                <TabPanel value={tabIndex} index={1} dir={theme.direction}>
                    {!tower ? (
                        <Typography>
                            Select a tower to view the sales report
                        </Typography>
                    ) : loadingTowers || loadingFlats ? (
                        <Loader />
                    ) : towerReport ? (
                        <pre>{JSON.stringify(towerReport, null, 2)}</pre>
                    ) : (
                        <Typography>
                            No report found for the selected tower
                        </Typography>
                    )}
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
