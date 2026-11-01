import * as core from "@actions/core";

const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";

// Never fails the step: every problem is reported as a warning and the step exits with 0.
async function run() {
  try {
    // Input names must match action.yml (GitHub passes "api-token" as INPUT_API-TOKEN).
    const domain = core.getInput("domain").trim();
    const apiToken = core.getInput("api-token");
    const zoneId = core.getInput("zone-id");

    if (!domain || !apiToken || !zoneId) {
      core.warning("domain, api-token or zone-id not provided, skipping cache purge.");
      return;
    }

    const response = await fetch(
      `${CLOUDFLARE_API}/zones/${encodeURIComponent(zoneId)}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hosts: [domain] }),
      },
    );

    // Non-JSON bodies (e.g. a 5xx HTML page) become an empty object instead of throwing.
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      core.warning(
        `Cloudflare cache purge failed for ${domain} (HTTP ${response.status}): ` +
          JSON.stringify(data.errors ?? data),
      );
      return;
    }

    core.info(`Purged Cloudflare cache for ${domain}.`);
  } catch (error) {
    core.warning(`Cloudflare cache purge failed: ${error.message}`);
  }
}

run();
