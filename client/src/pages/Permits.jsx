import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import PermitCard from "../components/PermitCard";
import {
  getChecklistProgress,
  getPermitId,
  getPermitRisk,
  getRiskLabel,
  statusFlow
} from "../utils/permitInsights";

const statusOptions = ["All", "Pending", "Approved", "Active", "Closed"];

function Permits() {
  const [permits, setPermits] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedPermitId, setSelectedPermitId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    API.get("/permits")
      .then((res) => {
        if (isMounted) {
          setPermits(res.data);
          setError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Permits could not be loaded.");
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

  const visiblePermits = useMemo(() => {
    const query = search.trim().toLowerCase();

    return permits.filter((permit) => {
      const matchesStatus = status === "All" || permit.status === status;
      const matchesSearch =
        !query ||
        permit.type?.toLowerCase().includes(query) ||
        permit.location?.toLowerCase().includes(query) ||
        permit.worker?.name?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [permits, search, status]);

  const statusSummary = useMemo(
    () =>
      statusOptions.slice(1).map((item) => ({
        label: item,
        value: permits.filter((permit) => permit.status === item).length
      })),
    [permits]
  );

  const pendingPercent =
    permits.length > 0
      ? Math.round(
          (permits.filter((permit) => permit.status === "Pending").length /
            permits.length) *
            100
        )
      : 0;
  const groupedVisiblePermits = useMemo(
    () =>
      statusOptions.slice(1).map((item) => ({
        label: item,
        permits: visiblePermits.filter((permit) => permit.status === item)
      })),
    [visiblePermits]
  );
  const selectedPermit = useMemo(
    () =>
      visiblePermits.find((permit) => permit._id === selectedPermitId) ||
      visiblePermits[0] ||
      null,
    [selectedPermitId, visiblePermits]
  );
  const selectedRisk = selectedPermit ? getPermitRisk(selectedPermit) : null;
  const selectedChecklistProgress = selectedPermit
    ? getChecklistProgress(selectedPermit)
    : 0;

  const updatePermitStatus = async (nextStatus) => {
    if (!selectedPermit || selectedPermit.status === nextStatus) {
      return;
    }

    try {
      setError("");
      setIsUpdating(true);
      const res = await API.patch(`/permits/${selectedPermit._id}/status`, {
        status: nextStatus
      });

      setPermits((items) =>
        items.map((permit) =>
          permit._id === selectedPermit._id ? res.data : permit
        )
      );
      setSelectedPermitId(res.data._id);
    } catch {
      setError("Permit status could not be updated.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="page">
      <div className="register-hero">
        <div>
          <p className="eyebrow">Permit register</p>
          <h1>Live permit control for safer site movement.</h1>
          <p className="hero-copy">
            Search, filter, and review clearance status across field work in a
            single sustainable operations view.
          </p>
        </div>
        <div className="register-hero__panel">
          <span>Pending share</span>
          <strong>{isLoading ? "-" : `${pendingPercent}%`}</strong>
          <div className="progress-track">
            <span style={{ width: `${pendingPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="status-summary">
        {statusSummary.map((item) => (
          <button
            key={item.label}
            type="button"
            className={
              status === item.label
                ? "status-summary__item is-selected"
                : "status-summary__item"
            }
            onClick={() => setStatus(item.label)}
          >
            <span>{item.label}</span>
            <strong>{isLoading ? "-" : item.value}</strong>
          </button>
        ))}
      </div>

      <div className="control-deck">
        <label className="search-field">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type, location, worker"
          />
        </label>

        <div className="control-deck__right">
          <div className="segmented-control" aria-label="Permit status filter">
            {statusOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={status === item ? "is-selected" : ""}
                onClick={() => setStatus(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <Link className="primary-action" to="/new-permit">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
            </svg>
            New permit
          </Link>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {selectedPermit && (
        <section className="permit-command-panel" aria-label="Selected permit command panel">
          <div className="permit-command-panel__header">
            <div>
              <p className="eyebrow">Selected permit</p>
              <h2>{getPermitId(selectedPermit)} command view</h2>
              <p>
                {selectedPermit.type || "Field permit"} at{" "}
                {selectedPermit.location || "unassigned location"}
              </p>
            </div>
            <div className={`risk-badge risk-badge--${selectedRisk.severity}`}>
              <span>Risk</span>
              <strong>{getRiskLabel(selectedRisk.severity)}</strong>
            </div>
          </div>

          <div className="permit-command-grid">
            <div className="status-command">
              <span>Status controls</span>
              <div>
                {statusFlow.map((item) => (
                  <button
                    className={selectedPermit.status === item ? "is-selected" : ""}
                    disabled={isUpdating}
                    key={item}
                    onClick={() => updatePermitStatus(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="risk-command">
              <span>Risk score</span>
              <strong>{selectedRisk.score}</strong>
              <p>{selectedRisk.reasons.join(", ")}</p>
            </div>

            <div className="checklist-command">
              <span>Checklist</span>
              <strong>{selectedChecklistProgress}% complete</strong>
              <div className="progress-track">
                <span style={{ width: `${selectedChecklistProgress}%` }} />
              </div>
            </div>

            <div className="qr-command">
              <span>QR token</span>
              <strong>{selectedPermit.qrToken || "Not generated"}</strong>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="empty-state">Loading permits...</div>
      ) : visiblePermits.length > 0 ? (
        <>
          <section className="permit-runway" aria-label="Permit status runway">
            {groupedVisiblePermits.map((group) => (
              <article className="runway-lane" key={group.label}>
                <div className="runway-lane__head">
                  <span>{group.label}</span>
                  <strong>{group.permits.length}</strong>
                </div>
                <div className="runway-lane__stream">
                  {group.permits.slice(0, 3).map((permit) => (
                    <button
                      className={
                        selectedPermit?._id === permit._id
                          ? "runway-chip is-selected"
                          : "runway-chip"
                      }
                      onClick={() => setSelectedPermitId(permit._id)}
                      type="button"
                      key={`${group.label}-${permit._id}`}
                    >
                      <span>{permit.type}</span>
                      <small>{permit.location || "No location"}</small>
                    </button>
                  ))}
                  {group.permits.length === 0 && (
                    <div className="runway-empty">Clear lane</div>
                  )}
                </div>
              </article>
            ))}
          </section>

          <div className="permit-list">
            {visiblePermits.map((permit) => (
              <PermitCard
                key={permit._id}
                permit={permit}
                onInspect={(item) => setSelectedPermitId(item._id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">No permits match this view.</div>
      )}
    </section>
  );
}

export default Permits;
