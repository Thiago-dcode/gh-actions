const core = require("@actions/core");

// Plain function with the logic: easy to test on its own
function buildGreeting(name, shout) {
  const text = `Hello, ${name}!`;
  return shout ? text.toUpperCase() : text;
}

async function run() {
  try {
    const name = core.getInput("who", { required: true }); // read an input
    const shout = core.getBooleanInput("shout");

    console.log("INPUTS", name, shout); // "true"/"false" → boolean

    core.info("INPUTS", name, shout);
    if (name.length > 50) {
      throw new Error("`who` must be 50 characters or fewer");
    }

    const greeting = buildGreeting(name, shout);
    core.info(greeting); // log line
    core.setOutput("greeting", greeting); // return a value
  } catch (error) {
    core.setFailed(error.message); // fail the step (exit code 1)
  }
}

run();
