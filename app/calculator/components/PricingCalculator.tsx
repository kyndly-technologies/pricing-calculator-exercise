"use client";

import { useState, useMemo } from "react";
import { ResolvedConfig, Tier } from "@/lib/types";
import { f, f2, nm } from "./formatting";
import Card from "./Card";
import SectionLabel from "./SectionLabel";
import PLRow from "./PLRow";
import PLTotal from "./PLTotal";

function calcTierCost(
  t: Tier,
  membership: number,
  concierge: boolean,
  payment: boolean,
  config: ResolvedConfig
) {
  return (
    t.platform +
    t.pepm * membership +
    (concierge ? config.conciergePepm : 0) * membership +
    (payment ? config.paymentProcessingPepm : 0) * membership
  );
}

function findBestTier(
  tiers: Tier[],
  membership: number,
  concierge: boolean,
  payment: boolean,
  config: ResolvedConfig
) {
  let best = tiers[0];
  let bestCost = Infinity;
  for (const t of tiers) {
    const cost = calcTierCost(t, membership, concierge, payment, config);
    if (cost < bestCost) {
      bestCost = cost;
      best = t;
    }
  }
  return best.id;
}

export default function PricingCalculator({
  config,
  clientName,
}: {
  config: ResolvedConfig;
  clientName?: string;
}) {
  const [membership, setMembership] = useState(config.defaultMembership);
  const [adminPepm, setAdminPepm] = useState(config.defaultAdminPepm);
  const [memberRatio, setMemberRatio] = useState(config.defaultMemberRatio);
  const [ratioInput, setRatioInput] = useState(
    config.defaultMemberRatio.toFixed(1)
  );
  const [concierge, setConcierge] = useState(false);
  const [payment, setPayment] = useState(false);
  const [tierOverride, setTierOverride] = useState<string | null>(null);

  const recommendedTier = useMemo(
    () =>
      findBestTier(config.tiers, membership, concierge, payment, config),
    [membership, concierge, payment, config]
  );
  const activeTier = tierOverride || recommendedTier;

  const handleRatioInput = (val: string) => {
    setRatioInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 1.0 && parsed <= 3.0) {
      setMemberRatio(Math.round(parsed * 10) / 10);
    }
  };

  const handleRatioBlur = () => {
    const clamped = Math.max(1.0, Math.min(3.0, memberRatio));
    setMemberRatio(clamped);
    setRatioInput(clamped.toFixed(1));
  };

  const handleMembership = (v: number) => setMembership(Math.max(50, v));

  const pnl = useMemo(() => {
    const t = config.tiers.find((x) => x.id === activeTier)!;
    const totalMembers = Math.round(membership * memberRatio);

    const adminRevenue = adminPepm * membership;
    const borRevenue = concierge
      ? 0
      : config.borCommissionPmpm * membership;
    const grossRevenue = adminRevenue + borRevenue;

    const platformCost = t.platform;
    const pepmCost = t.pepm * membership;
    const conciergeCost = concierge
      ? config.conciergePepm * membership
      : 0;
    const paymentCost = payment
      ? config.paymentProcessingPepm * membership
      : 0;
    const totalCost = platformCost + pepmCost + conciergeCost + paymentCost;

    const monthlyProfit = grossRevenue - totalCost;
    const annualProfit = monthlyProfit * 12;
    const margin =
      grossRevenue > 0 ? (monthlyProfit / grossRevenue) * 100 : 0;

    return {
      t,
      totalMembers,
      adminRevenue,
      borRevenue,
      grossRevenue,
      platformCost,
      pepmCost,
      conciergeCost,
      paymentCost,
      totalCost,
      monthlyProfit,
      annualProfit,
      margin,
    };
  }, [activeTier, membership, adminPepm, memberRatio, concierge, payment, config]);

  const positive = pnl.monthlyProfit >= 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7F7",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: "#0F3D44",
          padding: "28px 0 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#7BD1C5",
            letterSpacing: 2.5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Integrated ICHRA Platform
        </div>
        <h1
          style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff" }}
        >
          Revenue Calculator
        </h1>
        <p
          style={{
            margin: "6px 0 0",
            color: "#A8C5C0",
            fontSize: 13,
          }}
        >
          See what your ICHRA line of business could earn
        </p>
        {clientName && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              fontWeight: 600,
              color: "#4FBFB3",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Pricing for: {clientName}
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "28px 20px 60px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {/* LEFT — Inputs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <Card label="Your Admin PEPM (what you charge employers)">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={adminPepm}
                  onChange={(e) => setAdminPepm(+e.target.value)}
                  style={{ flex: 1 }}
                />
                <div style={{ minWidth: 70, textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#0F3D44",
                    }}
                  >
                    ${adminPepm}
                  </div>
                  <div
                    style={{ fontSize: 9, color: "#999", marginTop: 1 }}
                  >
                    PEPM
                  </div>
                </div>
              </div>
            </Card>

            <Card label="ICHRA Membership (Employees)">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <input
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={membership}
                  onChange={(e) => handleMembership(+e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min={50}
                  step={100}
                  value={membership}
                  onChange={(e) => handleMembership(+e.target.value)}
                  style={{
                    width: 80,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "2px solid #E5E5E5",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0F3D44",
                    textAlign: "center",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </Card>

            <Card label="Member-to-Employee Ratio">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <input
                  type="range"
                  min={10}
                  max={30}
                  step={1}
                  value={Math.round(memberRatio * 10)}
                  onChange={(e) => {
                    const v = +e.target.value / 10;
                    setMemberRatio(v);
                    setRatioInput(v.toFixed(1));
                  }}
                  style={{ flex: 1 }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                  }}
                >
                  <input
                    type="text"
                    value={ratioInput}
                    onChange={(e) => handleRatioInput(e.target.value)}
                    onBlur={handleRatioBlur}
                    style={{
                      width: 50,
                      padding: "8px 6px",
                      borderRadius: 8,
                      border: "2px solid #E5E5E5",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0F3D44",
                      textAlign: "center",
                      fontFamily: "inherit",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: "#999",
                      fontWeight: 600,
                    }}
                  >
                    x
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6B6B6B",
                  marginTop: 8,
                }}
              >
                {nm(membership)} EEs × {memberRatio.toFixed(1)} ={" "}
                <span style={{ fontWeight: 600, color: "#0F3D44" }}>
                  {nm(pnl.totalMembers)} members
                </span>
                <span style={{ color: "#999" }}> (incl. dependents)</span>
              </div>
              {!concierge && (
                <div
                  style={{
                    fontSize: 10,
                    color: "#4FBFB3",
                    marginTop: 4,
                  }}
                >
                  BOR commissions: {nm(pnl.totalMembers)} members × $
                  {config.borCommissionPmpm} PMPM ={" "}
                  <span style={{ fontWeight: 600 }}>
                    {f(pnl.borRevenue)}/mo
                  </span>
                </div>
              )}
            </Card>

            <Card label="Kyndly Platform Tier">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${config.tiers.length}, 1fr)`,
                  gap: 10,
                }}
              >
                {config.tiers.map((t) => {
                  const active = activeTier === t.id;
                  const isRecommended = recommendedTier === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() =>
                        setTierOverride(
                          t.id === recommendedTier ? null : t.id
                        )
                      }
                      style={{
                        padding: "14px 10px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all .15s",
                        position: "relative",
                        border: active
                          ? "2px solid #0F3D44"
                          : "2px solid #E5E5E5",
                        background: active ? "#0F3D44" : "#fff",
                        color: active ? "#fff" : "#2B2B2B",
                      }}
                    >
                      {isRecommended && (
                        <div
                          style={{
                            position: "absolute",
                            top: -9,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "#4FBFB3",
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 4,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Recommended
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: active ? "#7BD1C5" : "#6B6B6B",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          marginTop: 6,
                          lineHeight: 1,
                        }}
                      >
                        {f2(t.pepm)}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: active ? "#A8C5C0" : "#999",
                          marginTop: 2,
                        }}
                      >
                        PEPM
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: active ? "#A8C5C0" : "#999",
                          marginTop: 8,
                        }}
                      >
                        {f(t.platform)}/mo
                      </div>
                    </button>
                  );
                })}
              </div>
              <div
                style={{ fontSize: 10, color: "#999", marginTop: 8 }}
              >
                {tierOverride && (
                  <>
                    You&apos;ve manually selected a tier.{" "}
                    <button
                      onClick={() => setTierOverride(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4FBFB3",
                        cursor: "pointer",
                        fontSize: 10,
                        fontWeight: 600,
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Reset to recommended
                    </button>
                  </>
                )}
              </div>
            </Card>

            <Card label="Add-On Services">
              <button
                onClick={() => setConcierge(!concierge)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  width: "100%",
                  padding: "10px 0",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid #F0F0F0",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                    border: concierge ? "none" : "2px solid #ccc",
                    background: concierge ? "#4FBFB3" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {concierge ? "\u2713" : ""}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#2B2B2B",
                    }}
                  >
                    Kyndly Concierge Enrollment
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#6B6B6B",
                      marginTop: 2,
                    }}
                  >
                    Kyndly serves as Broker of Record — +$
                    {config.conciergePepm} PEPM
                  </div>
                  {!concierge && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#B85042",
                        marginTop: 2,
                      }}
                    >
                      Note: Selecting this removes your BOR commission
                      revenue (
                      {f(config.borCommissionPmpm * pnl.totalMembers)}
                      /mo)
                    </div>
                  )}
                  {concierge && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#B85042",
                        marginTop: 2,
                      }}
                    >
                      BOR commission revenue removed — Kyndly is now
                      Broker of Record
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setPayment(!payment)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  width: "100%",
                  padding: "10px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                    border: payment ? "none" : "2px solid #ccc",
                    background: payment ? "#4FBFB3" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {payment ? "\u2713" : ""}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#2B2B2B",
                    }}
                  >
                    Kyndly Payment Processing
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#6B6B6B",
                      marginTop: 2,
                    }}
                  >
                    Kyndly collects from employer, pays carriers — +$
                    {config.paymentProcessingPepm} PEPM
                  </div>
                </div>
              </button>
            </Card>
          </div>

          {/* RIGHT — P&L */}
          <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #E5E5E5",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: positive ? "#0F3D44" : "#7A1F1F",
                  padding: "28px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: positive ? "#7BD1C5" : "#F5A8A8",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  ICHRA Line of Business Profit
                </div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 700,
                    color: "#fff",
                    margin: "6px 0 2px",
                    lineHeight: 1,
                  }}
                >
                  {f(pnl.monthlyProfit)}
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 400,
                      color: positive ? "#A8C5C0" : "#F5A8A8",
                    }}
                  >
                    /mo
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: positive ? "#7BD1C5" : "#F5A8A8",
                  }}
                >
                  {f(pnl.annualProfit)}
                  <span style={{ fontSize: 12, fontWeight: 400 }}>
                    {" "}
                    /year
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: positive ? "#A8C5C0" : "#F5A8A8",
                    marginTop: 6,
                  }}
                >
                  {pnl.margin.toFixed(1)}% margin
                </div>
              </div>

              <div style={{ padding: "20px 24px" }}>
                <SectionLabel color="#4FBFB3">Revenue</SectionLabel>
                <PLRow
                  label={`ICHRA Admin (${f2(adminPepm)} × ${nm(membership)} EEs)`}
                  value={pnl.adminRevenue}
                />
                {pnl.borRevenue > 0 && (
                  <PLRow
                    label={`BOR Commissions ($${config.borCommissionPmpm} × ${nm(pnl.totalMembers)} members)`}
                    value={pnl.borRevenue}
                  />
                )}
                {concierge && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#B85042",
                      padding: "2px 0 4px",
                      fontStyle: "italic",
                    }}
                  >
                    BOR commissions: $0 (Kyndly is BOR)
                  </div>
                )}
                <PLTotal
                  label="Gross Monthly Revenue"
                  value={pnl.grossRevenue}
                  color="#0F3D44"
                />

                <div style={{ height: 16 }} />
                <SectionLabel color="#B85042">Costs</SectionLabel>
                <PLRow
                  label={`Kyndly Platform (${pnl.t.name})`}
                  value={-pnl.platformCost}
                  neg
                />
                <PLRow
                  label={`Kyndly PEPM (${f2(pnl.t.pepm)} × ${nm(membership)} EEs)`}
                  value={-pnl.pepmCost}
                  neg
                />
                {pnl.conciergeCost > 0 && (
                  <PLRow
                    label={`Kyndly Concierge ($${config.conciergePepm} × ${nm(membership)} EEs)`}
                    value={-pnl.conciergeCost}
                    neg
                  />
                )}
                {pnl.paymentCost > 0 && (
                  <PLRow
                    label={`Kyndly Payment Processing ($${config.paymentProcessingPepm} × ${nm(membership)} EEs)`}
                    value={-pnl.paymentCost}
                    neg
                  />
                )}
                <PLTotal
                  label="Total Monthly Costs"
                  value={-pnl.totalCost}
                  color="#B85042"
                />

                <div style={{ height: 12 }} />
                <div
                  style={{
                    borderTop: "2px solid #0F3D44",
                    paddingTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0F3D44",
                    }}
                  >
                    Monthly Net Profit
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: positive ? "#0F3D44" : "#B85042",
                    }}
                  >
                    {f(pnl.monthlyProfit)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#6B6B6B" }}>
                    Annual Net Profit
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: positive ? "#0F3D44" : "#B85042",
                    }}
                  >
                    {f(pnl.annualProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
