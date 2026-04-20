import { useEffect, useState } from "react";
import API from "../api/api";

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    API.get("/workers")
      .then((res) => {
        if (isMounted) {
          setWorkers(res.data);
          setError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Workers could not be loaded.");
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

  return (
    <section className="page">
      <div className="crew-hero">
        <div>
          <p className="eyebrow">Crew readiness</p>
          <h1>Workers prepared for safe, low-friction execution.</h1>
          <p className="hero-copy">
            Keep the people side of permit control visible with roles and
            certification readiness.
          </p>
        </div>
        <div className="crew-score">
          <span>Registered crew</span>
          <strong>{workers.length}</strong>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {isLoading ? (
        <div className="empty-state">Loading workers...</div>
      ) : workers.length > 0 ? (
        <div className="worker-grid">
          {workers.map((worker) => (
            <article className="worker-card" key={worker._id}>
              <div className="avatar" aria-hidden="true">
                {worker.name?.slice(0, 1) || "W"}
              </div>
              <div>
                <h3>{worker.name}</h3>
                <p>{worker.role || "Field worker"}</p>
              </div>
              <div className="cert-list">
                {(worker.certifications || []).slice(0, 2).map((cert) => (
                  <span key={`${worker._id}-${cert.name}`}>{cert.name}</span>
                ))}
                {worker.certifications?.length ? null : <span>No certifications</span>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">No workers registered.</div>
      )}
    </section>
  );
}

export default Workers;
