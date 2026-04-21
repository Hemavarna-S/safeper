const DAY_MS = 24 * 60 * 60 * 1000;

export const statusFlow = ["Pending", "Approved", "Active", "Closed"];

export function getPermitId(permit) {
  return permit?._id ? `SP-${permit._id.slice(-6).toUpperCase()}` : "SP-READY";
}

export function getChecklistProgress(permit) {
  const checklist = permit?.checklist || [];

  if (checklist.length === 0) {
    return 0;
  }

  const completed = checklist.filter((item) => item.completed).length;
  return Math.round((completed / checklist.length) * 100);
}

export function getPermitProgress(permit) {
  const statusBase = {
    Pending: 18,
    Approved: 48,
    Active: 72,
    Closed: 100
  };
  const base = statusBase[permit?.status] ?? 12;
  const checklistBoost = Math.round(getChecklistProgress(permit) * 0.18);

  return Math.min(100, base + checklistBoost);
}

export function getCertificationState(worker) {
  const now = Date.now();
  const certifications = worker?.certifications || [];
  const expired = certifications.filter((cert) => {
    if (!cert.expiryDate) {
      return false;
    }

    return new Date(cert.expiryDate).getTime() < now;
  });
  const expiringSoon = certifications.filter((cert) => {
    if (!cert.expiryDate) {
      return false;
    }

    const daysLeft = (new Date(cert.expiryDate).getTime() - now) / DAY_MS;
    return daysLeft >= 0 && daysLeft <= 30;
  });

  return {
    total: certifications.length,
    expired: expired.length,
    expiringSoon: expiringSoon.length
  };
}

export function getPermitRisk(permit) {
  const reasons = [];
  let score = 12;

  if (permit?.status === "Pending") {
    score += 24;
    reasons.push("waiting for approval");
  }

  if (permit?.status === "Active") {
    score += 16;
    reasons.push("active field execution");
  }

  if (["Hot Work", "Confined Space"].includes(permit?.type)) {
    score += 10;
    reasons.push(`${permit.type.toLowerCase()} controls required`);
  }

  if (!permit?.worker) {
    score += 18;
    reasons.push("worker not assigned");
  }

  if (!permit?.qrToken && !permit?.qrImage) {
    score += 12;
    reasons.push("QR package missing");
  }

  const checklist = permit?.checklist || [];
  if (checklist.length > 0) {
    const incomplete = checklist.filter((item) => !item.completed).length;
    const incompleteShare = incomplete / checklist.length;

    if (incomplete > 0) {
      score += Math.round(incompleteShare * 20);
      reasons.push(`${incomplete} checklist item${incomplete === 1 ? "" : "s"} open`);
    }
  }

  const certs = getCertificationState(permit?.worker);
  if (certs.expired > 0) {
    score += certs.expired * 20;
    reasons.push("expired certification");
  }

  if (certs.expiringSoon > 0) {
    score += certs.expiringSoon * 8;
    reasons.push("certification expires soon");
  }

  const ageDays = permit?.createdAt
    ? Math.floor((Date.now() - new Date(permit.createdAt).getTime()) / DAY_MS)
    : 0;

  if (permit?.status === "Pending" && ageDays >= 1) {
    score += Math.min(18, ageDays * 4);
    reasons.push(`${ageDays} day${ageDays === 1 ? "" : "s"} in intake`);
  }

  const normalized = Math.min(100, score);
  const severity =
    normalized >= 72
      ? "critical"
      : normalized >= 52
        ? "high"
        : normalized >= 32
          ? "moderate"
          : "low";

  return {
    score: normalized,
    severity,
    reasons: reasons.length > 0 ? reasons : ["controls look aligned"]
  };
}

export function getRiskLabel(severity) {
  return {
    critical: "Critical",
    high: "High",
    moderate: "Moderate",
    low: "Low"
  }[severity] || "Low";
}

export function buildOperationalInsights(permits, workers) {
  const total = permits.length;
  const active = permits.filter((permit) => permit.status === "Active").length;
  const pending = permits.filter((permit) => permit.status === "Pending").length;
  const qrReady = permits.filter((permit) => permit.qrToken || permit.qrImage).length;
  const readyPercent = total > 0 ? Math.round((qrReady / total) * 100) : 0;
  const riskList = permits.map((permit) => getPermitRisk(permit));
  const highRisk = riskList.filter((risk) =>
    ["critical", "high"].includes(risk.severity)
  ).length;
  const certWatch = workers.reduce((count, worker) => {
    const certs = getCertificationState(worker);
    return count + certs.expired + certs.expiringSoon;
  }, 0);

  return [
    {
      label: "QR readiness",
      value: `${readyPercent}%`,
      body: `${qrReady} of ${total} permits have a scannable field package.`,
      tone: "cyan"
    },
    {
      label: "Risk watch",
      value: highRisk,
      body: highRisk > 0 ? "High-risk permits need supervisor attention." : "No high-risk permits detected.",
      tone: highRisk > 0 ? "yellow" : "green"
    },
    {
      label: "Approval queue",
      value: pending,
      body: pending > 0 ? "Pending permits are waiting for verification." : "No approval backlog right now.",
      tone: pending > 0 ? "blue" : "green"
    },
    {
      label: "Crew cert watch",
      value: certWatch,
      body: certWatch > 0 ? "Certification dates need review before assignment." : "Crew certifications look clear.",
      tone: certWatch > 0 ? "yellow" : "green"
    },
    {
      label: "Active field load",
      value: active,
      body: active > 0 ? "Live work should be QR-verified before movement." : "No active field work detected.",
      tone: active > 0 ? "cyan" : "blue"
    }
  ];
}

export function buildRecommendations(permits, workers) {
  const rankedPermits = [...permits]
    .map((permit) => ({ permit, risk: getPermitRisk(permit) }))
    .sort((a, b) => b.risk.score - a.risk.score);
  const topRisk = rankedPermits[0];
  const pending = permits.find((permit) => permit.status === "Pending");
  const activeWithoutQr = permits.find(
    (permit) => permit.status === "Active" && !permit.qrToken && !permit.qrImage
  );
  const certWatch = workers.find((worker) => {
    const certs = getCertificationState(worker);
    return certs.expired > 0 || certs.expiringSoon > 0;
  });

  return [
    topRisk && {
      title: "Review highest-risk permit",
      body: `${getPermitId(topRisk.permit)} is ${topRisk.risk.severity} risk because ${topRisk.risk.reasons[0]}.`,
      action: "Inspect register"
    },
    pending && {
      title: "Clear approval queue",
      body: `${getPermitId(pending)} can move forward once controls are verified.`,
      action: "Open permits"
    },
    activeWithoutQr && {
      title: "Generate QR verification",
      body: `${getPermitId(activeWithoutQr)} is active but missing a scan package.`,
      action: "Check permit"
    },
    certWatch && {
      title: "Worker readiness check",
      body: `${certWatch.name || "A worker"} has certification dates that need attention.`,
      action: "Review crew"
    }
  ].filter(Boolean).slice(0, 3);
}
