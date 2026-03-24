<script lang="ts">
  import { getErrorsAtPath, setAtPath } from "@uniforma/core";
  import { Form, components } from "@uniforma/svelte";
  import { z } from "zod";

  const profileSchema = z.object({
    fullName: z
      .string()
      .min(2, "Tell us your full name")
      .default("Ada Lovelace"),
    email: z
      .string()
      .email("Use a valid email address")
      .default("ada@uniforma.dev"),
    role: z.enum(["maker", "researcher", "operator"]).default("maker"),
    age: z.number().int().min(18, "Adult access only").default(28),
    newsletter: z.boolean().default(true),
    studio: z.object({
      city: z.string().min(2).default("London"),
      seats: z.number().int().min(1).default(4),
    }),
    links: z
      .array(z.string().url("Each link must be a URL"))
      .default(["https://uniforma.dev"]),
  });

  let value = {
    fullName: "Ada Lovelace",
    email: "ada@uniforma.dev",
    role: "maker",
    age: 28,
    newsletter: true,
    studio: {
      city: "London",
      seats: 4,
    },
    links: ["https://uniforma.dev"],
  };

  let submittedValue = "";

  function handleSubmit(event: CustomEvent<unknown>) {
    submittedValue = JSON.stringify(event.detail, null, 2);
  }

  function loadExample() {
    const seeded = setAtPath(value, ["studio", "city"], "Tokyo");
    const withLinks = setAtPath(
      seeded,
      ["links"],
      ["https://uniforma.dev", "https://example.com/docs"],
    );
    value = withLinks as typeof value;
  }

  function handleReset(event: CustomEvent<unknown>) {
    submittedValue = JSON.stringify(event.detail, null, 2);
  }
</script>

<svelte:head>
  <title>uniforma playground</title>
  <meta
    name="description"
    content="Svelte-first forms built from Standard JSON Schema and validated with Standard Schema."
  />
</svelte:head>

<div class="shell">
  <header class="hero">
    <div>
      <p class="eyebrow">uniforma</p>
      <h1>Schema-native forms for Svelte, without validator lock-in.</h1>
      <p class="lede">
        Render from Standard JSON Schema. Validate with Standard Schema. Keep
        one schema object and let the form stay typed from input to submitted
        output.
      </p>
    </div>

    <aside class="hero-card">
      <span>Current state</span>
      <dl>
        <div>
          <dt>Schema</dt>
          <dd>dual standard</dd>
        </div>
        <div>
          <dt>Rendering</dt>
          <dd>JSON Schema</dd>
        </div>
        <div>
          <dt>Validation</dt>
          <dd>Standard Schema</dd>
        </div>
        <div>
          <dt>Output</dt>
          <dd>{submittedValue ? "captured" : "waiting"}</dd>
        </div>
      </dl>
    </aside>
  </header>

  <main class="layout">
    <section class="panel form-panel">
      <div class="panel-head">
        <div>
          <p class="label">Playground</p>
          <h2>Profile intake</h2>
        </div>

        <div class="actions">
          <button type="button" class="ghost" on:click={loadExample}
            >Load example</button
          >
        </div>
      </div>

      <Form
        schema={profileSchema}
        {components}
        bind:value
        validateOn={["blur", "submit"]}
        on:submit={handleSubmit}
        on:reset={handleReset}
        let:errors
        let:valid
        let:validating
        let:submitting
      >
        {#if getErrorsAtPath(errors, []).length > 0}
          <div class="notice error">
            {#each getErrorsAtPath(errors, []) as message (message)}
              <p>{message}</p>
            {/each}
          </div>
        {/if}

        <div class="submit-row">
          <div class="status-line">
            <span>{valid ? "ready" : "needs attention"}</span>
            <span
              >{validating
                ? "validating"
                : submitting
                  ? "submitting"
                  : "idle"}</span
            >
          </div>
          <div class="actions">
            <button type="reset" class="ghost">Reset</button>
            <button type="submit" class="primary">Validate and submit</button>
          </div>
        </div>
      </Form>
    </section>

    <section class="panel data-panel">
      <div class="stack">
        <div>
          <p class="label">Input state</p>
          <h2>Live form data</h2>
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>

      <div class="stack">
        <div>
          <p class="label">Submitted output</p>
          <h2>Validated payload</h2>
        </div>
        <pre>{submittedValue ||
            "Submit the form to inspect validated output."}</pre>
      </div>
    </section>
  </main>
</div>
