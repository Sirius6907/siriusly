import pc from "picocolors";

const SIRIUSLY_ART = [
  " ██████╗██╗██████╗ ██╗██╗   ██╗███████╗██╗     ██╗   ██╗",
  "██╔════╝██║██╔══██╗██║██║   ██║██╔════╝██║     ╚██╗ ██╔╝",
  "╚█████╗ ██║██████╔╝██║██║   ██║███████╗██║      ╚████╔╝ ",
  " ╚═══██╗██║██╔══██╗██║██║   ██║╚════██║██║       ╚██╔╝  ",
  "██████╔╝██║██║  ██║██║╚██████╔╝███████║███████╗   ██║   ",
  "╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ",
] as const;

const TAGLINE = "Open-source orchestration for zero-human companies";

export function printSiriusEcoSystemCliBanner(): void {
  const lines = [
    "",
    ...SIRIUSLY_ART.map((line) => pc.cyan(line)),
    pc.blue("  ───────────────────────────────────────────────────────"),
    pc.bold(pc.white(`  ${TAGLINE}`)),
    "",
  ];

  console.log(lines.join("\n"));
}
