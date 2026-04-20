import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function NewPermit() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [worker, setWorker] = useState("");
  const [workers, setWorkers] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    API.get("/workers")
      .then((res) => {
        if (isMounted) {
          setWorkers(res.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWorkers([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!type) {
      return;
    }

    let isMounted = true;

    API.get(`/checklists/${encodeURIComponent(type)}`)
      .then((res) => {
        if (isMounted) {
          setChecklist(res.data?.items || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setChecklist([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [type]);

  const selectType = (value) => {
    setType(value);
    setChecklist([]);
    setError("");
  };

  const handleTypeChange = (event) => {
    selectType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!type || !location || !worker) {
      setError("Select a work type, location, and worker.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await API.post("/permits", { type, location, worker });
      navigate("/permits");
    } catch (err) {
      setError(err.response?.data || "Unable to create permit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="form-hero">
        <div>
          <p className="eyebrow">New clearance</p>
          <h1>Create a permit with field-ready checklist control.</h1>
          <p className="hero-copy">
            Choose the work type, assign a trained worker, and let SafePermit
            prepare the QR-backed permit package.
          </p>
        </div>
        <div className="process-rail" aria-label="Permit creation steps">
          <span className={type ? "is-done" : ""}>Type</span>
          <span className={location ? "is-done" : ""}>Location</span>
          <span className={worker ? "is-done" : ""}>Worker</span>
        </div>
      </div>

      <div className="form-layout">
        <form className="permit-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Permit details</p>
            <h2>Work package</h2>
          </div>

          <div className="work-type-grid" aria-label="Work type quick select">
            {["Hot Work", "Confined Space"].map((item) => (
              <button
                className={type === item ? "work-type-card is-selected" : "work-type-card"}
                key={item}
                type="button"
                onClick={() => selectType(item)}
              >
                <span>{item}</span>
                <small>{item === "Hot Work" ? "Spark control" : "Atmosphere control"}</small>
              </button>
            ))}
          </div>

          <label>
            Work type
            <select value={type} onChange={handleTypeChange}>
              <option value="">Select work type</option>
              <option value="Hot Work">Hot Work</option>
              <option value="Confined Space">Confined Space</option>
            </select>
          </label>

          <label>
            Location
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Area, unit, or asset"
            />
          </label>

          <label>
            Worker
            <select value={worker} onChange={(event) => setWorker(event.target.value)}>
              <option value="">Select worker</option>
              {workers.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} {item.role ? `- ${item.role}` : ""}
                </option>
              ))}
            </select>
          </label>

          {error && <div className="alert alert--compact">{error}</div>}

          <button className="primary-action form-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create permit"}
          </button>
        </form>

        <aside className="checklist-panel">
          <p className="eyebrow">Checklist preview</p>
          <h2>{type || "Select a work type"}</h2>

          {checklist.length > 0 ? (
            <ul className="checklist">
              {checklist.map((item, index) => (
                <li key={`${item}-${index}`}>
                  <span aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state empty-state--small">
              No checklist loaded.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default NewPermit;
