import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().default(""),
  keyPoints: z.string().default(""),
  extra: z.string().default(""),
  tone: z.enum(["formal", "friendly", "professional"]),
});

const MeetingInput = z.object({ notes: z.string().min(1) });

const PlannerInput = z.object({
  tasks: z.string().min(1),
  hoursPerDay: z.string().default("8"),
  workStart: z.string().default("08:00"),
  workEnd: z.string().default("17:00"),
  scheduleType: z.enum(["daily", "weekly"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const { runText } = await import("./ai.server");
    const prompt = [
      `Purpose: ${data.purpose}`,
      `Recipient / context: ${data.recipient || "not specified"}`,
      `Key points: ${data.keyPoints || "not specified"}`,
      `Additional information: ${data.extra || "none"}`,
      `Tone: ${data.tone}`,
    ].join("\n");

    const text = await runText(
      `You are a workplace communication assistant. Write a complete, polished email in a ${data.tone} tone.
Return plain text only, starting with "Subject: ...", then a blank line, then greeting, body paragraphs and a sign-off.
Keep it concise (under 250 words), specific and free of placeholder brackets unless information is genuinely missing.`,
      prompt,
    );

    return { email: text };
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const { runObject } = await import("./ai.server");
    const schema = z.object({
      summary: z.string(),
      actionItems: z.array(
        z.object({
          task: z.string(),
          owner: z.string(),
          deadline: z.string(),
        }),
      ),
      decisions: z.array(z.string()),
      deadlines: z.array(z.object({ item: z.string(), date: z.string() })),
    });

    return runObject(
      `You summarise workplace meeting notes. Extract an accurate summary (3-6 sentences), action items with the responsible person and deadline, key decisions, and important dates.
Use "Unassigned" or "Not specified" when information is missing. Never invent facts that are not in the notes.`,
      data.notes,
      schema,
      {
        summary: "",
        actionItems: [],
        decisions: [],
        deadlines: [],
      },
    );
  });

export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const { runObject } = await import("./ai.server");
    const schema = z.object({
      overview: z.string(),
      days: z.array(
        z.object({
          day: z.string(),
          blocks: z.array(
            z.object({
              start: z.string(),
              end: z.string(),
              title: z.string(),
              type: z.string(),
              priority: z.string(),
            }),
          ),
        }),
      ),
      notes: z.array(z.string()),
    });

    const prompt = [
      `Schedule type: ${data.scheduleType === "weekly" ? "weekly (Monday to Friday)" : "single day"}`,
      `Working window: ${data.workStart} to ${data.workEnd}`,
      `Available hours per day: ${data.hoursPerDay}`,
      `Tasks (name, deadline, priority, estimated duration):`,
      data.tasks,
    ].join("\n");

    return runObject(
      `You are a scheduling assistant. Build a realistic, conflict-free schedule.
Rules: respect the working window; schedule high-priority and deadline-driven tasks earliest; include a 15 minute break every ~2 hours and a lunch break; never overlap blocks; push lower-priority work later or to another day when the day is full.
Each block "type" is one of: task, break, lunch, admin, buffer. Each block "priority" is one of: high, medium, low, none. Times use 24-hour HH:MM.
For a daily schedule return exactly one day. For a weekly schedule return Monday to Friday.`,
      prompt,
      schema,
      { overview: "", days: [], notes: [] },
    );
  });
