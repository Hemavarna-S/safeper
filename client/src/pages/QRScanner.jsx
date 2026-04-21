import { useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import API from "../api/api";
import {
  getChecklistProgress,
  getPermitId,
  getPermitRisk,
  getRiskLabel
} from "../utils/permitInsights";

function extractQrToken(value) {
  const text = value.trim();

  if (!text) {
    return "";
  }

  try {
    const parsed = JSON.parse(text);
    return parsed.qrToken || parsed.token || parsed.permitToken || text;
  } catch {
    try {
      const url = new URL(text);
      return (
        url.searchParams.get("qrToken") ||
        url.searchParams.get("token") ||
        url.pathname.split("/").filter(Boolean).pop() ||
        text
      );
    } catch {
      return text;
    }
  }
}

function QRScanner() {
  const [data, setData] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [verifiedPermit, setVerifiedPermit] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const activeTokenRef = useRef("");

  const risk = verifiedPermit ? getPermitRisk(verifiedPermit) : null;
  const checklistProgress = verifiedPermit
    ? getChecklistProgress(verifiedPermit)
    : 0;

  const verifyToken = async (rawValue) => {
    const token = extractQrToken(rawValue);

    if (!token || activeTokenRef.current === token) {
      return;
    }

    activeTokenRef.current = token;
    setData(token);
    setManualToken(token);
    setIsVerifying(true);

    try {
      const res = await API.get(`/permits/verify/${encodeURIComponent(token)}`);
      setVerifiedPermit(res.data);
      setError("");
    } catch (scanError) {
      setVerifiedPermit(null);
      setError(
        scanError.response?.data?.message ||
          "This QR token does not match an active SafePermit record."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = (event) => {
    event.preventDefault();
    activeTokenRef.current = "";
    verifyToken(manualToken);
  };

  return (
    <section className="page">
      <div className="scanner-hero">
        <div>
          <p className="eyebrow">QR verification</p>
          <h1>Instantly validate permit packages in the field.</h1>
          <p className="hero-copy">
            Use the camera scanner to confirm permit data before crews enter a
            work zone.
          </p>
        </div>
        <div className="scanner-signal" aria-hidden="true">
          <span />
          <strong>LIVE</strong>
        </div>
      </div>

      <div className="scanner-layout">
        <div className="scanner-panel">
          <div className="scanner-frame">
            <Scanner
              formats={["qr_code"]}
              components={{
                finder: true,
                torch: true
              }}
              onScan={(detectedCodes) => {
                const value = detectedCodes[0]?.rawValue;

                if (value) {
                  verifyToken(value);
                }
              }}
              onError={(scanError) => {
                setError(
                  scanError instanceof Error
                    ? scanError.message
                    : "Unable to access the camera."
                );
              }}
            />
          </div>
        </div>

        <aside className="scan-result">
          <p className="eyebrow">Scan result</p>
          <h2>
            {isVerifying
              ? "Verifying permit..."
              : verifiedPermit
                ? "Permit verified"
                : "Awaiting QR code"}
          </h2>

          <form className="manual-scan-form" onSubmit={handleManualVerify}>
            <input
              value={manualToken}
              onChange={(event) => setManualToken(event.target.value)}
              placeholder="Paste QR token"
            />
            <button className="primary-action" type="submit" disabled={isVerifying}>
              Verify
            </button>
          </form>

          {verifiedPermit ? (
            <div className="verified-permit">
              <div className="verified-permit__head">
                <span>{getPermitId(verifiedPermit)}</span>
                <strong>{verifiedPermit.status}</strong>
              </div>
              <h3>{verifiedPermit.type || "Field permit"}</h3>
              <p>{verifiedPermit.location || "No location assigned"}</p>

              <div className="verified-grid">
                <div>
                  <span>Worker</span>
                  <strong>{verifiedPermit.worker?.name || "Pending"}</strong>
                </div>
                <div>
                  <span>Risk</span>
                  <strong>{getRiskLabel(risk.severity)}</strong>
                </div>
                <div>
                  <span>Checklist</span>
                  <strong>{checklistProgress}%</strong>
                </div>
              </div>

              <div className="scan-security-strip">
                <span>Token</span>
                <strong>{data}</strong>
              </div>
            </div>
          ) : (
            <p>
              {data ||
                "Point the camera at a SafePermit QR code. Results will appear here instantly."}
            </p>
          )}

          {error && <div className="alert alert--compact">Error: {error}</div>}
        </aside>
      </div>
    </section>
  );
}

export default QRScanner;
