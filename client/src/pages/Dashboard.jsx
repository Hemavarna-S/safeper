import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import PermitCard from "../components/PermitCard";
import {
  buildOperationalInsights,
  buildRecommendations,
  getPermitId,
  getPermitRisk
} from "../utils/permitInsights";

function Dashboard() {
  const [permits, setPermits] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([API.get("/permits"), API.get("/workers")])
      .then(([permitRes, workerRes]) => {
        if (isMounted) {
          setPermits(permitRes.data);
          setWorkers(workerRes.data);
          setError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Dashboard data is unavailable.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const active = permits.filter((permit) => permit.status === "Active").length;
    const pending = permits.filter(
      (permit) => permit.status === "Pending"
    ).length;
    const closed = permits.filter((permit) => permit.status === "Closed").length;

    return [
      { label: "Total permits", value: permits.length, tone: "mint" },
      { label: "Active work", value: active, tone: "green" },
      { label: "Pending review", value: pending, tone: "yellow" },
      { label: "Closed", value: closed, tone: "neutral" }
    ];
  }, [permits]);

  const recentPermits = permits.slice(0, 3);
  const operationalInsights = useMemo(
    () => buildOperationalInsights(permits, workers),
    [permits, workers]
  );
  const recommendations = useMemo(
    () => buildRecommendations(permits, workers),
    [permits, workers]
  );
  const topRiskPermit = useMemo(() => {
    return [...permits]
      .map((permit) => ({ permit, risk: getPermitRisk(permit) }))
      .sort((a, b) => b.risk.score - a.risk.score)[0];
  }, [permits]);
  const activePercent =
    permits.length > 0 ? Math.round((stats[1].value / permits.length) * 100) : 0;
  const readyPercent =
    permits.length > 0
      ? Math.round(
          (permits.filter((permit) =>
            ["Approved", "Active", "Closed"].includes(permit.status)
          ).length /
            permits.length) *
            100
        )
      : 0;
  const storySteps = [
    { label: "Intake", value: permits.length },
    { label: "Verify", value: stats[2].value },
    { label: "Release", value: stats[1].value },
    { label: "Close", value: stats[3].value }
  ];

  return (
    <section className="page">
      <div className="hero-stage">
        <div className="hero-stage__copy">
          <p className="eyebrow">Sustainable work control</p>
          <h1>Safe permits for cleaner, faster field execution.</h1>
          <p className="hero-copy">
            Track approvals, crews, checklists, and QR-ready permits in one bright
            operations workspace.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/new-permit">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
              </svg>
              New permit
            </Link>
            <Link className="secondary-action" to="/permits">
              View register
            </Link>
            <Link className="secondary-action" to="/scanner">
              Launch scanner
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="Permit operations summary">
          <span className="scan-beam" aria-hidden="true" />
          <div className="field-map">
            <span className="map-line map-line--one" />
            <span className="map-line map-line--two" />
            <span className="route-pulse route-pulse--one" />
            <span className="route-pulse route-pulse--two" />
            <span className="map-pin map-pin--one">PTW</span>
            <span className="map-pin map-pin--two">QR</span>
            <span className="map-pin map-pin--three">ISO</span>
          </div>
          <div className="permit-ticket" aria-hidden="true">
            <span>SP-204</span>
            <strong>Permit live</strong>
            <i />
          </div>
          <div className="hero-visual__card hero-visual__card--main">
            <span>Readiness score</span>
            <strong>{isLoading ? "-" : `${readyPercent}%`}</strong>
            <div className="progress-track">
              <span style={{ width: `${readyPercent}%` }} />
            </div>
          </div>
          <div className="hero-visual__card hero-visual__card--side">
            <span>Active permits</span>
            <strong>{isLoading ? "-" : stats[1].value}</strong>
          </div>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <section className="insight-strip" aria-label="Operations intelligence">
        {operationalInsights.map((item) => (
          <article className={`insight-card insight-card--${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{isLoading ? "-" : item.value}</strong>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="story-rail" aria-label="Permit workflow">
        {storySteps.map((step, index) => (
          <article className="story-step" key={step.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.label}</h3>
            <strong>{isLoading ? "-" : step.value}</strong>
          </article>
        ))}
      </section>

      <div className="stat-grid">
        {stats.map((item) => (
          <article className={`stat-card stat-card--${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{isLoading ? "-" : item.value}</strong>
          </article>
        ))}
      </div>

      <section className="intelligence-grid" aria-label="Smart operations brief">
        <article className="ai-brief">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Command intelligence</p>
              <h2>Recommended next moves</h2>
            </div>
            <Link className="text-link" to="/permits">
              Act now
            </Link>
          </div>

          <div className="recommendation-list">
            {recommendations.length > 0 ? (
              recommendations.map((item) => (
                <div className="recommendation-card" key={item.title}>
                  <span>{item.action}</span>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              ))
            ) : (
              <div className="empty-state empty-state--small">
                No recommendations right now. The operation is clear.
              </div>
            )}
          </div>
        </article>

        <article className="risk-orbit">
          <p className="eyebrow">Risk radar</p>
          <div className="risk-dial" style={{ "--risk": `${topRiskPermit?.risk.score || 0}%` }}>
            <span>{isLoading ? "-" : topRiskPermit?.risk.score || 0}</span>
          </div>
          <h2>
            {topRiskPermit
              ? `${getPermitId(topRiskPermit.permit)} needs attention`
              : "No permit risk detected"}
          </h2>
          <p>
            {topRiskPermit
              ? topRiskPermit.risk.reasons.join(", ")
              : "Risk scoring activates as soon as permits are created."}
          </p>
        </article>
      </section>

      <div className="dashboard-layout">
        <section className="work-band">
          <div>
            <p className="eyebrow">Active load</p>
            <h2>{activePercent}% of permits are in active work</h2>
            <p>
              Keep hot work and confined-space activity visible before field teams
              move.
            </p>
          </div>
          <div className="load-meter" aria-label={`${activePercent}% active`}>
            <span style={{ width: `${activePercent}%` }} />
          </div>
          <div className="mini-metrics">
            <span>QR scan ready</span>
            <strong>{readyPercent}%</strong>
          </div>
        </section>

        <section className="recent-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recent permits</p>
              <h2>Field queue</h2>
            </div>
            <Link className="text-link" to="/permits">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="empty-state">Loading permits...</div>
          ) : recentPermits.length > 0 ? (
            <div className="permit-list">
              {recentPermits.map((permit) => (
                <PermitCard key={permit._id} permit={permit} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No permits yet.</div>
          )}
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
