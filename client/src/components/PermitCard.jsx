import {
  getPermitId,
  getPermitProgress,
  getPermitRisk,
  getRiskLabel
} from "../utils/permitInsights";

function PermitCard({ permit, onInspect }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Approved":
        return "status-approved";
      case "Active":
        return "status-active";
      case "Closed":
        return "status-closed";
      default:
        return "status-default";
    }
  };

  const progress = getPermitProgress(permit);
  const risk = getPermitRisk(permit);

  return (
    <article className="permit-card">
      <div className="permit-card__content">
        <div className="permit-card__header">
          <div>
            <p className="eyebrow">Permit type</p>
            <h3>{permit.type || "Field permit"}</h3>
          </div>
          <span className={`status-pill ${getStatusClass(permit.status)}`}>
            {permit.status || "Draft"}
          </span>
        </div>

        <div className="detail-grid">
          <div>
            <span>Location</span>
            <strong>{permit.location || "Unassigned"}</strong>
          </div>
          <div>
            <span>Worker</span>
            <strong>{permit.worker?.name || "Pending"}</strong>
          </div>
          <div>
            <span>Package</span>
            <strong>{getPermitId(permit)}</strong>
          </div>
          <div>
            <span>Risk</span>
            <strong>{getRiskLabel(risk.severity)}</strong>
          </div>
        </div>

        <div className="permit-progress">
          <div>
            <span>Execution confidence</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        {onInspect && (
          <button
            className="text-link permit-inspect"
            type="button"
            onClick={() => onInspect(permit)}
          >
            Inspect permit
          </button>
        )}
      </div>

      <div className="qr-panel">
        {permit.qrImage ? (
          <img src={permit.qrImage} alt="Permit QR code" />
        ) : (
          <span className="qr-placeholder" aria-hidden="true" />
        )}
        <span>Scan ready</span>
      </div>
    </article>
  );
}

export default PermitCard;
