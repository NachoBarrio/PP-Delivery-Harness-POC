import { test as base, expect, chromium } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validationMessage = "La descripcion es obligatoria para prioridad Alta.";

function inputs() {
  const required = ["DATAVERSE_URL", "POC_APP_ID", "POC_USER_DATA_DIR"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Precondition: missing process inputs: ${missing.join(", ")}.`);
  }
  let environment;
  try {
    environment = new URL(process.env.DATAVERSE_URL);
  } catch {
    throw new Error("Precondition: DATAVERSE_URL must be an absolute HTTPS origin.");
  }
  const project = JSON.parse(
    readFileSync(resolve(repositoryRoot, ".power-platform", "project.json"), "utf8"),
  );
  if (
    environment.protocol !== "https:" ||
    environment.username ||
    environment.password ||
    environment.origin !== new URL(project.connections.dataverse.devUrl).origin ||
    environment.pathname !== "/" ||
    environment.search ||
    environment.hash
  ) {
    throw new Error("Precondition: DATAVERSE_URL must match the project's verified DEV origin.");
  }
  if (!guidPattern.test(process.env.POC_APP_ID)) {
    throw new Error("Precondition: POC_APP_ID must be the deployed app GUID.");
  }
  const profile = process.env.POC_USER_DATA_DIR;
  if (!isAbsolute(profile) || !existsSync(profile) || !statSync(profile).isDirectory()) {
    throw new Error("Precondition: the dedicated authenticated browser profile is unavailable.");
  }
  const canonicalProfile = realpathSync(profile);
  const fromRepository = relative(realpathSync(repositoryRoot), canonicalProfile);
  if (
    !fromRepository ||
    (!fromRepository.startsWith(`..${sep}`) && !isAbsolute(fromRepository))
  ) {
    throw new Error("Precondition: the dedicated browser profile must be outside the repository.");
  }
  const appUrl = new URL("main.aspx", environment);
  appUrl.searchParams.set("appid", process.env.POC_APP_ID);
  return { appUrl: appUrl.href, profile: canonicalProfile };
}

const test = base.extend({
  runId: [async ({}, use) => use(randomUUID()), { scope: "worker" }],
  poc: [
    async ({}, use) => {
      const settings = inputs();
      let context;
      try {
        context = await chromium.launchPersistentContext(settings.profile, {
          channel: "msedge",
          headless: false,
          viewport: { width: 1440, height: 1000 },
          locale: "en-US",
        });
        context.setDefaultTimeout(30_000);
      } catch (error) {
        throw new Error(
          "Precondition: the dedicated profile cannot be opened; close its other browser first.",
          { cause: error },
        );
      }
      try {
        const probe = await context.newPage();
        try {
          await openList(probe, settings.appUrl);
          await expect(
            probe.getByRole("button", { name: "Solicitudes POC", exact: true }),
          ).toBeVisible({ timeout: 30_000 });
        } catch (error) {
          throw new Error(
            "Precondition: the dedicated profile requires interactive authentication, " +
              "or the deployed POC app is unavailable. No functional scenario has passed.",
            { cause: error },
          );
        }
        await probe.close();
        await use({ context, appUrl: settings.appUrl });
      } finally {
        await context.close();
      }
    },
    { scope: "worker", timeout: 120_000 },
  ],
});

async function openList(page, appUrl) {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  try {
    await expect(
      page.getByRole("treegrid", { name: "All Requests", exact: true }),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("treeitem", { name: "Requests", exact: true })).toBeVisible();
  } catch (error) {
    if (
      await page.getByRole("heading", { name: "Sign in to continue", exact: true }).isVisible()
    ) {
      throw new Error(
        "Precondition: the dedicated browser session requires interactive authentication.",
        { cause: error },
      );
    }
    throw error;
  }
}

async function choosePriority(page, label) {
  await page.bringToFront();
  const priority = page.getByRole("combobox", { name: "Priority", exact: true });
  await priority.click();
  await page.getByRole("option", { name: label, exact: true }).click();
  await expect(priority).toContainText(label);
}

async function showNotifications(page) {
  const summary = page.getByRole("button", {
    name: /^You have \d+ notifications?\. Select to view\.$/,
  });
  if (await summary.isVisible()) await summary.click();
}

async function searchTitle(page, title) {
  const search = page.getByRole("main").getByRole("searchbox");
  const [query] = await Promise.all([
    page.waitForResponse((item) => {
      const request = item.request();
      return (
        ["fetch", "xhr"].includes(request.resourceType()) &&
        request.method() === "GET" &&
        new URL(item.url()).origin === new URL(page.url()).origin &&
        item.url().includes("/api/data/") &&
        decodeURIComponent(item.url()).includes(title)
      );
    }),
    (async () => {
      await search.fill(title);
      await search.press("Enter");
    })(),
  ]);
  expect(query.ok(), "The grid's title query must complete successfully.").toBeTruthy();
  await query.finished();
  const payload = await query.json();
  expect(Array.isArray(payload.value), "The grid query must return Dataverse records.").toBeTruthy();
  return {
    grid: page.getByRole("treegrid", { name: "All Requests", exact: true }),
    matches: payload.value.filter((record) => record.cap_name === title),
  };
}

function recordId(page) {
  const value = new URL(page.url()).searchParams.get("id")?.replace(/[{}]/g, "");
  return value && guidPattern.test(value) ? value.toLowerCase() : null;
}

async function evidence(page, testInfo, record) {
  record.recordId = page.isClosed() ? record.recordId : recordId(page) || record.recordId;
  const content = JSON.stringify(record, null, 2);
  console.log(`REQUESTS-POC ${JSON.stringify(record)}`);
  await writeFile(testInfo.outputPath("record.json"), content);
  await testInfo.attach("synthetic-record", { body: content, contentType: "application/json" });
  if (!record.reopened && !page.isClosed()) {
    const form = page.getByRole("form");
    if (await form.count() === 1) {
      await testInfo.attach("form-state", {
        body: await form.ariaSnapshot(),
        contentType: "text/plain",
      });
    }
  }
}

test("High with description persists after reopening", async ({ poc, runId }, testInfo) => {
  const page = await poc.context.newPage();
  const description = "Synthetic request for the valid POC scenario.";
  const record = {
    runId,
    scenario: "valid",
    title: `REQUESTS-POC-${runId}-valid`,
    recordId: null,
    reopened: false,
  };
  try {
    await openList(page, poc.appUrl);
    await page.getByRole("menuitem", { name: "New Create a new Request record.", exact: true }).click();
    await expect(page).toHaveTitle(/Request: Solicitud POC:/);
    await expect(page.getByRole("combobox", { name: "Priority", exact: true })).toContainText("Medium");
    await expect(page.getByRole("combobox", { name: "Status", exact: true })).toContainText("New");
    await choosePriority(page, "High");
    await showNotifications(page);
    await expect(page.getByText(validationMessage, { exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Description", exact: true }).fill(description);
    await page.getByRole("textbox", { name: "Name", exact: true }).fill(record.title);
    await page.getByRole("textbox", { name: "Description", exact: true }).click();
    await expect(page.getByText(validationMessage, { exact: true })).toBeHidden();
    await page.getByRole("menuitem", { name: "Save (CTRL+S) Save this Request.", exact: true }).click();
    await expect.poll(() => recordId(page), { timeout: 45_000 }).toBeTruthy();
    record.recordId = recordId(page);
    await openList(page, poc.appUrl);
    const { grid, matches } = await searchTitle(page, record.title);
    expect(matches).toHaveLength(1);
    expect(matches[0].cap_requestid.toLowerCase()).toBe(record.recordId);
    await grid.getByRole("link", { name: record.title, exact: true }).click();
    await expect(page).toHaveTitle(/Request: Solicitud POC:/);
    await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(record.title);
    await expect(page.getByRole("combobox", { name: "Priority", exact: true })).toContainText("High");
    await expect(page.getByRole("textbox", { name: "Description", exact: true })).toHaveValue(description);
    await expect(page.getByRole("combobox", { name: "Status", exact: true })).toContainText("New");
    expect(recordId(page)).toBe(record.recordId);
    record.reopened = true;
  } finally {
    await evidence(page, testInfo, record);
    await page.close();
  }
});

test("High without description blocks, then Low persists", async ({ poc, runId }, testInfo) => {
  const page = await poc.context.newPage();
  let verificationPage;
  const record = {
    runId,
    scenario: "recovery",
    title: `REQUESTS-POC-${runId}-recovery`,
    recordId: null,
    blocked: false,
    reopened: false,
  };
  try {
    await openList(page, poc.appUrl);
    await page.getByRole("menuitem", { name: "New Create a new Request record.", exact: true }).click();
    await expect(page).toHaveTitle(/Request: Solicitud POC:/);
    await expect(page.getByRole("combobox", { name: "Priority", exact: true })).toContainText("Medium");
    await expect(page.getByRole("combobox", { name: "Status", exact: true })).toContainText("New");
    await choosePriority(page, "High");
    await showNotifications(page);
    await expect(page.getByText(validationMessage, { exact: true })).toBeVisible();
    await page.getByRole("textbox", { name: "Name", exact: true }).fill(record.title);
    await page.getByRole("textbox", { name: "Description", exact: true }).click();
    await page.getByRole("menuitem", { name: "Save (CTRL+S) Save this Request.", exact: true }).click();
    await showNotifications(page);
    await expect(page.getByText(validationMessage, { exact: true })).toBeVisible();
    expect(recordId(page)).toBeNull();
    await page.keyboard.press("Escape");
    verificationPage = await poc.context.newPage();
    await openList(verificationPage, poc.appUrl);
    const { grid: absentGrid, matches: absentMatches } = await searchTitle(verificationPage, record.title);
    expect(absentMatches).toHaveLength(0);
    await expect(absentGrid.getByText(record.title, { exact: true })).toHaveCount(0);
    record.blocked = true;
    await choosePriority(page, "Low");
    await showNotifications(page);
    await expect(page.getByText(validationMessage, { exact: true })).toBeHidden();
    await page.keyboard.press("Escape");
    await page.getByRole("menuitem", { name: "Save (CTRL+S) Save this Request.", exact: true }).click();
    await expect.poll(() => recordId(page), { timeout: 45_000 }).toBeTruthy();
    record.recordId = recordId(page);
    await openList(page, poc.appUrl);
    const { grid, matches } = await searchTitle(page, record.title);
    expect(matches).toHaveLength(1);
    expect(matches[0].cap_requestid.toLowerCase()).toBe(record.recordId);
    await grid.getByRole("link", { name: record.title, exact: true }).click();
    await expect(page).toHaveTitle(/Request: Solicitud POC:/);
    await expect(page.getByRole("textbox", { name: "Name", exact: true })).toHaveValue(record.title);
    await expect(page.getByRole("combobox", { name: "Priority", exact: true })).toContainText("Low");
    await expect(page.getByRole("textbox", { name: "Description", exact: true })).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Status", exact: true })).toContainText("New");
    expect(recordId(page)).toBe(record.recordId);
    record.reopened = true;
  } finally {
    await evidence(page, testInfo, record);
    if (verificationPage) await verificationPage.close();
    await page.close();
  }
});
