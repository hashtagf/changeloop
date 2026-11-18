import { createTaskBoard } from "./tasks.js";

// A stand-in for the tasks API so the page renders without a server.
const sample = [
  { id: "1", title: "Write the release notes" },
  { id: "2", title: "Review the onboarding copy" }
];
createTaskBoard(document.getElementById("app"), {
  load: () => new Promise((done) => setTimeout(() => done(sample), 300))
});
