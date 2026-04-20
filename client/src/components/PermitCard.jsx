const statusClass = {
  Pending: "status-pending",
  Approved: "status-approved",
  Active: "status-active",
  Closed: "status-closed"
};

function PermitCard({ permit }) {
  const completedItems =
    permit.checklist?.filter((item) => item.completed).length || 0;
  const totalItems = permit.checklist?.length || 0;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const workerName =
    typeof permit.worker === "object" ? permit.worker?.name : "Unassigned";

  return (
    <article className="permit-card">
      <div className="permit-card__content">
        <div className="permit-card__header">
          <div>
            <p className="eyebrow">Permit type</p>
            <h3>{permit.type}</h3>
          </div>
          <span
            className={`status-pill ${
              statusClass[permit.status] || "status-default"
            }`}
          >
            {permit.status || "Draft"}
          </span>
        </div>

        <div className="detail-grid">
          <div>
            <span>Location</span>
            <strong>{permit.location || "Not set"}</strong>
          </div>
          <div>
            <span>Worker</span>
            <strong>{workerName || "Unassigned"}</strong>
          </div>
          <div>
            <span>Checklist</span>
            <strong>
              {completedItems}/{totalItems} complete
            </strong>
          </div>
        </div>

        <div className="permit-progress">
          <div>
            <span>Readiness</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track" aria-label={`${progress}% checklist complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {permit.qrImage && (
        <div className="qr-panel">
          <img src={permit.qrImage} alt={`${permit.type} permit QR code`} />
          <span>Field scan</span>
        </div>
      )}
    </article>
  );
}

export default PermitCard;
