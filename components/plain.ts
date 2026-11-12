// Display only: lib/ labels its seeded sources "(example data)"; the footer carries the demo-data note instead.
export const plainSource = (s: string) => s.replace(/ \(example(?: data)?\)|example,? /gi, "");
